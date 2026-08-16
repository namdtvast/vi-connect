# Chính sách an toàn

- Không báo cáo lỗ hổng bằng issue công khai; liên hệ chủ sở hữu repo qua kênh nội bộ.
- Không commit secret, khóa ký, dữ liệu cá nhân hoặc hồ sơ sản xuất.
- Tất cả thao tác thay đổi trạng thái quan trọng phải xác thực, kiểm tra quyền phía máy
  chủ và ghi audit log.
- AI/matching không được tự chọn nhà cung cấp, tự phê duyệt giải pháp hoặc nghiệm thu.
- Trước production phải có threat model, quản lý secret, backup/restore, log retention,
  kiểm thử phân quyền và quy trình ứng phó sự cố.
