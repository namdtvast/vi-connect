# KIẾN TRÚC KỸ THUẬT — CẤU PHẦN 09: CỘNG TÁC & MẠNG LƯỚI

**Mã tài liệu:** VC-KT-019
**Phiên bản:** v0.1
**Ngày soạn thảo:** 2026-08-20
**Trạng thái:** DRAFT — thiết kế cho phạm vi v1 đã chốt với Product Owner, đang code hoá cùng đợt
**Nơi lưu chuẩn:** `03_KIEN-TRUC-KY-THUAT/09_CONG-TAC-MANG-LUOI/VC-KT-019-KienTrucCongTacMangLuoi-DRAFT_v0.1_20260820.md`

## 1. Mục đích & phạm vi

`VC-NV-019` liệt kê 4 loại DATA (`Partnership`, `Team`, `Network`,
`Collaboration`) không kèm định nghĩa nghiệp vụ cụ thể — cùng tình trạng
`VC-NV-018` trước khi cấu phần 08 được xây. Tài liệu này chốt **phạm vi v1**:
chỉ xây **`Team`** (thành viên thực hiện dự án), theo quyết định Product Owner
ngày 2026-08-20.

Không xây trong v1:
- **`Partnership`** — rủi ro trùng lặp: `Project` (07) sinh ra từ `Match` giữa
  đúng 2 tổ chức, cộng với `Agreement` đã ghi nhận quan hệ hợp tác chính thức
  (MOU/NDA/hợp đồng) — thêm một bảng `Partnership` riêng ở giai đoạn này nhiều
  khả năng chỉ nhân đôi dữ liệu đã có, chưa thấy khoảng trống nghiệp vụ thật.
- **`Network`** — bản đồ quan hệ toàn nền tảng, phạm vi rộng và trừu tượng hơn
  hẳn, cần làm rõ nghiệp vụ (hiển thị thế nào, tính từ dữ liệu gì) trước khi
  thiết kế kỹ thuật.
- **`Collaboration`** — nếu hiểu là trao đổi/thảo luận trong dự án thì đây là
  tính năng nhắn tin/bình luận, khối lượng lớn hơn hẳn, để lại.

## 2. Căn cứ

- `VC-NV-019` — DATA group cấu phần 09, ISO 56003:2019 Clauses 4-8 (Innovation
  partnership).
- `VC-KT-018` — tiền lệ chốt phạm vi v1 hẹp cho cấu phần đang backlog 0%,
  cùng cách trình bày.
- Mã nguồn thật: `Project`/`Match` (`lib/actions/projects.ts`) đã có
  `assertPartyScope`/`partyOrganizationIdsOfMatch` — tái dùng nguyên trạng.

## 3. Quyết định phạm vi (Product Owner, 2026-08-20)

Chọn `Team` gắn với `Project`, vì:
1. Khớp đúng cụm từ chính `VC-NV-019` nêu ("quản lý... nhóm thực hiện").
2. Không trùng tính năng nào đã có — `Project` hiện chỉ biết **2 tổ chức**
   nào tham gia (qua `Match`), chưa biết **người cụ thể nào** trong 2 tổ chức
   đó trực tiếp làm việc.
3. Tận dụng ngay `Project`/`assertPartyScope` đã hoàn thiện ở cấu phần 07/08.

## 4. Vị trí trong kiến trúc 11 cấu phần

Nhóm **EXECUTE** cùng 07 (Dự án & Giao dịch), 08 (Thẩm định & Đánh giá).

| Cấu phần | Quan hệ với 09 |
|---|---|
| 07 — Dự án & Giao dịch | `ProjectMember` gắn `Project.id` — chỉ đọc, không sửa gì ở 07. |
| 01 — Hồ sơ & Định danh | Thành viên là `User` thật thuộc 1 trong 2 tổ chức liên quan `Match` gốc — không tạo `User` mới, chỉ tham chiếu. |
| 10 — Quản trị & Tuân thủ | Thêm/xoá thành viên ghi `AuditLog`. |

## 5. Mô hình dữ liệu

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  role      String   // free-text vai trò trong dự án (ADR-0001 Mục 6)

  addedAt DateTime @default(now())

  @@unique([projectId, userId])
  @@index([projectId])
}
```

Quyết định thiết kế:
- **Thành viên phải thuộc 1 trong 2 tổ chức của `Match` gốc** — validate ở
  tầng action (`user.organizationId` nằm trong `partyOrganizationIdsOfMatch`),
  không tin danh sách do client gửi. Không cho thêm người ngoài dự án.
- **`@@unique([projectId, userId])`** — một người chỉ xuất hiện 1 lần trong
  1 dự án (thêm lại chỉ để đổi vai trò, xử lý ở tầng action bằng `upsert`).
- **Không có bảng `Team` độc lập** — `ProjectMember` đã đủ (1 Project = 1 đội,
  không có khái niệm nhiều "đội" trong cùng 1 dự án ở v1); đặt tên
  `ProjectMember` thay vì `TeamMember` cho khớp quy ước đặt tên theo entity
  cha (`Milestone`, `Deliverable`, `Evaluation` đều đặt tên theo việc, không
  theo khái niệm trừu tượng "team").
- **Chỉ thêm/gỡ, không sửa vai trò qua action riêng** — đổi vai trò = gỡ rồi
  thêm lại (giữ action tối thiểu, giống mức độ đơn giản của `Deliverable`).

## 6. Phân quyền (thêm dòng vào `VC-KT-002` Mục 7.3)

| Permission | SUPERADMIN | ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `projectMember.view` | P | PARTY | W (dự án mình có tên) | PARTY | — |
| `projectMember.add` | P | PARTY | — | PARTY | — |
| `projectMember.remove` | P | PARTY | — | PARTY | — |

Dùng đúng `assertPartyScope` đã có — không cần hàm scope mới.

## 7. Khoảng trống — điều kiện mở `Partnership`/`Network`/`Collaboration`

1. **`Partnership`** — chỉ xây nếu xuất hiện nhu cầu nghiệp vụ thật không quy
   về được `Project`+`Agreement` (VD: quan hệ hợp tác chưa có dự án cụ thể).
2. **`Network`** — cần Product Owner mô tả cụ thể: hiển thị gì, tính từ
   `Match`/`ProjectMember` hiện có hay cần thu thập thêm dữ liệu.
3. **`Collaboration`** — nếu là nhắn tin/bình luận, đây là tính năng lớn,
   thiết kế riêng (schema `Message`/`Thread`, có thể cần WebSocket/polling).

## 8. Kế hoạch triển khai kỹ thuật

| Việc | File |
|---|---|
| Model `ProjectMember` (migration mới) | `prisma/schema.prisma` |
| `addProjectMemberAction`/`removeProjectMemberAction` | `lib/actions/team.ts` (mới) |
| Hiển thị + form chọn thành viên trong trang dự án | `components/projects/team-panel.tsx` (mới), nối vào `app/dashboard/projects/[id]/page.tsx` |

---

*Tài liệu này ở trạng thái `DRAFT`, code hoá cùng đợt theo đúng phạm vi Mục 3.
Đăng ký tại `00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.11_20260820.md`.*
