import type { Role } from "@/lib/generated/prisma/enums";

export const ROLE_LABEL: Record<Role, string> = {
  VAST_ADMIN: "Quản trị VAST",
  HOI_ADMIN: "Quản trị Hội thành viên",
  EXPERT: "Chuyên gia",
  ENTERPRISE: "Doanh nghiệp",
  VIEWER: "Người xem",
};
