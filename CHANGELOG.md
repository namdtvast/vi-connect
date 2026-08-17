# Changelog

Các thay đổi đáng chú ý của VI CONNECT được ghi tại đây. Phiên bản phát hành ứng dụng tuân theo Semantic Versioning; commit sử dụng Conventional Commits bằng tiếng Việt.

## [Unreleased]

### Added

- Hợp nhất mã nguồn, tài liệu quản trị, đề án, kiến trúc, pháp lý và tài liệu tham khảo vào một repo Git.
- Bổ sung cấu trúc tài liệu `00`–`09`, `90`, `99` và README điều hướng.
- Bổ sung danh mục tài liệu trung tâm `VC-QT-003`.
- Bổ sung chính sách một dữ liệu – một nơi lưu và trạng thái `REFERENCE`.
- Bổ sung manifest repo, mẫu pull request và quy tắc bỏ qua file tạm.
- Bổ sung thiết kế phân quyền `VC-KT-002` (role, permission, data scope, ma trận
  quyền và luồng kiểm tra tại server cho Giai đoạn 1), kèm đối chiếu với mô hình
  multi-tenant architecture phổ biến để xác nhận không áp dụng cô lập dữ liệu
  theo tenant.

### Changed

- Chuẩn hoá tên tài liệu bằng tiền tố `VC-`, mã nhóm, trạng thái, phiên bản và ngày.
- Chuyển sơ đồ hạ tầng CNTT sang nhóm kiến trúc kỹ thuật với mã `VC-KT-001`.
- Chuyển mục lục 11 cấu phần về `README.md` không phiên bản hoá.
- Chốt lại quy ước tên file: giữ nguyên `VC-`, mã nhóm và trạng thái viết hoa, tên thư mục viết hoa-gạch ngang như trước; riêng đoạn tên ngắn gọn viết theo PascalCase liền không dấu gạch ngang giữa các từ (xem `VC-QT-002` Mục 9), trừ nhóm file theo thông lệ GitHub (`README.md`, `LICENSE`...).

### Removed

- Loại bỏ file khoá Word hết giá trị và hai file `.DS_Store` từng bị cấp mã tạm.

## [0.1.0] — MVP nội bộ

- MVP Giai đoạn 1 với hồ sơ, tổ chức, cung cầu, ngân hàng bài toán, matching có giải thích, dự án và KPI dashboard.
