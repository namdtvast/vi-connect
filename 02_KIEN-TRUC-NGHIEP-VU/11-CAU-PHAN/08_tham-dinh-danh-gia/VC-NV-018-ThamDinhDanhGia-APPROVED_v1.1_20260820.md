# 08. Thẩm định & Đánh giá

**Module:** `08_tham-dinh-danh-gia`
**Nhóm kiến trúc:** EXECUTE
**Namespace API:** `/api/v1/tham-dinh-danh-gia`

## Nhóm DATA chính
`Review`, `Assessment`, `DueDiligence`, `Evaluation`

## Ánh xạ ISO chính
ISO 56001:2024 — Clause 9 Performance Evaluation; ISO/TR 56004:2019

## Ghi chú chức năng ISO cần tích hợp
Thẩm định hồ sơ, năng lực, công nghệ, dự án và nguồn lực; đánh giá hiệu quả hệ thống và chất lượng quyết định.

## Trạng thái triển khai

Quyết định Product Owner (2026-08-20): phạm vi v1 chỉ xây **`Evaluation`**,
gắn với `Project` (cấu phần 07) — đánh giá hiệu quả dự án/hợp tác có cấu trúc
(điểm số, tiêu chí, ghi chú), append-only, khớp đúng ISO 56001 Clause 9
(Performance Evaluation). Chi tiết thiết kế và lý do chọn `Evaluation` thay vì
3 loại DATA còn lại: [`VC-KT-018`](../../../03_KIEN-TRUC-KY-THUAT/08_THAM-DINH-DANH-GIA/VC-KT-018-KienTrucThamDinhDanhGia-DRAFT_v0.1_20260820.md) Mục 3.

Chưa xây trong v1 — lý do nêu ở `VC-KT-018` Mục 1 và Mục 7:
- **`DueDiligence`** — gắn với thẩm định trước đầu tư/giải ngân, thuộc vùng
  `AGENTS.md` đang cấm mở rộng. Chỉ mở khi đề án phê duyệt xây Funding &
  Investment Hub thật (cấu phần 06 đầy đủ).
- **`Review`** — đã có 3 luồng duyệt hoạt động thật nhưng nằm rải rác ở cấu
  phần khác (nộp/duyệt giải pháp — 04/05; nghiệm thu sản phẩm bàn giao — 07;
  xác minh công bố khoa học — 03). Tổng quát hoá thành 1 bảng chung là việc
  có thật, để lại vì rủi ro/khối lượng cao hơn `Evaluation`.
- **`Assessment`** — thẩm định năng lực/công nghệ trước khi ghi nhận; chưa rõ
  quy trình (ai thẩm định, tiêu chí gì) — cần làm rõ nghiệp vụ trước khi thiết
  kế kỹ thuật.

## Tham chiếu
Baseline taxonomy: [`VC-NV-001`](../VC-NV-001-11CauPhanDataIso-APPROVED_v1.0_20260817.md)
Kiến trúc kỹ thuật: [`VC-KT-018`](../../../03_KIEN-TRUC-KY-THUAT/08_THAM-DINH-DANH-GIA/VC-KT-018-KienTrucThamDinhDanhGia-DRAFT_v0.1_20260820.md)
