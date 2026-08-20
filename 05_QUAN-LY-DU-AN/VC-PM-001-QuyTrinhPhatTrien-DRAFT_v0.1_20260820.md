# QUY TRÌNH PHÁT TRIỂN VI CONNECT — NGHIÊN CỨU → THIẾT KẾ → CODE → TEST → LOOP → DEPLOY

**Mã tài liệu:** VC-PM-001
**Phiên bản:** v0.1
**Ngày soạn thảo:** 2026-08-20
**Trạng thái:** DRAFT — quy trình đề xuất, áp dụng thử; xem Mục 8 về điều kiện lên `v1.0`
**Nơi lưu chuẩn:** `05_QUAN-LY-DU-AN/VC-PM-001-QuyTrinhPhatTrien-DRAFT_v0.1_20260820.md`

## 1. Mục đích & phạm vi

Tài liệu này chốt một vòng đời làm việc chung — 6 bước: **Nghiên cứu → Thiết kế →
Code → Test → Loop → Deploy** — và gắn **mỗi bước với đúng thư mục, mã tài liệu,
lệnh và file đã tồn tại thật trong repo** (không phải mô hình lý thuyết chung
chung). Mục tiêu: bất kỳ ai (người hoặc coding agent) bắt đầu một hạng mục mới
trên VI CONNECT đều biết đầu ra của bước trước là gì, làm ở đâu, và điều kiện gì
mới được sang bước sau — tránh tình trạng nhảy thẳng vào code khi thiết kế chưa
đủ rõ, hoặc nhầm lẫn giữa lớp "thiết kế nghiệp vụ" và "thiết kế kỹ thuật" như đã
xảy ra ở cấu phần 03 (xem Mục 4.2).

Phạm vi: quy trình cấp dự án/tính năng (feature-level), không thay thế quy trình
quản trị tài liệu chi tiết đã có ở `VC-QT-001`, cũng không thay thế nguyên tắc
phạm vi cố định của `docs/SCOPE.md` — tài liệu này **tuân theo** cả hai, chỉ
sắp xếp lại thành một vòng đời dễ theo dõi.

## 2. Căn cứ

- `VC-QT-001` (v1.3) — quy ước đặt tên/lưu trữ, mã nhóm tài liệu, dải số `NV`↔`KT`.
- `docs/SCOPE.md` — nguyên tắc *"không mở rộng chỉ vì hoàn thành phần mềm"*.
- `ARCHITECTURE.md` — ranh giới thư mục mã nguồn, ranh giới MANLAB-AIOS.
- `AGENTS.md` — lệnh kiểm tra bắt buộc (`npm run check`), phạm vi cố định của
  MVP thí điểm (11 cấu phần không chia theo giai đoạn dự án, chỉ khác nhau ở
  mức độ đã triển khai — đã code thật / backlog).
- `CONTRIBUTING.md` — luồng nhánh Git, Conventional Commits.
- `.github/workflows/ci.yml`, `docs/DEPLOYMENT.md`, `deploy/` — cơ chế Test/Deploy
  đã cấu hình thật.
- `VC-KT-002`/`VC-KT-003` — tiền lệ tách "tài liệu thiết kế" khỏi "PR code hoá",
  mỗi PR đối chiếu lại đúng mục tương ứng của thiết kế trước khi merge.

## 3. Sơ đồ tổng quan

```text
┌──────────────┐   ┌──────────────────────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  1. NGHIÊN   │──▶│      2. THIẾT KẾ          │──▶│ 3. CODE  │──▶│ 4. TEST  │──▶│ 6. DEPLOY│
│     CỨU      │   │  2a. Nghiệp vụ (NV)       │   │          │   │          │   │          │
│  08_NGHIEN-  │   │  2b. Kỹ thuật (KT)        │   │  app/    │   │ npm run  │   │  docs/   │
│  CUU-THAM-   │   │  02_KIEN-TRUC-NGHIEP-VU/  │   │  lib/    │   │  check   │   │DEPLOYMENT│
│  KHAO/       │   │  03_KIEN-TRUC-KY-THUAT/   │   │  prisma/ │   │  + CI    │   │09_PHAT-  │
└──────────────┘   └──────────────────────────┘   └──────────┘   └────┬─────┘   │  HANH/   │
                                                                        │         └────┬─────┘
                                                              ┌─────────▼─────────┐    │
                                                              │     5. LOOP        │◀───┘
                                                              │  (rẽ nhánh — Mục 5)│
                                                              └─────────┬──────────┘
                                                                        │
                                              quay lại đúng bước phát sinh vấn đề
                                              (2a / 2b / 3 / 4) — không tự mở rộng
                                                sang cấu phần ngoài baseline 11
```

`Loop` không phải bước cuối cùng đơn thuần — đó là **điểm quyết định**: đi tiếp
sang Deploy, hay quay lại một trong các bước trước. Chi tiết rẽ nhánh ở Mục 5.

## 4. Chi tiết từng bước

### 4.1 Nghiên cứu

| | |
|---|---|
| Nơi lưu | `08_NGHIEN-CUU-THAM-KHAO/` |
| Mã tài liệu | `TK` (Tài liệu nghiên cứu, tiêu chuẩn và tham khảo) |
| Đầu vào | Đề án gốc (`VC-DA-001`), tiêu chuẩn ISO liên quan, nền tảng đối sánh (VD VUSTA CONNECT — `VC-TK-001/002`), quy định pháp luật (`VC-TK-003`), kiến trúc tham khảo ngoài (`VC-TK-004`) |
| Đầu ra | Tài liệu `REFERENCE` — **chỉ để đối chiếu, không phải quyết định** (`08_NGHIEN-CUU-THAM-KHAO/README.md`: *"lưu một nguồn tại đây không đồng nghĩa VI CONNECT phê duyệt nội dung"*) |
| Điều kiện sang bước 2 | Đã xác định rõ **câu hỏi cần trả lời** (nghiệp vụ hay kỹ thuật) và nguồn đối chiếu đủ tin cậy — không bắt buộc phải có tài liệu `TK` mới cho mọi việc nhỏ, chỉ khi có quyết định ảnh hưởng kiến trúc/tuân thủ. |

### 4.2 Thiết kế — tách 2 lớp, không gộp

Đây là bước hay bị nhầm nhất (xem hội thoại đã dẫn tới việc sửa `VC-QT-001` lên
`v1.3`) — bắt buộc phân biệt:

| | 2a. Thiết kế nghiệp vụ | 2b. Thiết kế kỹ thuật |
|---|---|---|
| Trả lời | Cái gì / vì sao | Bằng cách nào |
| Nơi lưu | `02_KIEN-TRUC-NGHIEP-VU/` | `03_KIEN-TRUC-KY-THUAT/` |
| Mã tài liệu | `NV` | `KT` |
| Đánh số | `011–021` theo cấu phần (`VC-NV-011..021`) | `001–010` dùng chung; `011–021` theo cấu phần, **trùng số với `NV`** (`VC-QT-001` Mục 4.3, sau khi sửa `v1.3`) |
| Độc lập công nghệ? | Có | Không — gắn Next.js/Prisma/Postgres cụ thể |
| Ví dụ | `VC-NV-013` (Tri thức & Dữ liệu) | `VC-KT-013` (schema, permission, adapter tương ứng) |
| Điều kiện sang Code | Không bắt buộc `APPROVED` — có thể code hoá từ `DRAFT` nếu chủ đề án xác nhận, nhưng **PR code phải đối chiếu đúng mục tương ứng của tài liệu thiết kế** (tiền lệ `VC-KT-002`/`003`) |

Không viết trước `KT` cho cấu phần chưa chuẩn bị code hoá (`VC-QT-001` v1.3) —
tránh tồn kho tài liệu thiết kế không ai dùng.

### 4.3 Code

| | |
|---|---|
| Nơi | `app/` (route/page/server action), `components/` (UI, không quyết định phân quyền), `lib/domain/` (quy tắc thuần, có unit test), `lib/actions/` (workflow + audit), `lib/integrations/` (adapter ngoài), `prisma/` (schema/migration/seed) — đúng `ARCHITECTURE.md` |
| Nhánh Git | `feat/<slug>`, `fix/<slug>`, `docs/<slug>` từ `main` (`CONTRIBUTING.md`) |
| Commit | Conventional Commits tiếng Việt |
| Ràng buộc | Không tự mở rộng ngoài phạm vi cố định của MVP thí điểm (`AGENTS.md`) — không thêm cấu phần thứ 12, không tự mở khoá nghiệp vụ bị cấm (giải ngân/đầu tư/AI tự quyết định); không sửa/xoá migration đã chia sẻ — tạo migration mới; không hard-code secret; không copy nguyên module MANLAB-AIOS |
| Điều kiện sang Test | Code chạy được cục bộ; với UI phải thử qua trình duyệt thật trước khi coi là xong, không chỉ dựa test tự động |

### 4.4 Test

| | |
|---|---|
| Lệnh chuẩn | `npm run check` = `generate → lint → typecheck → test → prisma:validate → build` (`package.json`) |
| CI | `.github/workflows/ci.yml` — chạy đúng `npm run check` trên mọi push `main` và pull request |
| Điều kiện merge | Không merge khi CI chưa đạt (`CONTRIBUTING.md`) |
| Bổ sung khi đụng vùng nhạy cảm | Đối chiếu `VC-KT-003` (bảo mật) nếu chạm auth/PII/secret; đối chiếu `VC-KT-002` (phân quyền) nếu thêm resource/permission mới |
| Điều kiện sang Loop | CI xanh + (nếu có UI) đã xác nhận bằng mắt trên trình duyệt — không tuyên bố xong chỉ vì lint/build qua |

### 4.5 Deploy

| | |
|---|---|
| Hướng dẫn | `docs/DEPLOYMENT.md` — VPS `viconnect.manai.vn`, Nginx + certbot + systemd |
| Cấu hình mẫu | `deploy/nginx-viconnect.conf`, `deploy/vi-connect.service` |
| Hồ sơ phát hành | `09_PHAT-HANH/` — chỉ lưu **manifest tham chiếu commit/tag Git**, không copy file nguồn (`09_PHAT-HANH/README.md`) |
| Điều kiện tiên quyết | Theo `README.md` mục "Triển khai production": **chưa deploy thật** — cần xác nhận nhà cung cấp hosting, Postgres production, tên miền trước; và 5 hạng mục bắt buộc của `SECURITY.md`/`VC-KT-003` (rate limiting, header, backup, log retention, ứng phó sự cố) |

## 5. Loop — quy tắc rẽ nhánh

Sau Test, chọn đúng 1 trong các nhánh dưới đây, không được "vừa merge vừa để
treo" một hạng mục chưa rõ trạng thái:

| Tình huống phát hiện ở Test/Review | Quay lại bước | Ghi chú |
|---|---|---|
| Lỗi code, sai logic, thiếu test case | **3. Code** | Sửa trong cùng nhánh Git, không cần đổi tài liệu thiết kế |
| Thiết kế kỹ thuật sai/thiếu (schema, permission, API) | **2b. Thiết kế kỹ thuật** | Cập nhật `KT` bằng **phiên bản mới** (`v0.1 → v0.2`...), không sửa đè bản đã dùng làm căn cứ (`VC-QT-001` Mục 8) |
| Giả định nghiệp vụ sai (VD entity không đúng thực tế, ISO map sai) | **2a. Thiết kế nghiệp vụ** | Cùng nguyên tắc tăng phiên bản, không sửa đè `APPROVED` |
| Muốn code hoá một cấu phần đang ở trạng thái backlog, hoặc thêm cấu phần thứ 12 ngoài baseline 11 | **1. Nghiên cứu** | Bắt buộc — đúng nguyên tắc *"không mở rộng chỉ vì hoàn thành phần mềm"* (`docs/SCOPE.md`); backlog không tự động được code hoá chỉ vì đã rảnh tay, phải qua lại đúng vòng đời; không tự quyết định mở rộng ở bước Code/Test |
| Đạt yêu cầu, đúng phạm vi thiết kế đã duyệt | **6. Deploy** (hoặc merge `main`, chờ đợt phát hành) | — |

`Loop` cũng là nơi dọn khoảng trống đã ghi nhận nhưng chưa xử lý — ví dụ mục
"Phần chưa bật" của `VC-KT-003` Mục 16 hay Phụ lục B của `VC-KT-002` — mỗi lần
quay lại Loop nên rà bảng đó trước khi mở hạng mục hoàn toàn mới.

## 6. Ràng buộc xuyên suốt mọi bước

1. Một dữ liệu — một nơi lưu (`VC-QT-001` Mục 6) — không sao chép quyết định
   thiết kế hay kết quả nghiên cứu sang nhiều tài liệu.
2. Không tuyên bố một bước "xong" nếu chỉ hoàn thành một phần (VD viết code
   xong nhưng chưa `npm run check`, hoặc thiết kế xong nhưng chưa ai xác nhận
   nghiệp vụ) — dùng đúng nhãn trạng thái `DRAFT/REVIEW/APPROVED` thay vì mô tả
   mơ hồ.
3. Chỉ chủ đề án/Product Owner quyết định mở rộng phạm vi (nhánh cuối Mục 5);
   coding agent hoặc dev không tự quyết định thay.
4. Mọi thay đổi quyền/xác thực/dữ liệu cá nhân phải ghi `AuditLog` — không phụ
   thuộc đang ở bước nào trong vòng đời này.

## 7. Bảng tra nhanh

| Bước | Thư mục/lệnh chính |
|---|---|
| Nghiên cứu | `08_NGHIEN-CUU-THAM-KHAO/` |
| Thiết kế nghiệp vụ | `02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN/` |
| Thiết kế kỹ thuật | `03_KIEN-TRUC-KY-THUAT/` |
| Code | `app/`, `components/`, `lib/`, `prisma/` |
| Test | `npm run check`, `.github/workflows/ci.yml` |
| Loop | Mục 5 bảng rẽ nhánh + `VC-KT-002`/`VC-KT-003` mục "chưa bật" |
| Deploy | `docs/DEPLOYMENT.md`, `deploy/`, `09_PHAT-HANH/` |

## 8. Trạng thái tài liệu

`DRAFT` — áp dụng thử cho hạng mục tiếp theo trước khi lên `v1.0`. Sau khi dùng
thử qua ít nhất 1 vòng đầy đủ (một tính năng đi hết 6 bước), rà lại xem bước nào
mô tả chưa khớp thực tế rồi mới chốt `APPROVED`.

---

*Đã đăng ký tại `00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.7_20260820.md`.*
