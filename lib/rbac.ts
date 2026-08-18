import "server-only";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
export {
  assertOrgScope,
  assertPartyScope,
  partyOrganizationIdsOfMatch,
  ForbiddenError,
} from "@/lib/domain/access-control";
import { ForbiddenError } from "@/lib/domain/access-control";
import type { Role } from "@/lib/generated/prisma/enums";

export class AuthError extends Error {}

export type CurrentUser = {
  id: string;
  role: Role;
  organizationId: string | null;
  name?: string | null;
  email?: string | null;
};

/** Throws if not authenticated. Use in server actions / route handlers. */
export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user) throw new AuthError("Bạn cần đăng nhập.");
  return session.user;
}

/** Throws if the user's role is not in the allowed list. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Bạn không có quyền thực hiện thao tác này.");
  }
  return user;
}

/**
 * Delegated administration (cấu phần 10.6): a admin may only act within
 * their own organization; superadmin acts across the whole platform.
 */

/**
 * Cho phép chủ hồ sơ TỰ thao tác, hoặc admin (SUPERADMIN toàn hệ thống,
 * ADMIN đúng tổ chức của hồ sơ) thao tác THAY — dùng chung cho server
 * actions (lib/actions/identity.ts) và route handlers OAuth
 * (app/api/integrations/orcid/*). `actingAsAdmin` dùng để ghi rõ vào
 * AuditLog ai thực sự xác nhận (VC-NV-011 Mục 3.4, 13.2, ADR-0001 Mục 5.1).
 */
export async function requireExpertProfileOwnerOrAdmin(expertProfileId: string) {
  const user = await requireUser();
  const profile = await db.expertProfile.findUniqueOrThrow({ where: { id: expertProfileId } });

  const isOwner = profile.userId === user.id;
  const isAdmin =
    user.role === "SUPERADMIN" ||
    (user.role === "ADMIN" && user.organizationId === profile.organizationId);

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("Chỉ chủ hồ sơ hoặc quản trị viên tổ chức mới thực hiện được thao tác này.");
  }

  return { user, profile, actingAsAdmin: !isOwner };
}
