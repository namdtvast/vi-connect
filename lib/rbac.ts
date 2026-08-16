import "server-only";
import { auth } from "@/lib/auth";
export { assertOrgScope, ForbiddenError } from "@/lib/domain/access-control";
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
 * Delegated administration (cấu phần 10.6): a hoi_admin may only act within
 * their own organization; vast_admin acts across the whole platform.
 */
