# KIẾN TRÚC BẢO MẬT VI CONNECT

**Mã tài liệu:** VC-KT-003
**Phiên bản:** v1.0
**Ngày soạn thảo:** 2026-08-17
**Ngày phê duyệt:** 2026-08-17
**Trạng thái:** APPROVED — kiến trúc mục tiêu chính thức; các hạng mục Mục 16 chưa code hoá vẫn là backlog, không phải điều kiện chặn phê duyệt thiết kế
**Nơi lưu chuẩn:** `03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/VC-KT-003-KienTrucBaoMat-APPROVED_v1.0_20260817.md`

## 1. Mục đích & phạm vi

Tài liệu này thiết kế các lớp **bảo mật kỹ thuật** của VI CONNECT — phần nằm
**ngoài** phân quyền (Role/Permission/Data Scope đã có ở `VC-KT-002`): transport,
xác thực, header HTTP, quản lý secret, log/giám sát, phụ thuộc phần mềm, sao
lưu/khôi phục, bảo vệ dữ liệu cá nhân và ứng phó sự cố.

Phạm vi bám đúng danh sách `SECURITY.md` đã đặt ra — *"trước production phải có
threat model, quản lý secret, backup/restore, log retention, kiểm thử phân
quyền và quy trình ứng phó sự cố"* — và đúng giới hạn Giai đoạn 1 của
`docs/SCOPE.md`: không dựng một Information Security Management System (ISMS)
đầy đủ kiểu ISO/IEC 27001 cho một MVP thí điểm, chỉ thiết kế đủ để vận hành an
toàn một ứng dụng giao dịch quy mô hiện tại (152 hội thành viên, 624 tổ chức
KH&CN — theo `docs/SCOPE.md`) trên một VPS đơn.

Tài liệu đã được phê duyệt làm kiến trúc mục tiêu chính thức; các mục ở Mục 16
(Kế hoạch triển khai) **chưa code hoá** tại thời điểm phê duyệt — thực hiện ở
PR riêng, mỗi PR đối chiếu lại đúng mục tương ứng của tài liệu này trước khi
merge (cùng nguyên tắc tách thiết kế khỏi code hoá với `VC-KT-002`).

## 2. Căn cứ

- `SECURITY.md` (gốc repo) — chính sách an toàn hiện hành, đặt ra 5 hạng mục
  bắt buộc trước production.
- `ARCHITECTURE.md`, `docs/SCOPE.md`, `docs/DEPLOYMENT.md` — ranh giới hệ
  thống, phạm vi Giai đoạn 1, hướng dẫn triển khai VPS thật (`viconnect.manai.vn`).
- `VC-KT-002` — mô hình phân quyền; tài liệu này không lặp lại nội dung đó,
  chỉ tham chiếu khi liên quan (Mục 6, 9).
- Mã nguồn và cấu hình triển khai thật: `lib/auth.ts`, `next.config.ts`,
  `.gitignore`, `.env.example`, `.env.production.example`,
  `deploy/nginx-viconnect.conf`, `deploy/vi-connect.service`,
  `.github/workflows/ci.yml`, `prisma/schema.prisma`.
- OWASP Top 10 (2021) — khung đối chiếu rủi ro ứng dụng web phổ biến, dùng để
  kiểm tra tài liệu này có bỏ sót nhóm rủi ro nào không (Mục 15), tương tự cách
  `VC-KT-002` Mục 16 đối chiếu với mô hình multi-tenant phổ biến.

## 3. Nguyên tắc thiết kế

1. Bảo mật là thuộc tính của **toàn bộ chuỗi triển khai** (mạng → hệ điều hành
   → ứng dụng → dữ liệu), không riêng một tầng — tài liệu đi theo đúng thứ tự
   này (Mục 5-13).
2. Đối chiếu **hiện trạng thật** (đã cấu hình ở đâu, dòng nào) trước khi đề
   xuất — không giả định một biện pháp đã có nếu chưa xác minh được trong mã
   nguồn/cấu hình triển khai.
3. Chỉ thiết kế biện pháp tương xứng với rủi ro và quy mô Giai đoạn 1 (Mục 1);
   biện pháp cấp doanh nghiệp lớn (WAF chuyên dụng, SIEM, secret vault) ghi
   nhận là điều kiện mở rộng (Mục 15), không phải yêu cầu ngay.
4. Không tự lưu, tự log hay tự hiển thị secret (`AUTH_SECRET`, mật khẩu,
   connection string) trong bất kỳ đầu ra nào, kể cả log lỗi.
5. Mọi biện pháp bảo mật phải có nơi thực thi rõ ràng — không dùng biện pháp
   chỉ tồn tại "theo quy trình" mà không có cơ chế kỹ thuật kiểm soát.

## 4. Threat model tối giản

| Tác nhân | Mục tiêu | Vector chính |
|---|---|---|
| Người ngoài không xác thực | Truy cập/đánh cắp dữ liệu, chiếm tài khoản | Đăng nhập vét cạn (brute-force), lỗ hổng ứng dụng web (XSS/CSRF/injection), lộ secret |
| User đã xác thực, vượt quyền | Đọc/sửa dữ liệu tổ chức khác | IDOR, lỗi scope-check — đã xử lý ở `VC-KT-002` Mục 7, 9, 11; tài liệu này không lặp lại |
| Quản trị/vận hành thao tác nhầm | Mất dữ liệu, lộ secret qua Git | Commit nhầm `.env`, xoá nhầm dữ liệu, không có backup |
| Chuỗi cung ứng phần mềm | Chèn mã độc qua dependency | Gói npm bị compromise, không rà soát CVE |

**Tài sản cần bảo vệ**: `User.passwordHash`, `AUTH_SECRET`, `DATABASE_URL`
(gồm mật khẩu Postgres), dữ liệu cá nhân trong `User`/`ExpertProfile` (email,
tên, hồ sơ chuyên môn), `AuditLog`.

Threat model này **tối giản có chủ đích** (không dùng STRIDE/DREAD đầy đủ) —
tương xứng Mục 1, đủ để dẫn ra các mục 5-13 bên dưới; mở rộng bài bản hơn khi
hệ thống xử lý dữ liệu nhạy cảm hơn (Mục 15, điểm 6).

## 5. Bảo mật tầng mạng & hạ tầng triển khai

Hiện trạng xác minh theo `docs/DEPLOYMENT.md`, `deploy/nginx-viconnect.conf`,
`deploy/vi-connect.service`:

| Biện pháp | Trạng thái | Vị trí |
|---|---|---|
| HTTPS qua Let's Encrypt (certbot) | Đã thiết kế trong hướng dẫn triển khai | `docs/DEPLOYMENT.md` Mục 8 |
| Firewall chỉ mở SSH/HTTP/HTTPS | Đã thiết kế | `docs/DEPLOYMENT.md` Mục 2 (`ufw allow OpenSSH`, `'Nginx Full'`) |
| Postgres chỉ nghe `localhost`, không mở port 5432 ra ngoài | Đã thiết kế | `docs/DEPLOYMENT.md` Mục 3 |
| App Next.js chỉ nghe nội bộ `127.0.0.1:3000`, Nginx đứng trước | Đã thiết kế | `docs/DEPLOYMENT.md` Mục 7 |
| systemd hardening (`NoNewPrivileges`, `PrivateTmp`) | Đã cấu hình | `deploy/vi-connect.service:29-30` |
| Giới hạn kích thước body request | Đã cấu hình (`client_max_body_size 10m`) | `deploy/nginx-viconnect.conf:15` |
| HTTP → HTTPS redirect | **Chưa xác nhận trong file cấu hình gốc** — certbot có thể tự thêm block redirect khi chạy `certbot --nginx`, nhưng `deploy/nginx-viconnect.conf` hiện chỉ có `listen 80` | Cần xác minh sau khi certbot chạy thật trên VPS (Mục 15) |
| HSTS (`Strict-Transport-Security`) | Chưa cấu hình | Mục 7 |

Đánh giá: các lớp mạng/hệ điều hành cơ bản đã được **thiết kế đúng** (mặc định
đóng, chỉ mở cổng cần thiết). Khoảng trống là ở tầng ứng dụng (Mục 6-7), không
phải tầng hạ tầng.

## 6. Xác thực (AuthN)

Hiện trạng xác minh tại `lib/auth.ts`:

- Mật khẩu hash bằng `bcryptjs` (`bcrypt.compare`, `lib/auth.ts:37`) — không
  lưu plaintext.
- Session dùng chiến lược JWT (`session: { strategy: "jwt" }`,
  `lib/auth.ts:8`), ký bằng `AUTH_SECRET` sinh ngẫu nhiên
  (`.env.production.example:11`, hướng dẫn `openssl rand -base64 32`).
- Đăng nhập thất bại được ghi `AuditLog` (`action: "LOGIN_FAILED"`,
  `lib/auth.ts:24-45`) — phân biệt `user_not_found` và `invalid_password`,
  không log mật khẩu.

Khoảng trống:

1. **Không có rate limiting / khoá tạm sau nhiều lần đăng nhập sai** — `AuditLog`
   ghi nhận `LOGIN_FAILED` nhưng không có cơ chế tự động chặn (đếm số lần
   trong khoảng thời gian, khoá IP/tài khoản tạm thời). Đây là khoảng trống
   chính khiến vét cạn mật khẩu (credential stuffing/brute-force) vẫn khả thi
   về mặt kỹ thuật dù có audit log.
2. **Không có chính sách độ mạnh mật khẩu** ở tầng tạo tài khoản — chưa xác
   minh được validation tối thiểu (độ dài, không phải mật khẩu phổ biến) tại
   nơi tạo `User` (seed/admin tạo tài khoản, chưa có action tự đăng ký —
   Phụ lục B của `VC-KT-002`, mục B9).
3. **Cookie session** — NextAuth v5 mặc định bật `httpOnly`, `sameSite=lax`
   và `secure` khi chạy production qua HTTPS; tài liệu này ghi nhận là hành vi
   mặc định của thư viện, **chưa có cấu hình tường minh** ghi đè giá trị này
   trong `lib/auth.ts` để đảm bảo không bị đổi ngầm khi nâng cấp phiên bản.

## 7. HTTP security header

Xác minh: `next.config.ts` hiện chỉ cấu hình `turbopack.root`, không có khối
`headers()`; không có `middleware.ts` ở gốc repo; `deploy/nginx-viconnect.conf`
không set thêm response header nào ngoài các header proxy bắt buộc cho NextAuth
(`X-Forwarded-*`, `deploy/nginx-viconnect.conf:22-25`).

→ **Chưa có header bảo mật nào được cấu hình** — không phải chỉ thiếu một
mục, mà là toàn bộ nhóm chưa bật:

| Header | Mục đích | Đề xuất giá trị Giai đoạn 1 |
|---|---|---|
| `Strict-Transport-Security` | Ép trình duyệt luôn dùng HTTPS sau lần truy cập đầu | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | Chặn trình duyệt tự đoán MIME type | `nosniff` |
| `X-Frame-Options` / `Content-Security-Policy: frame-ancestors` | Chặn nhúng trang vào `<iframe>` domain khác (clickjacking) | `DENY` / `frame-ancestors 'none'` |
| `Referrer-Policy` | Hạn chế rò rỉ URL nội bộ qua header Referer | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Giảm rủi ro XSS nếu có lỗ hổng chèn script | Cần khảo sát danh sách nguồn script/style thật của UI trước khi chốt — không đặt `unsafe-inline` tràn lan |
| `Permissions-Policy` | Tắt các API trình duyệt không dùng (camera, mic, geolocation) | `camera=(), microphone=(), geolocation=()` |

Nơi cấu hình: đề xuất khối `headers()` trong `next.config.ts` (áp dụng mọi
route qua chính Next.js, không phụ thuộc việc Nginx có được cập nhật đồng bộ
hay không) — quyết định vị trí chính xác và giá trị CSP thật thuộc PR code hoá
riêng (Mục 16), sau khi khảo sát toàn bộ script/style đang dùng trong `app/`.

## 8. CSRF & Server Actions

Next.js Server Actions (dùng trong toàn bộ `lib/actions/*.ts` theo
`ARCHITECTURE.md` Mục "Quy tắc kỹ thuật") có cơ chế kiểm tra **same-origin**
tích hợp sẵn cho mọi request mutation — framework tự so `Origin`/`Host` của
request, chặn nếu không khớp. Đây là lý do biến `AUTH_TRUST_HOST="true"`
(`.env.production.example:13-14`) bắt buộc phải đúng khi chạy sau reverse
proxy (Nginx) — nếu thiếu, chính cơ chế bảo vệ CSRF/host-header này có thể vô
hiệu hoá luồng NextAuth thay vì bảo vệ nó.

**Chưa xác minh**: liệu domain production (`viconnect.manai.vn`) có cần khai
báo tường minh trong cấu hình `allowedOrigins` của Server Actions
(tuỳ phiên bản Next.js) hay mặc định suy ra đúng từ header `Host`/
`X-Forwarded-Host` mà Nginx đã set (`deploy/nginx-viconnect.conf:22-25`) — cần
xác nhận khi triển khai thật lên VPS (Mục 15).

## 9. Quản lý secret

Hiện trạng:

- `.env*` nằm trong `.gitignore` trừ `.env.example`/`.env.production.example`
  (`.gitignore:24-26`) — secret thật không vào Git theo thiết kế.
- `AUTH_SECRET` sinh bằng `openssl rand -base64 32`, hướng dẫn rõ trong
  `.env.production.example:10-11` và `docs/DEPLOYMENT.md` Mục 5.
- Secret production nạp qua `EnvironmentFile=/var/www/vi-connect/.env` của
  systemd (`deploy/vi-connect.service:20`) — không hard-code trong service
  file hay mã nguồn.
- CI dùng secret giả lập rõ ràng không dùng cho production
  (`AUTH_SECRET: ci-only-not-for-production`, `.github/workflows/ci.yml:18`).

Khoảng trống: chưa có **secret manager** (Vault, AWS Secrets Manager...) hay
cơ chế xoay vòng (rotation) `AUTH_SECRET`/mật khẩu DB định kỳ — với quy mô một
VPS đơn, biến môi trường quản lý thủ công là tương xứng Mục 1, 3; ghi nhận là
điều kiện nâng cấp khi có nhiều môi trường/đội vận hành lớn hơn (Mục 15).

## 10. Audit log, giám sát & log retention

- Cơ chế `AuditLog` (schema, các hành vi bắt buộc ghi) đã thiết kế đầy đủ ở
  `VC-KT-002` Mục 10 — tài liệu này không lặp lại, chỉ bổ sung phần **vận
  hành log** mà `VC-KT-002` không phụ trách.
- Log runtime hiện đọc qua `journalctl -u vi-connect -f`
  (`docs/DEPLOYMENT.md` Mục 9, 10) — dùng log mặc định của `systemd-journald`.

Khoảng trống:

1. **Chưa có chính sách log retention** — `systemd-journald` mặc định có thể
   xoay vòng theo dung lượng đĩa, không theo một số ngày xác định; chưa có cấu
   hình `journald.conf` (`SystemMaxUse=`, `MaxRetentionSec=`) tương ứng yêu cầu
   giữ log của `SECURITY.md`.
2. **Chưa có alerting** khi có dấu hiệu tấn công — ví dụ nhiều `LOGIN_FAILED`
   liên tiếp cùng `email`/IP trong thời gian ngắn (liên quan trực tiếp Mục 6,
   điểm 1) hiện chỉ nằm im trong `AuditLog`, không có ai được báo.
3. **Chưa có giám sát uptime/lỗi runtime** (health check, alert khi
   `systemctl status vi-connect` báo lỗi) ngoài việc SSH vào xem thủ công.

## 11. Quản lý phụ thuộc phần mềm (dependency security)

Xác minh `.github/workflows/ci.yml`: pipeline CI hiện chạy `npm ci` +
`npm run check` (lint, typecheck, test, Prisma validate, build) — **không có
bước rà soát lỗ hổng dependency** (`npm audit`, Dependabot, Renovate...).
`package.json` hiện có 12 dependency + 10 devDependency trực tiếp; rủi ro chủ
yếu đến từ transitive dependency của `next`, `next-auth`, `prisma`.

Đề xuất tối thiểu Giai đoạn 1 (chưa code hoá — Mục 16):

- Thêm bước `npm audit --audit-level=high` vào `ci.yml` (không chặn merge
  ngay nếu tạo nhiều false positive ở giai đoạn đầu — cần thống nhất ngưỡng).
- Bật Dependabot version updates (file `.github/dependabot.yml`) cho `npm`,
  chu kỳ hợp lý (tuần), không cần bản trả phí.

## 12. Sao lưu & khôi phục (Backup/DR)

Xác minh: `docs/DEPLOYMENT.md` hiện **không có bước sao lưu Postgres** — tài
liệu triển khai dừng ở migrate/build/chạy app, không đề cập backup định kỳ hay
quy trình khôi phục. Đây là khoảng trống trực tiếp với yêu cầu *"backup/restore"*
đã nêu sẵn trong `SECURITY.md`.

Đề xuất tối thiểu Giai đoạn 1 (chưa code hoá — Mục 16):

- `pg_dump` định kỳ (cron hằng ngày) ra file nén, lưu ngoài VPS chạy app (ví
  dụ object storage riêng) — tránh trường hợp mất cả app lẫn backup nếu VPS
  gặp sự cố.
- Giữ tối thiểu 7 bản gần nhất; kiểm thử khôi phục (`pg_restore` vào môi
  trường staging) tối thiểu 1 lần trước khi coi là quy trình dùng được — có
  backup chưa kiểm thử khôi phục không tính là có DR.
- Ghi lại quy trình này vào `docs/DEPLOYMENT.md` khi hiện thực hoá, không tạo
  tài liệu triển khai thứ hai (nguyên tắc một-dữ-liệu-một-nơi-lưu, `VC-QT-001`).

## 13. Bảo vệ dữ liệu cá nhân (PII)

Trường PII xác minh trong `prisma/schema.prisma`: `User.email`, `User.name`,
`ExpertProfile.title/headline/bio/fields/skills`. Không có trường CCCD/hộ
chiếu, số tài khoản ngân hàng, hay dữ liệu tài chính cá nhân trong schema hiện
tại — đúng giới hạn `AGENTS.md` (không tự mở rộng sang giải ngân/đầu tư).

Hiện trạng: các trường trên lưu dạng plaintext trong Postgres, không mã hoá ở
tầng field. Đánh giá: **tương xứng** với mức nhạy cảm dữ liệu hiện tại (hồ sơ
nghề nghiệp công khai có kiểm soát hiển thị qua `status`/scope ở `VC-KT-002`
Mục 8), miễn là kiểm soát truy cập (đã thiết kế `VC-KT-002`) và transport
(Mục 5) được bật đúng. Mã hoá field-level chỉ cần thiết khi có loại dữ liệu
nhạy cảm hơn xuất hiện (Mục 15, điểm 6) — không phải nhu cầu hiện tại.

## 14. Ứng phó sự cố (Incident Response)

`SECURITY.md` hiện chỉ có 1 dòng về báo lỗ hổng ("liên hệ chủ sở hữu repo qua
kênh nội bộ") — chưa có runbook xử lý khi sự cố **đã xảy ra** (không phải báo
cáo trước). Khung tối thiểu đề xuất (chưa vận hành thật — cần chủ repo xác
nhận kênh liên lạc và người trực trước khi coi là quy trình chính thức):

1. **Phát hiện** — qua alerting (Mục 10, chưa có) hoặc báo cáo thủ công.
2. **Cô lập** — với quy mô VPS đơn: khoá tài khoản nghi ngờ (`User.status`,
   chưa có field — `VC-KT-002` Mục 11, 14), hoặc dừng service qua
   `systemctl stop vi-connect` nếu mức độ nghiêm trọng cao.
3. **Điều tra** — dùng `AuditLog` + `journalctl` (Mục 10) để dựng lại chuỗi
   hành vi.
4. **Khắc phục & khôi phục** — vá lỗ hổng, khôi phục từ backup nếu dữ liệu bị
   ảnh hưởng (Mục 12).
5. **Ghi nhận sau sự cố** — cập nhật `SECURITY.md`/tài liệu này nếu sự cố hé lộ
   khoảng trống thiết kế mới.

## 15. Đối chiếu OWASP Top 10 (2021)

| Rủi ro | Hiện trạng VI CONNECT | Tham chiếu |
|---|---|---|
| A01 Broken Access Control | Có thiết kế + đã vá IDOR mức Cao | `VC-KT-002` Mục 7, 9, Phụ lục B |
| A02 Cryptographic Failures | Mật khẩu hash bcrypt, HTTPS ở tầng triển khai; chưa mã hoá field-level (chấp nhận được — Mục 13) | Mục 5, 6, 13 |
| A03 Injection | Prisma ORM tham số hoá query mặc định, không thấy raw SQL nối chuỗi trong `lib/actions/` | Chưa rà soát toàn bộ — Mục 16 |
| A04 Insecure Design | Threat model tối giản đã có (Mục 4); chưa có review thiết kế định kỳ | Mục 4 |
| A05 Security Misconfiguration | **Khoảng trống chính** — thiếu toàn bộ security header (Mục 7) | Mục 7 |
| A06 Vulnerable & Outdated Components | Chưa có `npm audit`/Dependabot trong CI | Mục 11 |
| A07 Identification & Auth Failures | Thiếu rate limiting/lockout đăng nhập | Mục 6 |
| A08 Software & Data Integrity Failures | `npm ci` dùng lockfile, CI kiểm tra trước build; chưa ký/verify artifact triển khai | Mục 11 |
| A09 Security Logging & Monitoring Failures | Có `AuditLog`, thiếu retention + alerting | Mục 10 |
| A10 Server-Side Request Forgery (SSRF) | Chưa thấy tính năng gọi URL do user cung cấp (fetch ngoài) trong `lib/actions/`; rủi ro thấp ở Giai đoạn 1, cần rà soát lại nếu thêm import từ URL/webhook | Mục 16 |

Kết luận: khoảng trống lớn nhất tập trung ở **A05 (header)** và **A07 (chống
brute-force)** — hai mục Mục 6-7 nên ưu tiên code hoá trước nếu chỉ chọn được
một phần trong PR đầu tiên.

## 16. Phần chưa bật & điều kiện bật thêm

Theo đúng tinh thần `VC-KT-002` Mục 13 — các phần dưới đây **chưa triển khai**,
liệt kê để không "âm thầm coi như đã xong":

1. **Rate limiting / khoá tạm đăng nhập** (Mục 6) — chưa có, cần chọn cơ chế
   (in-memory đơn giản cho 1 instance, hoặc bảng DB đếm lần thất bại) tương
   xứng quy mô VPS đơn hiện tại — không cần Redis/dịch vụ ngoài ngay.
2. **Security header** (Mục 7) — chưa cấu hình, cần khảo sát CSP thật trước
   khi chốt giá trị.
3. **Xác nhận HTTP→HTTPS redirect + HSTS sau khi certbot chạy thật trên VPS**
   (Mục 5) — không thể xác minh từ mã nguồn tĩnh, cần kiểm tra sau triển khai.
4. **Log retention + alerting** (Mục 10) — chưa cấu hình `journald`, chưa có
   kênh báo động.
5. **`npm audit`/Dependabot trong CI** (Mục 11).
6. **Backup/restore Postgres định kỳ có kiểm thử khôi phục** (Mục 12).
7. **Mã hoá field-level cho PII** — không cần ngay (Mục 13); bật khi có loại
   dữ liệu nhạy cảm hơn (tài chính, định danh cá nhân) xuất hiện trong schema.
8. **Secret manager/rotation tự động** (Mục 9) — không cần ngay với một VPS
   đơn; bật khi có nhiều môi trường/đội vận hành.
9. **Runbook ứng phó sự cố chính thức có người trực xác nhận** (Mục 14) —
   khung đã có, chưa được chủ repo phê duyệt vận hành.
10. **Rà soát A03/A08/A10 (OWASP) toàn diện trên `lib/actions/`** (Mục 15) —
    đánh giá sơ bộ tích cực, chưa phải rà soát đầy đủ từng file.

## 17. Kế hoạch triển khai kỹ thuật (nếu duyệt)

| Việc | File | Ghi chú |
|---|---|---|
| Khối `headers()` cấu hình security header | `next.config.ts` | Mục 7 — cần chốt CSP trước |
| Rate limiting đăng nhập | `lib/auth.ts` (`authorize`) hoặc middleware mới | Mục 6, điểm 1 |
| Bước `npm audit` + Dependabot | `.github/workflows/ci.yml`, `.github/dependabot.yml` (mới) | Mục 11 |
| Script/cron backup Postgres | `deploy/` (file mới), cập nhật `docs/DEPLOYMENT.md` | Mục 12 |
| Cấu hình `journald` retention | `docs/DEPLOYMENT.md` (bổ sung bước) | Mục 10 |
| Xác nhận HSTS + redirect sau certbot | `deploy/nginx-viconnect.conf` (cập nhật sau khi xác minh thật trên VPS) | Mục 5 |

---

*Tài liệu này đã `APPROVED` làm kiến trúc mục tiêu — phê duyệt thiết kế, không
tự động coi các hạng mục Mục 16 là đã code hoá. Khi một hạng mục ở Mục 17 được
hiện thực hoá và qua `npm run check`, cập nhật bảng Mục 5-14 tương ứng (đổi
"chưa cấu hình"/"chưa có" thành trạng thái đã áp dụng kèm file:dòng, theo đúng
cách `VC-KT-002` Phụ lục B ghi nhận đã vá) và tăng phiên bản phù hợp mức thay
đổi (Mục 5, `VC-QT-001`) — không sửa trực tiếp bản `v1.0` này.*
