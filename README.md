# VI CONNECT — Giai đoạn 1 (MVP thí điểm)

Nền tảng số kết nối tri thức, công nghệ và nguồn lực đầu tư — do Trung tâm Đổi mới
sáng tạo công nghệ cao (HTIC) đề xuất, thuộc Viện Hàn lâm Khoa học và Công nghệ Việt
Nam (VAST). Xây dựng theo `VI_CONNECT_TM_Dean.docx`, phạm vi rút gọn về đúng Giai đoạn
1 (Năm 1) mà chính đề án tự quy định — xem `docs/SCOPE.md` để biết lý do.

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

Đăng nhập demo: `admin@vi-connect.demo` / `Password123!` (VAST_ADMIN). Xem thêm tài
khoản demo khác trong `prisma/seed.ts`.

## Trong scope Giai đoạn 1 (đã code thật, không mock)

- **01+10 — Hồ sơ & tổ chức**: đăng ký/xác minh hồ sơ chuyên gia, danh mục hội thành
  viên/tổ chức KH&CN, delegated administration theo tổ chức (`HOI_ADMIN` chỉ thấy dữ
  liệu của mình).
- **02+06 — Cung cầu & Ngân hàng bài toán**: đăng nhu cầu/công nghệ, ngân hàng bài toán
  đầy đủ vòng đời (tiếp nhận → công bố → nhận giải pháp → đánh giá).
- **05 — AI Matching**: bộ chấm điểm giải thích được (`lib/matching.ts`) — không gọi
  API AI ngoài, dựa trên trùng lĩnh vực + tương đồng từ khóa + TRL/kinh nghiệm. Mỗi đề
  xuất hiển thị lý do và trọng số. Có thể thay bằng embedding/LLM thật ở Giai đoạn 2 mà
  không đổi schema hay giao diện gọi.
- **04+09 — Dự án & hợp đồng**: chuyển match đã chấp nhận thành dự án, mốc thực hiện,
  hợp đồng/thỏa thuận (chỉ theo dõi trạng thái, chưa xử lý thanh toán thật).
- **11 — KPI Dashboard**: Connect/Match/Mobilize/Impact tính trực tiếp từ dữ liệu sống,
  Match Funnel theo đúng mô hình đề án.

## Backlog Giai đoạn 2-3 (chưa xây, theo đúng nguyên tắc "không mở rộng khi lớp trước
chưa có giao dịch thật" của đề án)

- Cấu phần 07, 08 đầy đủ: Funding & Investment Hub, due diligence, giải ngân thật.
- AI Governance, Risk & Compliance, Forecasting dashboards (11.6-11.11).
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
