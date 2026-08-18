import type { Role } from "@/lib/generated/prisma/enums";

// VC-KT-002 Mục 5, 7.1: ADMIN chỉ được gán vai trò không-quản-trị trong tổ
// chức mình, không tự cấp/đổi quyền quản trị (SUPERADMIN/ADMIN) — tránh leo
// thang đặc quyền qua chính màn hình quản lý phân quyền.
export const ADMIN_ROLES: Role[] = ["SUPERADMIN", "ADMIN"];
export const ASSIGNABLE_BY_ADMIN: Role[] = ["EXPERT", "ENTERPRISE", "VIEWER"];
export const ALL_ROLES: Role[] = [
  "SUPERADMIN",
  "ADMIN",
  "EXPERT",
  "ENTERPRISE",
  "VIEWER",
];
