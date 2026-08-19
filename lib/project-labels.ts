import type { AgreementStatus, MilestoneStatus, ProjectStatus } from "@/lib/generated/prisma/enums";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Lập kế hoạch",
  ACTIVE: "Đang triển khai",
  ON_HOLD: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  TERMINATED: "Chấm dứt",
};

export const PROJECT_STATUS_BADGE: Record<
  ProjectStatus,
  "default" | "success" | "warning" | "danger" | "brand"
> = {
  PLANNING: "warning",
  ACTIVE: "brand",
  ON_HOLD: "default",
  COMPLETED: "success",
  TERMINATED: "danger",
};

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  PLANNED: "Kế hoạch",
  IN_PROGRESS: "Đang thực hiện",
  SUBMITTED: "Đã nộp",
  ACCEPTED: "Đã nghiệm thu",
  OVERDUE: "Quá hạn",
};

export const MILESTONE_BADGE: Record<
  MilestoneStatus,
  "default" | "success" | "warning" | "danger"
> = {
  PLANNED: "default",
  IN_PROGRESS: "warning",
  SUBMITTED: "warning",
  ACCEPTED: "success",
  OVERDUE: "danger",
};

export const AGREEMENT_STATUS_LABEL: Record<AgreementStatus, string> = {
  DRAFT: "Dự thảo",
  SIGNED: "Đã ký",
  COMPLETED: "Hoàn tất",
  TERMINATED: "Chấm dứt",
};
