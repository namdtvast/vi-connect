"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  assertPartyScope,
  ForbiddenError,
  partyOrganizationIdsOfMatch,
  requireRole,
} from "@/lib/rbac";
import type { ActionState } from "@/lib/actions/auth";
import type { AgreementType, MilestoneStatus } from "@/lib/generated/prisma/enums";

const matchWithPartiesInclude = {
  need: true,
  supply: true,
  expertProfile: true,
} as const;

/** Cấu phần 04: chuyển 1 match đã chấp nhận thành dự án hợp tác. */
export async function convertMatchToProjectAction(matchId: string) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");

  const match = await db.match.findUniqueOrThrow({
    where: { id: matchId },
    include: { ...matchWithPartiesInclude, expertProfile: { include: { user: true } } },
  });
  assertPartyScope(user, partyOrganizationIdsOfMatch(match));

  const existing = await db.project.findUnique({ where: { matchId } });
  if (existing) return existing.id;

  const partnerLabel =
    match.supply?.title ?? match.expertProfile?.user?.name ?? "đối tác";

  const project = await db.project.create({
    data: {
      matchId,
      title: `${match.need.title} — ${partnerLabel}`,
      summary: `Dự án được tạo từ ghép nối (match score ${(match.score * 100).toFixed(0)}%).`,
      status: "PLANNING",
      milestones: {
        create: [
          { title: "Thống nhất phạm vi & ký thoả thuận hợp tác", status: "PLANNED" },
        ],
      },
    },
  });

  await db.match.update({ where: { id: matchId }, data: { stage: "CONVERTED_PROJECT" } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CONVERT_MATCH_TO_PROJECT",
      entity: "Project",
      entityId: project.id,
    },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/needs/${match.needId}`);
  return project.id;
}

const milestoneSchema = z.object({
  title: z.string().min(3, "Tên mốc tối thiểu 3 ký tự"),
  dueDate: z.string().optional(),
});

export async function addMilestoneAction(
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

  const parsed = milestoneSchema.safeParse({
    title: formData.get("title"),
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await db.milestone.create({
    data: {
      projectId,
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: "PLANNED",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function setMilestoneStatusAction(
  projectId: string,
  milestoneId: string,
  status: MilestoneStatus
) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const milestone = await db.milestone.findUniqueOrThrow({
    where: { id: milestoneId },
    include: { project: { include: { match: { include: matchWithPartiesInclude } } } },
  });
  if (milestone.projectId !== projectId) {
    throw new ForbiddenError("Milestone không thuộc dự án này.");
  }
  assertPartyScope(user, partyOrganizationIdsOfMatch(milestone.project.match));

  await db.milestone.update({ where: { id: milestoneId }, data: { status } });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function createAgreementAction(
  projectId: string,
  type: AgreementType,
  valueVnd?: string
) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { match: { include: matchWithPartiesInclude } },
  });
  assertPartyScope(user, partyOrganizationIdsOfMatch(project.match));

  await db.agreement.upsert({
    where: { projectId },
    create: {
      projectId,
      type,
      status: "DRAFT",
      valueVnd: valueVnd ? BigInt(valueVnd) : null,
    },
    update: { type, valueVnd: valueVnd ? BigInt(valueVnd) : null },
  });

  await db.auditLog.create({
    data: { userId: user.id, action: "CREATE_AGREEMENT", entity: "Project", entityId: projectId },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function signAgreementAction(projectId: string) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { match: { include: matchWithPartiesInclude } },
  });
  assertPartyScope(user, partyOrganizationIdsOfMatch(project.match));

  await db.agreement.update({
    where: { projectId },
    data: { status: "SIGNED", signedAt: new Date() },
  });

  await db.auditLog.create({
    data: { userId: user.id, action: "SIGN_AGREEMENT", entity: "Project", entityId: projectId },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}
