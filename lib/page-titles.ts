// Nhãn breadcrumb ngắn gọn cho từng route dashboard — dùng bởi TopHeader,
// tách riêng khỏi tiêu đề đầy đủ (kèm mô tả) mỗi trang tự hiển thị ở
// PageHeader để không phải truyền title qua props từ mỗi page.tsx.
export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tổng quan (KPI)",
  "/dashboard/organizations": "Tổ chức & Hội thành viên",
  "/dashboard/experts": "Hồ sơ chuyên gia",
  "/dashboard/supplies": "Công nghệ & giải pháp",
  "/dashboard/needs": "Nhu cầu",
  "/dashboard/challenges": "Ngân hàng bài toán",
  "/dashboard/matches": "Ghép nối",
  "/dashboard/funding-sources": "Nguồn lực & tài trợ",
  "/dashboard/projects": "Dự án & hợp đồng",
  "/dashboard/permissions": "Quản lý phân quyền",
  "/dashboard/audit-log": "Nhật ký hệ thống",
};

/** Khớp theo tiền tố dài nhất — dùng cho các route con như /dashboard/experts/[id]. */
export function resolvePageTitle(pathname: string): string {
  let best = "";
  let bestLabel = "VI CONNECT";
  for (const [path, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      if (path.length > best.length) {
        best = path;
        bestLabel = label;
      }
    }
  }
  return bestLabel;
}
