export type OrganizationScopedUser = {
  role: string;
  organizationId: string | null;
};

export class ForbiddenError extends Error {}

/** Pure authorization rule, shared by server actions and unit tests. */
export function assertOrgScope(
  user: OrganizationScopedUser,
  organizationId: string
): void {
  if (user.role === "VAST_ADMIN") return;
  if (user.role === "HOI_ADMIN" && user.organizationId === organizationId) return;
  throw new ForbiddenError("Bạn không có quyền trên tổ chức này.");
}
