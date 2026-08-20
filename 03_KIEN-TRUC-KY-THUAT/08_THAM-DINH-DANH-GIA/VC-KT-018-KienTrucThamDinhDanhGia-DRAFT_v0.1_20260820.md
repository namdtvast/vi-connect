# KIẾN TRÚC KỸ THUẬT — CẤU PHẦN 08: THẨM ĐỊNH & ĐÁNH GIÁ

**Mã tài liệu:** VC-KT-018
**Phiên bản:** v0.1
**Ngày soạn thảo:** 2026-08-20
**Trạng thái:** DRAFT — thiết kế cho phạm vi v1 đã chốt với Product Owner, đang code hoá cùng đợt
**Nơi lưu chuẩn:** `03_KIEN-TRUC-KY-THUAT/08_THAM-DINH-DANH-GIA/VC-KT-018-KienTrucThamDinhDanhGia-DRAFT_v0.1_20260820.md`

## 1. Mục đích & phạm vi

`VC-NV-018` liệt kê nhóm DATA của cấu phần 08 gồm 4 loại: `Review`, `Assessment`,
`DueDiligence`, `Evaluation` — nhưng không định nghĩa nghiệp vụ cụ thể cho từng
loại. Tài liệu này chốt **phạm vi v1**: chỉ xây `Evaluation` (đánh giá hiệu quả
dự án), theo đúng quyết định Product Owner ngày 2026-08-20 (xem Mục 3).

Không xây trong v1:
- **`DueDiligence`** — gắn với thẩm định trước đầu tư/giải ngân, thuộc vùng
  `AGENTS.md` đang cấm mở rộng ("không tự mở rộng sang giải ngân, đầu tư");
  `VC-KT-002` Mục 13 điểm 2 đã ghi nhận `due_diligence.view` chưa bật vì lý do
  này — quyết định đó vẫn giữ nguyên.
- **`Review`** — đã có 3 luồng duyệt rải rác hoạt động thật ở cấu phần khác
  (`reviewSolutionAction` — 04/05, `acceptDeliverableAction` — 07,
  `verifyPublicationAction` — 03); tổng quát hoá thành 1 bảng chung là việc có
  thật nhưng rủi ro cao hơn (đụng nhiều cấu phần đang chạy), để lại Mục 7.
- **`Assessment`** — thẩm định năng lực/công nghệ trước khi ghi nhận, chưa rõ
  quy trình (ai thẩm định, tiêu chí gì) — cần làm rõ nghiệp vụ trước khi thiết
  kế, để lại Mục 7.

## 2. Căn cứ

- `VC-NV-018` — DATA group cấu phần 08, ISO 56001:2024 Clause 9 (Performance
  Evaluation), ISO/TR 56004:2019.
- `AGENTS.md` — giới hạn không mở rộng sang giải ngân/đầu tư (áp dụng cho việc
  loại `DueDiligence` khỏi phạm vi v1).
- `VC-KT-002` — mô hình Role/Permission/Scope dùng chung, `assertPartyScope`.
- Mã nguồn thật đã xác minh: `lib/actions/projects.ts` (`Project`, `Milestone`,
  `Deliverable`, `Agreement` đã có đầy đủ vòng đời sau khi vá ở cấu phần 07),
  `Solution.reviewScore` (`lib/actions/challenges.ts`) — mẫu hiển thị điểm số
  0..1 dạng phần trăm được tái sử dụng nguyên trạng cho `Evaluation.score`.

## 3. Quyết định phạm vi (Product Owner, 2026-08-20)

Chọn `Evaluation` gắn với `Project` làm phạm vi v1, vì:
1. Khớp đúng ISO 56001 Clause 9 (Performance Evaluation) — đánh giá hiệu quả
   hợp tác/dự án, không phải thẩm định trước giao dịch (đó là `DueDiligence`,
   bị chặn) hay duyệt nội dung đơn lẻ (đó là `Review`, đã có nơi khác).
2. Không trùng bất kỳ tính năng nào đã có.
3. Tận dụng ngay `Project` vừa hoàn thiện vòng đời trạng thái/mốc/hợp đồng ở
   cấu phần 07 — có sẵn dữ liệu thật để đánh giá.

## 4. Vị trí trong kiến trúc 11 cấu phần

Nhóm **EXECUTE** cùng 07 (Dự án & Giao dịch), 09 (Cộng tác & Mạng lưới).

| Cấu phần | Quan hệ với 08 — Thẩm định & Đánh giá |
|---|---|
| 07 — Dự án & Giao dịch | `Evaluation` gắn trực tiếp `Project.id` — đọc dữ liệu vòng đời (status/milestone/agreement) đã có, không sửa gì ở 07. |
| 05 — Tìm kiếm & Ghép nối | Điểm đánh giá dự án có thể dùng làm tín hiệu bổ sung cho `lib/matching.ts` trong tương lai (đối tác từng được đánh giá tốt) — không thuộc phạm vi v1. |
| 10 — Quản trị & Tuân thủ | Mọi lượt đánh giá ghi `AuditLog` (`CREATE_EVALUATION`), theo đúng nguyên tắc đã áp dụng cho 04/05/07. |
| 11 — Phân tích & Tác động | Điểm đánh giá trung bình là input tự nhiên cho KPI dashboard sau này — không thuộc phạm vi v1. |

## 5. Mô hình dữ liệu

```prisma
model Evaluation {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  evaluatedById String
  evaluatedBy   User     @relation(fields: [evaluatedById], references: [id])

  score    Float   // 0..1, cùng thang với Match.score/Solution.reviewScore đã có
  criteria String  // free-text — tiêu chí đánh giá (ADR-0001 Mục 6, cùng quy ước Affiliation.position)
  note     String?

  createdAt DateTime @default(now())

  @@index([projectId])
}
```

Quyết định thiết kế:
- **Append-only, không có update/delete.** Đánh giá là bản ghi lịch sử tại một
  thời điểm (có thể đánh giá nhiều lần trong vòng đời dự án — đầu kỳ/giữa
  kỳ/cuối kỳ), giống cách `AuditLog` không cho sửa — không phải một "trạng
  thái" duy nhất để cập nhật.
- **Không giới hạn theo `Project.status`.** Có thể đánh giá bất cứ lúc nào
  (kể cả khi dự án đang `ACTIVE`, không bắt buộc chờ `COMPLETED`) — khớp tinh
  thần đánh giá định kỳ của ISO Clause 9, không phải nghiệm thu một lần.
- **Không có trường "bên được đánh giá" riêng** (VD tổ chức nào trong 2 bên).
  V1 chỉ đánh giá dự án nói chung, không phải đánh giá chéo giữa 2 tổ chức —
  đơn giản hoá có chủ đích, ghi ở Mục 7 nếu cần mở rộng sau.

## 6. Phân quyền (thêm dòng vào `VC-KT-002` Mục 7.3, không đổi cấu trúc)

| Permission | SUPERADMIN | ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `evaluation.view` | P | PARTY | W (đánh giá do mình tạo) | PARTY | — |
| `evaluation.create` | P | PARTY | — | PARTY | — |

Dùng đúng `assertPartyScope`/`partyOrganizationIdsOfMatch` đã có (`lib/rbac.ts`)
— không cần hàm scope mới, cùng cách `Milestone`/`Deliverable`/`Agreement` đang
dùng ở cấu phần 07.

## 7. Khoảng trống — điều kiện mở cho `Review`/`Assessment`/`DueDiligence`

1. **`Review` tổng quát hoá** — khi nào 3 luồng duyệt rải rác (Solution/
   Deliverable/Publication) đủ trùng lặp để đáng gộp, thiết kế bảng
   `Review` chung + `ReviewLink` (entityType/entityId) — cùng mẫu
   `EvidenceLink` đã thiết kế ở `VC-KT-013` Mục 6.3.
2. **`Assessment`** — cần Product Owner trả lời: thẩm định năng lực/công nghệ
   trước khi ghi nhận do ai thực hiện (nội bộ VAST/HTIC hay tổ chức tự khai),
   tiêu chí nào — mới thiết kế được schema.
3. **`DueDiligence`** — chỉ mở khi đề án phê duyệt xây Funding & Investment
   Hub thật (`AGENTS.md`), không phải quyết định kỹ thuật.
4. **`Evaluation` hai chiều** (đánh giá chéo giữa bên Need và bên Supply/
   Expert) — nếu nghiệp vụ cần, thêm cột `evaluatedOrgId`/`targetOrgId`, không
   cần đổi cấu trúc bảng.

## 8. Kế hoạch triển khai kỹ thuật

| Việc | File |
|---|---|
| Model `Evaluation` (migration mới) | `prisma/schema.prisma` |
| `createEvaluationAction` (`assertPartyScope`, ghi `AuditLog`) | `lib/actions/evaluations.ts` (mới) |
| Nhãn hiển thị | `lib/evaluation-labels.ts` (mới, nếu cần) |
| Hiển thị + form trong trang dự án | `components/projects/evaluation-panel.tsx` (mới), nối vào `app/dashboard/projects/[id]/page.tsx` |

---

*Tài liệu này ở trạng thái `DRAFT`, code hoá cùng đợt theo đúng phạm vi Mục 3.
Đăng ký tại `00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.11_20260820.md`.*
