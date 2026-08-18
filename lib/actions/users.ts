"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertOrgScope, requireRole } from "@/lib/rbac";
import { ForbiddenError } from "@/lib/domain/access-control";
import { ADMIN_ROLES, ASSIGNABLE_BY_ADMIN } from "@/lib/permissions";
import type { Role } from "@/lib/generated/prisma/enums";

export async function updateUserRoleAction(userId: string, role: Role) {
  const actor = await requireRole("SUPERADMIN", "ADMIN");

  if (userId === actor.id) {
    throw new ForbiddenError("Không thể tự đổi vai trò của chính mình.");
  }

  const target = await db.user.findUniqueOrThrow({ where: { id: userId } });

  if (actor.role === "ADMIN") {
    if (!target.organizationId) {
      throw new ForbiddenError("Tài khoản này chưa gắn với tổ chức nào.");
    }
    assertOrgScope(actor, target.organizationId);
    if (ADMIN_ROLES.includes(target.role)) {
      throw new ForbiddenError("Bạn không có quyền đổi vai trò của tài khoản quản trị.");
    }
    if (!ASSIGNABLE_BY_ADMIN.includes(role)) {
      throw new ForbiddenError("Chỉ quản trị VAST được gán vai trò quản trị.");
    }
  }

  const before = { role: target.role };
  await db.user.update({ where: { id: userId }, data: { role } });

  await db.auditLog.create({
    data: {
      userId: actor.id,
      action: "UPDATE_USER_ROLE",
      entity: "User",
      entityId: userId,
      meta: { before, after: { role } },
    },
  });

  revalidatePath("/dashboard/permissions");
}
