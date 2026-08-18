import type { Role } from "@/lib/generated/prisma/enums";

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: "Quản trị VAST",
  ADMIN: "Quản trị Hội thành viên",
  EXPERT: "Chuyên gia",
  ENTERPRISE: "Doanh nghiệp",
  VIEWER: "Người xem",
};
