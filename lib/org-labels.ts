import type { OrganizationType, OrgStatus } from "@/lib/generated/prisma/enums";

export const ORG_TYPE_LABEL: Record<OrganizationType, string> = {
  HOI_THANH_VIEN: "Hội thành viên",
  TO_CHUC_KHCN: "Tổ chức KH&CN",
  DOANH_NGHIEP: "Doanh nghiệp",
  QUY_DAU_TU: "Quỹ / nhà đầu tư",
  CO_QUAN_QUAN_LY: "Cơ quan quản lý",
  KHAC: "Khác",
};

export const ORG_STATUS_LABEL: Record<OrgStatus, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm ngưng",
};
