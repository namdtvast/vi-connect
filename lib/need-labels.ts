import type { NeedStatus } from "@/lib/generated/prisma/enums";

export const NEED_STATUS_LABEL: Record<NeedStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đang mở",
  MATCHED: "Đã ghép nối",
  CLOSED: "Đã đóng",
};

export const NEED_STATUS_BADGE: Record<
  NeedStatus,
  "default" | "success" | "warning" | "danger" | "brand" | "cyan"
> = {
  DRAFT: "default",
  PUBLISHED: "brand",
  MATCHED: "success",
  CLOSED: "default",
};
