"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPartyScope, partyOrganizationIdsOfMatch, requireRole } from "@/lib/rbac";
import { ForbiddenError } from "@/lib/domain/access-control";
import type { ActionState } from "@/lib/actions/auth";

const matchWithPartiesInclude = {
  need: true,
  supply: true,
  expertProfile: true,
} as const;

const memberSchema = z.object({
  userId: z.string().min(1, "Chọn thành viên"),
  role: z.string().min(2, "Vai trò tối thiểu 2 ký tự"),
});

/** Cấu phần 09 (v1 — VC-KT-019): thêm thành viên vào đội thực hiện dự án. */
export async function addProjectMemberAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { match: { include: matchWithPartiesInclude } },
  });
  const partyOrgIds = partyOrganizationIdsOfMatch(project.match);
  assertPartyScope(user, partyOrgIds);

  const parsed = memberSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  // Không tin userId do client gửi mà không kiểm tra — chỉ chấp nhận người
  // thuộc 1 trong 2 tổ chức của Match gốc, không cho thêm người ngoài dự án.
  const targetUser = await db.user.findUnique({ where: { id: parsed.data.userId } });
  if (!targetUser || !targetUser.organizationId || !partyOrgIds.includes(targetUser.organizationId)) {
    throw new ForbiddenError("Chỉ có thể thêm người thuộc tổ chức liên quan tới dự án này.");
  }

  await db.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: parsed.data.userId } },
    create: { projectId, userId: parsed.data.userId, role: parsed.data.role },
    update: { role: parsed.data.role },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "ADD_PROJECT_MEMBER",
      entity: "Project",
      entityId: projectId,
      meta: { addedUserId: parsed.data.userId },
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

/** Gỡ thành viên khỏi đội thực hiện dự án. */
export async function removeProjectMemberAction(projectId: string, memberId: string) {
  const user = await requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE");
  const member = await db.projectMember.findUniqueOrThrow({
    where: { id: memberId },
    include: { project: { include: { match: { include: matchWithPartiesInclude } } } },
  });
  if (member.projectId !== projectId) {
    throw new ForbiddenError("Thành viên không thuộc dự án này.");
  }
  assertPartyScope(user, partyOrganizationIdsOfMatch(member.project.match));

  await db.projectMember.delete({ where: { id: memberId } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "REMOVE_PROJECT_MEMBER",
      entity: "Project",
      entityId: projectId,
      meta: { removedUserId: member.userId },
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}
