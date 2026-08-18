"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertOrgScope, requireRole, requireUser } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/uploads";
import { FIELDS } from "@/lib/taxonomy";
import type { ActionState } from "@/lib/actions/auth";
import type { ChallengeStatus, SolutionStatus } from "@/lib/generated/prisma/enums";

const challengeSchema = z.object({
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  problem: z.string().min(10, "Mô tả vấn đề tối thiểu 10 ký tự"),
  goal: z.string().optional(),
  fields: z.array(z.string()).min(1, "Chọn ít nhất 1 lĩnh vực"),
  budgetVnd: z.string().optional(),
});

/** Cấu phần 06.1-06.5: tiếp nhận, chuẩn hóa và công bố bài toán. */
export async function createChallengeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  if (!user.organizationId) return { error: "Tài khoản chưa gắn với tổ chức." };

  const validCodes = new Set<string>(FIELDS.map((f) => f.code));
  const parsed = challengeSchema.safeParse({
    title: formData.get("title"),
    problem: formData.get("problem"),
    goal: formData.get("goal") || undefined,
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
      const saved = await saveUploadedFile(attachment, "challenges");
      attachmentPath = saved.path;
      attachmentName = saved.name;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Không thể lưu tệp đính kèm." };
    }
  }

  await db.challenge.create({
    data: {
      title: parsed.data.title,
      problem: parsed.data.problem,
      goal: parsed.data.goal,
      fields: parsed.data.fields,
      hasBudget: !!parsed.data.budgetVnd,
      budgetVnd: parsed.data.budgetVnd ? BigInt(parsed.data.budgetVnd) : null,
      organizationId: user.organizationId,
      status: "PUBLISHED",
      attachmentPath,
      attachmentName,
    },
  });

  revalidatePath("/dashboard/challenges");
  return { success: true };
}

export async function setChallengeStatusAction(challengeId: string, status: ChallengeStatus) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const challenge = await db.challenge.findUniqueOrThrow({ where: { id: challengeId } });
  assertOrgScope(user, challenge.organizationId);

  await db.challenge.update({ where: { id: challengeId }, data: { status } });
  revalidatePath(`/dashboard/challenges/${challengeId}`);
}

const solutionSchema = z.object({
  summary: z.string().min(10, "Tóm tắt tối thiểu 10 ký tự"),
  approach: z.string().min(10, "Cách tiếp cận tối thiểu 10 ký tự"),
});

/** Cấu phần 06.6: nhận giải pháp cho bài toán. */
export async function submitSolutionAction(
  challengeId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = solutionSchema.safeParse({
    summary: formData.get("summary"),
    approach: formData.get("approach"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await db.solution.create({
    data: {
      challengeId,
      submittedById: user.id,
      summary: parsed.data.summary,
      approach: parsed.data.approach,
      status: "SUBMITTED",
    },
  });

  revalidatePath(`/dashboard/challenges/${challengeId}`);
  return { success: true };
}

/** Cấu phần 06.7-06.8: đánh giá giải pháp & ghép nối nhóm giải quyết. */
export async function reviewSolutionAction(
  solutionId: string,
  status: SolutionStatus,
  reviewScore?: number
) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const solution = await db.solution.update({
    where: { id: solutionId },
    data: { status, reviewScore },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: `REVIEW_SOLUTION_${status}`,
      entity: "Solution",
      entityId: solutionId,
    },
  });

  revalidatePath(`/dashboard/challenges/${solution.challengeId}`);
}
