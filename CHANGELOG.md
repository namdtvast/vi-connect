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
  theo tenant; bổ sung scope `PARTY` cho domain EXECUTE (một `Project` bắc cầu
  2 tổ chức) và ghi nhận thêm các khoảng trống đối chiếu mã nguồn ở Phụ lục B.
- Lưu tài liệu tham khảo `VC-TK-004` (kiến trúc multi-tenant đích do một phiên
  Codex khác đề xuất, tự nhận mã `VC-KT-002`/`APPROVED` không hợp lệ) dưới trạng
  thái `REFERENCE`, không thay thế `VC-KT-002` hiện hành, kèm ghi chú các điểm
  mâu thuẫn với `AGENTS.md`/`docs/SCOPE.md`.
- `03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/README.md`: rút về đúng khuôn
  điều hướng như mọi README khác trong repo (1 tiêu đề + mô tả ngắn + link tới
  `VC-KT-002`). Bản trước (106 dòng, có sơ đồ Mermaid và ví dụ diễn giải song
  song nội dung `VC-KT-002`) vi phạm nguyên tắc một-dữ-liệu-một-nơi-lưu ở
  `VC-QT-001` — hai nguồn cùng kể một thiết kế dễ lệch nhau khi `VC-KT-002` đổi.
- Bổ sung `VC-KT-003` "Kiến trúc bảo mật" — tách khỏi `VC-KT-002` vì phạm vi
  khác nhau (transport, xác thực, header HTTP, quản lý secret, log/giám sát,
  quản lý phụ thuộc, backup/restore, bảo vệ PII, ứng phó sự cố), theo đúng
  danh sách 5 hạng mục `SECURITY.md` đã đặt ra trước production. Đối chiếu
  hiện trạng thật với mã nguồn/cấu hình triển khai (`lib/auth.ts`,
  `next.config.ts`, `deploy/nginx-viconnect.conf`, `deploy/vi-connect.service`,
  `.github/workflows/ci.yml`) và với OWASP Top 10 (2021); khoảng trống chính
  phát hiện: chưa có security header HTTP, chưa có rate limiting đăng nhập,
  chưa có `npm audit`/Dependabot, chưa có backup/restore Postgres định kỳ —
  ghi ở Mục 16, chưa code hoá.
- Soát xét `VC-NV-011-HoSoDinhDanh-DRAFT_v2.0` (bản mở rộng baseline `VC-NV-011
  v1.0`, chưa duyệt): sửa Mục 15 để không mâu thuẫn `VC-KT-002`. Bản gốc tự nhận
  mô hình visibility `PRIVATE|TENANT|SHARED|PUBLIC` là "theo VC-KT-002", nhưng
  `VC-KT-002` Mục 8 dùng cơ chế khác (trạng thái publish) và đã chủ động từ chối
  đúng kiểu mô hình 4-cấp đó; `TENANT` cũng không khớp Mục 4 (VI CONNECT hiện là
  một tenant duy nhất). Thay bằng đề xuất Field Visibility
  `PRIVATE|ORGANIZATION|VI_CONNECT|PUBLIC` — trục tách biệt, cộng gộp với Data
  Scope hiện có, đúng hướng dự trù ở `VC-KT-002` Mục 8, và đánh dấu là đề xuất
  cần `VC-KT-002` xác nhận/cập nhật trước khi code hoá (thêm vào danh sách khoá
  ADR ở Mục 22).

### Changed

- Thêm Mục 17 "Ví dụ minh hoạ" vào `VC-KT-002` — kịch bản cụ thể (2 tổ chức, 5
  người dùng) minh hoạ từng data scope, luồng kiểm tra quyền 9 bước và lỗi B12.
- Chắt lọc `VC-KT-002` (623 → 440 dòng): giữ nguyên cấu trúc 17 mục + Phụ lục
  A/B, cắt phần diễn giải trùng lặp/dài dòng, giữ nguyên toàn bộ ma trận
  quyền, bảng đối chiếu và quyết định thiết kế.
- Viết lại `VC-KT-002` thành mô hình phân quyền chung cho toàn nền tảng VI CONNECT
  (bỏ khung "Giai đoạn 1"): tách rõ mô hình kiến trúc tổng quát (Mục 3-9, có tầng
  `Membership`/`Tenant` dự phòng cho mở rộng) khỏi ma trận permission đang bật
  (Mục 7, 13); đổi tên role `VAST_ADMIN → SUPERADMIN`, `HOI_ADMIN → ADMIN` trong
  tài liệu (chưa áp dụng vào mã nguồn, xem Phụ lục B mục B11).
- Chuẩn hoá tên tài liệu bằng tiền tố `VC-`, mã nhóm, trạng thái, phiên bản và ngày.
- Chuyển sơ đồ hạ tầng CNTT sang nhóm kiến trúc kỹ thuật với mã `VC-KT-001`.
- Chuyển mục lục 11 cấu phần về `README.md` không phiên bản hoá.
- Chốt lại quy ước tên file: giữ nguyên `VC-`, mã nhóm và trạng thái viết hoa, tên thư mục viết hoa-gạch ngang như trước; riêng đoạn tên ngắn gọn viết theo PascalCase liền không dấu gạch ngang giữa các từ (xem `VC-QT-002` Mục 9), trừ nhóm file theo thông lệ GitHub (`README.md`, `LICENSE`...).
- `VC-QT-003` lên `v1.3`: thêm dòng `VC-KT-003` vào danh mục tài liệu hiện hành, cập nhật mọi liên kết tham chiếu (`README.md`, `00_QUAN-TRI/README.md`, `VC-KT-002`, `VC-KT-003`) theo đúng Mục 8 của `VC-QT-001`.
- `VC-QT-003` lên `v1.4`: thêm mục "Bản đang soát xét" liệt kê
  `VC-NV-011-HoSoDinhDanh-DRAFT_v2.0` (chưa thay thế `v1.0 APPROVED` ở bảng
  chính cho tới khi được duyệt), cập nhật liên kết tham chiếu ở `README.md` và
  `00_QUAN-TRI/README.md`.

### Fixed

- Vá các lỗ hổng IDOR nêu ở `VC-KT-002` Phụ lục B: `addMilestoneAction`,
  `setMilestoneStatusAction`, `generateMatchesAction`, `updateMatchStageAction`,
  `convertMatchToProjectAction`, `createAgreementAction`, `signAgreementAction`
  nay kiểm tra `assertOrgScope`/`assertPartyScope` theo tổ chức liên quan trước
  khi ghi dữ liệu. Bổ sung hàm `assertPartyScope`/`partyOrganizationIdsOfMatch`
  trong `lib/domain/access-control.ts` cho domain EXECUTE (một `Match`/`Project`
  bắc cầu 2 tổ chức).
- Vá lỗi `assertOrgScope` trước đây chặn nhầm mọi thao tác hợp lệ của role
  `ENTERPRISE` (chỉ cho `VAST_ADMIN`/`HOI_ADMIN` đi qua dù `requireRole` đã cho
  phép `ENTERPRISE`).
- Bổ sung ghi `AuditLog` khi đăng nhập thất bại (`lib/auth.ts`) và khi ký thoả
  thuận hợp tác (`signAgreementAction`, trước đây thiếu).
- Thêm test cho `assertOrgScope`, `assertPartyScope`, `partyOrganizationIdsOfMatch`
  tại `tests/access-control.test.ts`.

### Removed

- Loại bỏ file khoá Word hết giá trị và hai file `.DS_Store` từng bị cấp mã tạm.

## [0.1.0] — MVP nội bộ

- MVP Giai đoạn 1 với hồ sơ, tổ chức, cung cầu, ngân hàng bài toán, matching có giải thích, dự án và KPI dashboard.
