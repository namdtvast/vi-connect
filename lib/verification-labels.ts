import type { VerificationStatus } from "@/lib/generated/prisma/enums";

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  UNVERIFIED: "Chưa xác minh",
  PENDING: "Chờ xác minh",
  VERIFIED: "Đã xác minh",
  REJECTED: "Từ chối",
};

export const VERIFICATION_BADGE: Record<
  VerificationStatus,
  "default" | "success" | "warning" | "danger"
> = {
  UNVERIFIED: "default",
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};
