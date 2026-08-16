"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/rbac";
import { scoreNeedAgainstExpert, scoreNeedAgainstSupply } from "@/lib/matching";
import { FIELDS } from "@/lib/taxonomy";
import type { ActionState } from "@/lib/actions/auth";
import type { MatchStage } from "@/lib/generated/prisma/enums";

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
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN", "ENTERPRISE");
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

  await db.need.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      fields: parsed.data.fields,
      organizationId: user.organizationId,
      budgetVnd: parsed.data.budgetVnd ? BigInt(parsed.data.budgetVnd) : null,
      status: "PUBLISHED",
    },
  });

  revalidatePath("/dashboard/needs");
  return { success: true };
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
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN");
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

/** Cấu phần 05: chạy lại đề xuất ghép nối cho 1 nhu cầu (explainable scoring). */
export async function generateMatchesAction(needId: string) {
  await requireUser();

  const need = await db.need.findUniqueOrThrow({ where: { id: needId } });

  // Idempotent: drop previously auto-suggested matches that haven't progressed,
  // keep anything the user already acted on.
  await db.match.deleteMany({ where: { needId, stage: "SUGGESTED" } });

  const [supplies, experts] = await Promise.all([
    db.supply.findMany({ where: { status: "PUBLISHED" } }),
    db.expertProfile.findMany({ where: { verificationStatus: { in: ["VERIFIED", "PENDING"] } } }),
  ]);

  const created: { score: number }[] = [];

  for (const supply of supplies) {
    const { score, reasons } = scoreNeedAgainstSupply(need, supply);
    if (score > 0.15) {
      await db.match.create({
        data: { needId, supplyId: supply.id, score, reasons, stage: "SUGGESTED" },
      });
      created.push({ score });
    }
  }

  for (const expert of experts) {
    const { score, reasons } = scoreNeedAgainstExpert(need, expert);
    if (score > 0.15) {
      await db.match.create({
        data: { needId, expertProfileId: expert.id, score, reasons, stage: "SUGGESTED" },
      });
      created.push({ score });
    }
  }

  revalidatePath(`/dashboard/needs/${needId}`);
  return created.length;
}

export async function updateMatchStageAction(matchId: string, stage: MatchStage) {
  const user = await requireUser();
  const match = await db.match.update({ where: { id: matchId }, data: { stage } });

  await db.auditLog.create({
    data: { userId: user.id, action: `MATCH_STAGE_${stage}`, entity: "Match", entityId: matchId },
  });

  revalidatePath(`/dashboard/needs/${match.needId}`);
  revalidatePath("/dashboard/matches");
}
