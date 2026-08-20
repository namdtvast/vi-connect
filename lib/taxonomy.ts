// Minimal field/domain taxonomy for the current scope.
// A real taxonomy (aligned to VAST/OECD Frascati fields) is backlog —
// this fixed list is enough to make matching explainable and demo-able now.
export const FIELDS = [
  { code: "cntt", label: "Công nghệ thông tin" },
  { code: "ai_ml", label: "Trí tuệ nhân tạo / Machine Learning" },
  { code: "toan_hoc", label: "Toán học" },
  { code: "vat_ly", label: "Vật lý" },
  { code: "hoa_hoc", label: "Hóa học" },
  { code: "vat_lieu", label: "Vật liệu mới" },
  { code: "sinh_hoc", label: "Công nghệ sinh học" },
  { code: "moi_truong", label: "Môi trường" },
  { code: "khoa_hoc_bien", label: "Khoa học biển / Hải dương học" },
  { code: "nang_luong", label: "Năng lượng" },
  { code: "nong_nghiep", label: "Nông nghiệp công nghệ cao" },
  { code: "y_duoc", label: "Y dược" },
  { code: "co_khi_tu_dong", label: "Cơ khí - Tự động hóa" },
  { code: "xay_dung", label: "Xây dựng - Hạ tầng" },
  { code: "chinh_sach", label: "Chính sách KH&CN" },
  { code: "do_luong", label: "Đo lường (Kiểm định; Hiệu chuẩn; Thử nghiệm)" },
  { code: "quan_trac_moi_truong", label: "Quan trắc môi trường" },
  { code: "ra_test", label: "RA Test" },
] as const;

export type FieldCode = (typeof FIELDS)[number]["code"];

export function fieldLabel(code: string): string {
  return FIELDS.find((f) => f.code === code)?.label ?? code;
}
