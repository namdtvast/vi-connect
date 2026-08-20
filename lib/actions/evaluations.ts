"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPartyScope, partyOrganizationIdsOfMatch, requireRole } from "@/lib/rbac";
import type { ActionState } from "@/lib/actions/auth";

const matchWithPartiesInclude = {
  need: true,
  supply: true,
  expertProfile: true,
} as const;

const evaluationSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  criteria: z.string().min(3, "Tiêu chí đánh giá tối thiểu 3 ký tự"),
  note: z.string().optional(),
});

/** Cấu phần 08 (v1 — VC-KT-018): đánh giá hiệu quả dự án, append-only. */
export async function createEvaluationAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { match: { include: matchWithPartiesInclude } },
  });
  assertPartyScope(user, partyOrganizationIdsOfMatch(project.match));

  const parsed = evaluationSchema.safeParse({
    score: formData.get("score"),
    criteria: formData.get("criteria"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const evaluation = await db.evaluation.create({
    data: {
      projectId,
      evaluatedById: user.id,
      score: parsed.data.score / 100,
      criteria: parsed.data.criteria,
      note: parsed.data.note,
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE_EVALUATION",
      entity: "Evaluation",
      entityId: evaluation.id,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}
