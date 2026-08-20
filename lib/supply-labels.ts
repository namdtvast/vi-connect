import type { SupplyStatus } from "@/lib/generated/prisma/enums";

export const SUPPLY_STATUS_LABEL: Record<SupplyStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đang chào",
  ARCHIVED: "Đã lưu trữ",
};

export const SUPPLY_STATUS_BADGE: Record<
  SupplyStatus,
  "default" | "success" | "warning" | "danger" | "brand" | "cyan"
> = {
  DRAFT: "default",
  PUBLISHED: "brand",
  ARCHIVED: "default",
};
