import type { MatchStage } from "@/lib/generated/prisma/enums";

export const MATCH_STAGE_LABEL: Record<MatchStage, string> = {
  SUGGESTED: "Được đề xuất",
  VIEWED: "Đã xem",
  ACCEPTED: "Đã chấp nhận",
  CONTACTED: "Đã liên hệ",
  COLLABORATING: "Đang hợp tác",
  CONVERTED_PROJECT: "Đã thành dự án",
  REJECTED: "Từ chối",
};

export const MATCH_STAGE_BADGE: Record<
  MatchStage,
  "default" | "success" | "warning" | "danger" | "brand" | "cyan"
> = {
  SUGGESTED: "default",
  VIEWED: "cyan",
  ACCEPTED: "brand",
  CONTACTED: "brand",
  COLLABORATING: "warning",
  CONVERTED_PROJECT: "success",
  REJECTED: "danger",
};

// Match Funnel order per proposal §11.3
export const MATCH_FUNNEL: MatchStage[] = [
  "SUGGESTED",
  "VIEWED",
  "ACCEPTED",
  "CONTACTED",
  "COLLABORATING",
  "CONVERTED_PROJECT",
];
