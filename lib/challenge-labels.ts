import type { ChallengeStatus, SolutionStatus } from "@/lib/generated/prisma/enums";

export const CHALLENGE_STATUS_LABEL: Record<ChallengeStatus, string> = {
  INTAKE: "Tiếp nhận",
  STANDARDIZING: "Đang chuẩn hóa",
  PUBLISHED: "Đã công bố",
  SOLUTION_REVIEW: "Đang đánh giá giải pháp",
  MATCHED: "Đã ghép nối",
  CLOSED: "Đã đóng",
};

export const CHALLENGE_STATUS_BADGE: Record<
  ChallengeStatus,
  "default" | "success" | "warning" | "danger" | "brand" | "cyan"
> = {
  INTAKE: "default",
  STANDARDIZING: "warning",
  PUBLISHED: "brand",
  SOLUTION_REVIEW: "cyan",
  MATCHED: "success",
  CLOSED: "default",
};

export const SOLUTION_STATUS_LABEL: Record<SolutionStatus, string> = {
  SUBMITTED: "Đã nộp",
  UNDER_REVIEW: "Đang xem xét",
  SHORTLISTED: "Vào danh sách rút gọn",
  SELECTED: "Được chọn",
  REJECTED: "Từ chối",
};

export const SOLUTION_BADGE: Record<
  SolutionStatus,
  "default" | "success" | "warning" | "danger"
> = {
  SUBMITTED: "default",
  UNDER_REVIEW: "warning",
  SHORTLISTED: "warning",
  SELECTED: "success",
  REJECTED: "danger",
};
