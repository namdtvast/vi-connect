import type { Role } from "@/lib/generated/prisma/enums";

// VC-KT-002 Mục 5, 7.1: ADMIN (HOI_ADMIN) chỉ được gán vai trò không-quản-trị
// trong tổ chức mình, không tự cấp/đổi quyền quản trị (VAST_ADMIN/HOI_ADMIN) —
// tránh leo thang đặc quyền qua chính màn hình quản lý phân quyền.
export const ADMIN_ROLES: Role[] = ["VAST_ADMIN", "HOI_ADMIN"];
export const ASSIGNABLE_BY_HOI_ADMIN: Role[] = ["EXPERT", "ENTERPRISE", "VIEWER"];
export const ALL_ROLES: Role[] = [
  "VAST_ADMIN",
  "HOI_ADMIN",
  "EXPERT",
  "ENTERPRISE",
  "VIEWER",
];
