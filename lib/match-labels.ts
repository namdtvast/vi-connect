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

// Match Funnel order per proposal §11.3
export const MATCH_FUNNEL: MatchStage[] = [
  "SUGGESTED",
  "VIEWED",
  "ACCEPTED",
  "CONTACTED",
  "COLLABORATING",
  "CONVERTED_PROJECT",
];
