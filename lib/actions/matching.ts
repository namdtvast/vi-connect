"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertOrgScope, ForbiddenError, requireRole } from "@/lib/rbac";
import { scoreNeedAgainstExpert, scoreNeedAgainstSupply, type MatchReason } from "@/lib/matching";
import {
  cosineSimilarity,
  embedText,
  EMBEDDING_MODEL,
  isEmbeddingsConfigured,
} from "@/lib/integrations/embeddings";
import { saveUploadedFile } from "@/lib/uploads";
import { FIELDS } from "@/lib/taxonomy";
import type { ActionState } from "@/lib/actions/auth";
import type { MatchStage, NeedStatus, SupplyStatus } from "@/lib/generated/prisma/enums";

const needSchema = z.object({
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
  fields: z.array(z.string()).min(1, "Chọn ít nhất 1 lĩnh vực"),
  budgetVnd: z.string().optional(),
});

export async function createNeedAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  if (!user.organizationId) return { error: "Tài khoản chưa gắn với tổ chức." };

  const validCodes = new Set<string>(FIELDS.map((f) => f.code));
  const parsed = needSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    fields: formData.getAll("fields").map(String).filter((f) => validCodes.has(f)),
    budgetVnd: formData.get("budgetVnd") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  let attachmentPath: string | undefined;
  let attachmentName: string | undefined;
  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    try {
      const saved = await saveUploadedFile(attachment, "needs");
      attachmentPath = saved.path;
      attachmentName = saved.name;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Không thể lưu tệp đính kèm." };
    }
  }

  await db.need.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      fields: parsed.data.fields,
      organizationId: user.organizationId,
      budgetVnd: parsed.data.budgetVnd ? BigInt(parsed.data.budgetVnd) : null,
      status: "PUBLISHED",
      attachmentPath,
      attachmentName,
    },
  });

  revalidatePath("/dashboard/needs");
  return { success: true };
}

/** Cấu phần 04: đóng/mở lại nhu cầu — vòng đời trước đây chỉ có tạo, chưa có cập nhật trạng thái (VC-KT-002 Phụ lục B8). */
export async function updateNeedStatusAction(needId: string, status: NeedStatus) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const need = await db.need.findUniqueOrThrow({ where: { id: needId } });
  assertOrgScope(user, need.organizationId);

  await db.need.update({ where: { id: needId }, data: { status } });

  await db.auditLog.create({
    data: { userId: user.id, action: `NEED_STATUS_${status}`, entity: "Need", entityId: needId },
  });

  revalidatePath(`/dashboard/needs/${needId}`);
  revalidatePath("/dashboard/needs");
}

const supplySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  type: z.enum(["TECHNOLOGY", "SOLUTION", "EXPERT_SERVICE", "PATENT"]),
  fields: z.array(z.string()).min(1),
  trl: z.string().optional(),
});

export async function createSupplyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN", "ADMIN");
  if (!user.organizationId) return { error: "Tài khoản chưa gắn với tổ chức." };

  const validCodes = new Set<string>(FIELDS.map((f) => f.code));
  const parsed = supplySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    fields: formData.getAll("fields").map(String).filter((f) => validCodes.has(f)),
    trl: formData.get("trl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await db.supply.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      fields: parsed.data.fields,
      trl: parsed.data.trl ? Number(parsed.data.trl) : null,
      organizationId: user.organizationId,
      status: "PUBLISHED",
    },
  });

  revalidatePath("/dashboard/supplies");
  return { success: true };
}

/** Cấu phần 02: lưu trữ/mở lại nguồn cung — vòng đời trước đây chỉ có tạo, chưa
 * có cập nhật trạng thái (cùng dạng đã vá cho Need ở cấu phần 04). */
export async function updateSupplyStatusAction(supplyId: string, status: SupplyStatus) {
  const user = await requireRole("SUPERADMIN", "ADMIN");
  const supply = await db.supply.findUniqueOrThrow({ where: { id: supplyId } });
  if (!supply.organizationId) {
    throw new ForbiddenError("Nguồn cung này không gắn với tổ chức nào.");
  }
  assertOrgScope(user, supply.organizationId);

  await db.supply.update({ where: { id: supplyId }, data: { status } });

  await db.auditLog.create({
    data: { userId: user.id, action: `SUPPLY_STATUS_${status}`, entity: "Supply", entityId: supplyId },
  });

  revalidatePath("/dashboard/supplies");
}

/** Số ứng viên tối đa được gửi qua embedding API mỗi lần chạy — chặn số lệnh
 * gọi mạng bất kể pool dữ liệu lớn cỡ nào, bảo vệ hạn mức free tier. */
const SEMANTIC_RERANK_TOP_K = 15;

type MatchCandidate = {
  supplyId?: string;
  expertProfileId?: string;
  score: number;
  reasons: MatchReason[];
  /** Text gửi cho embedding API khi AI hỗ trợ được bật (GEMINI_API_KEY). */
  embeddingText: string;
  recompute: (semanticSimilarity: number) => { score: number; reasons: MatchReason[] };
};

/** Cấu phần 05: chạy lại đề xuất ghép nối cho 1 nhu cầu (explainable scoring,
 * tuỳ chọn tăng cường bằng độ tương đồng ngữ nghĩa AI — xem lib/matching.ts
 * và lib/integrations/embeddings.ts. AI chỉ bổ sung 1 reason có giải thích,
 * không tự động chuyển trạng thái match — con người vẫn quyết định qua
 * updateMatchStageAction/convertMatchToProjectAction). */
export async function generateMatchesAction(needId: string) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");

  const need = await db.need.findUniqueOrThrow({ where: { id: needId } });
  assertOrgScope(user, need.organizationId);

  // Idempotent: drop previously auto-suggested matches that haven't progressed,
  // keep anything the user already acted on.
  await db.match.deleteMany({ where: { needId, stage: "SUGGESTED" } });

  const [supplies, experts] = await Promise.all([
    db.supply.findMany({ where: { status: "PUBLISHED" } }),
    db.expertProfile.findMany({ where: { verificationStatus: { in: ["VERIFIED", "PENDING"] } } }),
  ]);

  const candidates: MatchCandidate[] = [
    ...supplies.map((supply): MatchCandidate => {
      const { score, reasons } = scoreNeedAgainstSupply(need, supply);
      return {
        supplyId: supply.id,
        score,
        reasons,
        embeddingText: `${supply.title} ${supply.description}`,
        recompute: (semanticSimilarity) =>
          scoreNeedAgainstSupply(need, supply, { semanticSimilarity }),
      };
    }),
    ...experts.map((expert): MatchCandidate => {
      const { score, reasons } = scoreNeedAgainstExpert(need, expert);
      return {
        expertProfileId: expert.id,
        score,
        reasons,
        embeddingText: `${expert.bio ?? ""} ${expert.skills.join(" ")}`,
        recompute: (semanticSimilarity) =>
          scoreNeedAgainstExpert(need, expert, { semanticSimilarity }),
      };
    }),
  ];

  // Tuỳ chọn: tăng cường top-K ứng viên bằng embedding AI. Không cấu hình
  // GEMINI_API_KEY, hoặc bất kỳ lệnh gọi nào lỗi/timeout, đều fallback im
  // lặng về điểm số xác định (deterministic) ở trên — không bao giờ chặn
  // việc tạo đề xuất ghép nối.
  let augmentedCount = 0;
  if (isEmbeddingsConfigured()) {
    const needEmbedding = await embedText(`${need.title} ${need.description}`);
    if (needEmbedding) {
      const topK = [...candidates].sort((a, b) => b.score - a.score).slice(0, SEMANTIC_RERANK_TOP_K);
      const candidateEmbeddings = await Promise.all(topK.map((c) => embedText(c.embeddingText)));

      topK.forEach((candidate, i) => {
        const candidateEmbedding = candidateEmbeddings[i];
        if (!candidateEmbedding) return;
        const semanticSimilarity = cosineSimilarity(needEmbedding, candidateEmbedding);
        const recomputed = candidate.recompute(semanticSimilarity);
        candidate.score = recomputed.score;
        candidate.reasons = recomputed.reasons;
        augmentedCount++;
      });
    }
  }

  const created: { score: number }[] = [];
  for (const candidate of candidates) {
    if (candidate.score <= 0.15) continue;
    await db.match.create({
      data: {
        needId,
        supplyId: candidate.supplyId,
        expertProfileId: candidate.expertProfileId,
        score: candidate.score,
        reasons: candidate.reasons,
        stage: "SUGGESTED",
      },
    });
    created.push({ score: candidate.score });
  }

  if (augmentedCount > 0) {
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "MATCH_AI_ASSISTED",
        entity: "Need",
        entityId: needId,
        meta: { model: EMBEDDING_MODEL, candidatesAugmented: augmentedCount },
      },
    });
  }

  revalidatePath(`/dashboard/needs/${needId}`);
  return created.length;
}

export async function updateMatchStageAction(matchId: string, stage: MatchStage) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const existing = await db.match.findUniqueOrThrow({
    where: { id: matchId },
    include: { need: true },
  });
  assertOrgScope(user, existing.need.organizationId);

  const match = await db.match.update({ where: { id: matchId }, data: { stage } });

  await db.auditLog.create({
    data: { userId: user.id, action: `MATCH_STAGE_${stage}`, entity: "Match", entityId: matchId },
  });

  revalidatePath(`/dashboard/needs/${match.needId}`);
  revalidatePath("/dashboard/matches");
}
