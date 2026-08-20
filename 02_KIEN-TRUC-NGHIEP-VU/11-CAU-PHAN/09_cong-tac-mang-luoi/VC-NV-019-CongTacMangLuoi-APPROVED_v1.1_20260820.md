# 09. Cộng tác & Mạng lưới

**Module:** `09_cong-tac-mang-luoi`
**Nhóm kiến trúc:** EXECUTE
**Namespace API:** `/api/v1/cong-tac-mang-luoi`

## Nhóm DATA chính
`Partnership`, `Team`, `Network`, `Collaboration`

## Ánh xạ ISO chính
ISO 56003:2019 — Clauses 4–8

## Ghi chú chức năng ISO cần tích hợp
Hình thành và quản lý quan hệ hợp tác, nhóm thực hiện, mạng lưới chuyên gia/tổ chức và tương tác đối tác đổi mới.

## Trạng thái triển khai

Quyết định Product Owner (2026-08-20): phạm vi v1 chỉ xây **`Team`**
(`ProjectMember`) — thành viên cụ thể thực hiện một `Project` (cấu phần 07),
khớp đúng cụm "quản lý nhóm thực hiện" nêu ở trên. Chi tiết thiết kế và lý do
chọn `Team` thay vì 3 loại DATA còn lại:
[`VC-KT-019`](../../../03_KIEN-TRUC-KY-THUAT/09_CONG-TAC-MANG-LUOI/VC-KT-019-KienTrucCongTacMangLuoi-DRAFT_v0.1_20260820.md) Mục 3.

Chưa xây trong v1 — lý do nêu ở `VC-KT-019` Mục 1 và Mục 7:
- **`Partnership`** — rủi ro trùng lặp với `Project`+`Agreement` (cấu phần 07)
  đã ghi nhận quan hệ hợp tác giữa 2 tổ chức; chỉ xây khi có nhu cầu nghiệp vụ
  không quy về được 2 model đó.
- **`Network`** — bản đồ quan hệ toàn nền tảng, cần làm rõ nghiệp vụ (hiển thị
  gì, tính từ dữ liệu gì) trước khi thiết kế kỹ thuật.
- **`Collaboration`** — nếu là nhắn tin/thảo luận trong dự án, đây là tính
  năng lớn hơn hẳn (cần schema `Message`/`Thread` riêng), để lại.

## Tham chiếu
Baseline taxonomy: [`VC-NV-001`](../VC-NV-001-11CauPhanDataIso-APPROVED_v1.0_20260817.md)
Kiến trúc kỹ thuật: [`VC-KT-019`](../../../03_KIEN-TRUC-KY-THUAT/09_CONG-TAC-MANG-LUOI/VC-KT-019-KienTrucCongTacMangLuoi-DRAFT_v0.1_20260820.md)
