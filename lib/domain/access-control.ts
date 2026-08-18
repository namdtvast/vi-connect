export type OrganizationScopedUser = {
  role: string;
  organizationId: string | null;
};

export class ForbiddenError extends Error {}

/** Role được phép hành động trong phạm vi tổ chức của chính họ (VC-KT-002 Mục 5, 7). */
const ORG_SCOPED_ROLES = new Set(["HOI_ADMIN", "ENTERPRISE"]);

/** Pure authorization rule, shared by server actions and unit tests. */
export function assertOrgScope(
  user: OrganizationScopedUser,
  organizationId: string
): void {
  if (user.role === "VAST_ADMIN") return;
  if (ORG_SCOPED_ROLES.has(user.role) && user.organizationId === organizationId) return;
  throw new ForbiddenError("Bạn không có quyền trên tổ chức này.");
}

export type MatchPartyOrganizations = {
  need: { organizationId: string };
  supply?: { organizationId: string | null } | null;
  expertProfile?: { organizationId: string } | null;
};

/**
 * Một Match/Project luôn bắc cầu giữa bên đăng Need và bên cung Supply/ExpertProfile,
 * có thể thuộc 2 tổ chức khác nhau — xem VC-KT-002 Mục 6, 7.3.
 */
export function partyOrganizationIdsOfMatch(
  match: MatchPartyOrganizations | null | undefined
): string[] {
  if (!match) return [];
  return [
    match.need.organizationId,
    match.supply?.organizationId ?? null,
    match.expertProfile?.organizationId ?? null,
  ].filter((id): id is string => Boolean(id));
}

/** Cho phép user nếu tổ chức của họ là một trong các bên liên quan tới Match gốc. */
export function assertPartyScope(
  user: OrganizationScopedUser,
  partyOrganizationIds: string[]
): void {
  if (user.role === "VAST_ADMIN") return;
  if (
    ORG_SCOPED_ROLES.has(user.role) &&
    user.organizationId !== null &&
    partyOrganizationIds.includes(user.organizationId)
  ) {
    return;
  }
  throw new ForbiddenError("Bạn không có quyền trên dự án này.");
}
