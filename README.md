# VI CONNECT — MVP thí điểm

Nền tảng số kết nối tri thức, công nghệ và nguồn lực đầu tư — do Trung tâm Đổi mới
sáng tạo công nghệ cao (HTIC) đề xuất, thuộc Viện Hàn lâm Khoa học và Công nghệ Việt
Nam (VAST). Xây dựng theo tài liệu `VC-DA-001`, phạm vi rút gọn về đúng phạm vi ưu
tiên (Năm 1) mà chính đề án tự quy định — xem `docs/SCOPE.md` để biết lý do. 11 cấu
phần nghiệp vụ không chia theo giai đoạn dự án — chỉ khác nhau ở mức độ đã triển khai
(đã code thật / backlog).

## Bắt đầu từ đâu

- [Quy ước quản lý file](00_QUAN-TRI/VC-QT-001-QuyUocDatTenVaLuuTruFile-APPROVED_v1.3_20260819.md)
- [Danh mục tài liệu trung tâm](00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.7_20260820.md)
- [Thuyết minh đề án hiện hành](01_CHIEN-LUOC-DE-AN/02_DANG-SOAN-THAO/VC-DA-001-ThuyetMinhDeAn-DRAFT_v0.6_20260817.docx)
- [Kiến trúc nghiệp vụ 11 cấu phần](02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN/README.md)
- [Kiến trúc ứng dụng](ARCHITECTURE.md)
- [Quy trình phát triển: Nghiên cứu → Thiết kế → Code → Test → Loop → Deploy](05_QUAN-LY-DU-AN/VC-PM-001-QuyTrinhPhatTrien-DRAFT_v0.1_20260820.md)
- [Phạm vi MVP](docs/SCOPE.md)
- [Hướng dẫn đóng góp](CONTRIBUTING.md) và [chính sách bảo mật](SECURITY.md)
- [Lịch sử thay đổi](CHANGELOG.md) và [manifest repo](repo-manifest.yaml)

## Cấu trúc repo

| Khu vực | Nội dung |
|---|---|
| `00_QUAN-TRI/` | Quy định, danh mục và báo cáo quản trị |
| `01_CHIEN-LUOC-DE-AN/` | Nguồn, bản soạn thảo, thẩm định, phê duyệt và lịch sử đề án |
| `02_KIEN-TRUC-NGHIEP-VU/` | Taxonomy và 11 cấu phần nghiệp vụ |
| `03_KIEN-TRUC-KY-THUAT/` | Hệ thống, dữ liệu, API, bảo mật và hạ tầng |
| `04_SAN-PHAM-THUONG-HIEU/` | Sản phẩm truyền thông và infographic quản lý như hồ sơ |
| `05_QUAN-LY-DU-AN/` | Kế hoạch, rủi ro, biên bản, nghiệm thu và bàn giao |
| `06_PHAP-LY-TUAN-THU/` | Pháp lý, dữ liệu cá nhân, sở hữu trí tuệ và hợp đồng |
| `07_DU-LIEU-VA-DANH-MUC/` | Data dictionary, taxonomy và schema trao đổi |
| `08_NGHIEN-CUU-THAM-KHAO/` | Nguồn nghiên cứu, tiêu chuẩn và đối sánh |
| `09_PHAT-HANH/` | Manifest phát hành gắn với commit/tag Git |
| `90_LUU-TRU/` | Tài liệu hết hiệu lực cần bảo toàn |
| `99_TAM/` | File có thể tái tạo; không commit nội dung tạm |
| `app/`, `components/`, `lib/`, `prisma/` | Mã nguồn và schema ứng dụng |
| `tests/`, `.github/workflows/` | Kiểm thử và CI |

## Stack

Next.js 16 (App Router) · TypeScript · Prisma 7 + PostgreSQL · NextAuth v5 (Credentials,
JWT) · Tailwind CSS.

## Chạy local

```bash
npm install
npm run dev
```

Yêu cầu Postgres đang chạy và `DATABASE_URL` trong `.env` (mặc định trỏ vào Postgres
cài qua Homebrew: `brew services start postgresql@16`). Lần đầu:

```bash
npx prisma migrate dev
npx prisma db seed
```

Đăng nhập demo: `admin@vi-connect.demo` / `Password123!` (SUPERADMIN). Xem thêm tài
khoản demo khác trong `prisma/seed.ts`.

## Trong phạm vi hiện tại (đã code thật, không mock)

Đánh số theo đúng baseline 11 cấu phần
([VC-NV-001](02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN/VC-NV-001-11CauPhanDataIso-APPROVED_v1.0_20260817.md)):

- **01 — Hồ sơ & Định danh**: đăng ký/xác minh hồ sơ chuyên gia, danh mục hội thành
  viên/tổ chức KH&CN, delegated administration theo tổ chức (`ADMIN` chỉ thấy dữ
  liệu của mình).
- **02 — Công nghệ & Giải pháp**: đăng nguồn cung công nghệ/giải pháp kèm TRL.
- **03 — Tri thức & Dữ liệu**: đăng công bố khoa học (`Publication`), tra DOI thật
  qua Crossref để tự điền tiêu đề/tác giả/năm, xác minh (Maker-Checker nhẹ, chỉ
  `SUPERADMIN`/`ADMIN` — chưa mở `EXPERT` tự đăng). Patent/Dataset/Knowledge/Evidence
  vẫn ở backlog (xem `VC-KT-013`).
- **04 — Bài toán & Nhu cầu**: đăng nhu cầu, ngân hàng bài toán đầy đủ vòng đời (tiếp
  nhận → công bố → nhận giải pháp → đánh giá).
- **05 — Tìm kiếm & Ghép nối**: bộ chấm điểm giải thích được (`lib/matching.ts`) —
  không gọi API AI ngoài, dựa trên trùng lĩnh vực + tương đồng từ khóa + TRL/kinh
  nghiệm. Mỗi đề xuất hiển thị lý do và trọng số. Có thể thay bằng embedding/LLM thật
  sau này mà không đổi schema hay giao diện gọi.
- **06 — Nguồn lực & Tài trợ**: danh mục nguồn lực/chương trình tài trợ do tổ chức tự
  công bố (`FundingSource`) — chỉ theo dõi danh mục, chưa có due diligence hay giải
  ngân thật.
- **07 — Dự án & Giao dịch**: chuyển match đã chấp nhận thành dự án, mốc thực hiện,
  hợp đồng/thỏa thuận (chỉ theo dõi trạng thái, chưa xử lý thanh toán thật).
- **10 — Quản trị & Tuân thủ**: nhật ký audit hệ thống (`AuditLog`), chỉ `SUPERADMIN`
  xem được toàn bộ — chưa có màn hình chính sách/rủi ro/quy trình phê duyệt.
- **11 — Phân tích & Tác động**: KPI Dashboard Connect/Match/Mobilize/Impact tính trực
  tiếp từ dữ liệu sống, Match Funnel theo đúng mô hình đề án.

## Backlog (chưa xây, theo đúng nguyên tắc "không mở rộng khi lớp trước
chưa có giao dịch thật" của đề án)

- **03 đầy đủ**: `Patent`, `Dataset`, `Knowledge`, `Evidence` (hợp nhất
  `CapabilityEvidence`) — hiện chỉ có `Publication`, xem `VC-KT-013`.
- **06 đầy đủ**: Funding & Investment Hub, due diligence, giải ngân thật (hiện chỉ có
  danh mục cơ bản — xem mục scope ở trên).
- **08 — Thẩm định & Đánh giá**: chưa có model/trang riêng (review, due diligence,
  evaluation có cấu trúc).
- **09 — Cộng tác & Mạng lưới**: chưa có model/trang riêng (partnership, team, network).
- **10 đầy đủ**: AI Governance, Risk & Compliance, Forecasting dashboards — hiện chỉ có
  nhật ký audit thô, chưa có chính sách/quy trình phê duyệt/đánh giá rủi ro.
- Tích hợp thật ORCID/OpenAlex/ROR/Techmart Vietnam (hiện chỉ có trường lưu định danh).
- Semantic/embedding matching thật thay cho scoring rule-based.
- Thanh toán/giải ngân thật, đối soát tài chính.

## Ghi chú dữ liệu

Toàn bộ dữ liệu trong `prisma/seed.ts` là dữ liệu demo tự tạo cho môi trường thí điểm,
**không phải** số liệu thật của VAST/HTIC hay các hội thành viên. Banner cảnh báo demo
hiển thị trên mọi trang.

## Triển khai production

Chưa deploy. Cần xác nhận: nhà cung cấp hosting (Vercel/VPS khác), nhà cung cấp
Postgres production (Neon/Supabase/RDS...), và tên miền trước khi triển khai thật.
