import type { Role } from "@/lib/generated/prisma/enums";

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: "Quản trị VAST",
  ADMIN: "Quản trị Hội thành viên",
  EXPERT: "Chuyên gia",
  ENTERPRISE: "Doanh nghiệp",
  VIEWER: "Người xem",
};

export const ROLE_BADGE: Record<
  Role,
  "default" | "success" | "warning" | "danger" | "brand" | "cyan" | "gold"
> = {
  SUPERADMIN: "danger",
  ADMIN: "gold",
  EXPERT: "brand",
  ENTERPRISE: "cyan",
  VIEWER: "default",
};
