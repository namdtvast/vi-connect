# Hướng dẫn triển khai VI CONNECT lên VPS — viconnect.manai.vn

Bộ tài liệu này dành cho coder/DevOps cấu hình triển khai bản build hiện tại
của VI CONNECT (Next.js 16, Prisma 7 + PostgreSQL, NextAuth v5) lên VPS riêng,
gắn với tên miền **viconnect.manai.vn**.

Trạng thái nguồn: repo GitHub `namdtvast/vi-connect`, nhánh `main` (đã merge PR
#1 — MVP Giai đoạn 1 + trang chủ thiết kế lại). Đây là **bản thí điểm/demo**,
chưa phải bản chính thức của tổ chức chủ quản — xem `README.md` mục "Ghi chú
dữ liệu" và `docs/SCOPE.md` trước khi công bố rộng rãi.

## 1. Tóm tắt nhanh (checklist)

- [ ] VPS Ubuntu 22.04/24.04 (hoặc Debian 12), tối thiểu 1 vCPU / 2GB RAM.
- [ ] Node.js **≥ 20.9** (khuyến nghị 22 LTS).
- [ ] PostgreSQL 15+ (tự cài trên VPS hoặc dùng dịch vụ managed như Neon/Supabase).
- [ ] DNS: bản ghi `A` của `viconnect.manai.vn` trỏ về IP VPS.
- [ ] Nginx làm reverse proxy + SSL qua Let's Encrypt (certbot).
- [ ] Chạy app bằng `systemd` (file mẫu có sẵn ở `deploy/vi-connect.service`).
- [ ] Chỉ mở port `80`/`443` ra ngoài; port `3000` (app) và `5432` (Postgres)
      chỉ nghe trên `localhost`.
- [ ] Biến môi trường production lấy theo `.env.production.example`, **không
      commit `.env` thật lên git**.
- [ ] **Không** chạy `prisma db seed` trên production trừ khi cố ý tạo dữ liệu
      demo — dữ liệu seed là dữ liệu mẫu, không phải số liệu thật.

## 2. Chuẩn bị VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib ufw

# Node.js 22 LTS qua NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # phải >= 20.9

# Firewall: chỉ mở SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 3. Tạo database PostgreSQL (nếu tự host trên VPS)

```bash
sudo -u postgres psql <<'SQL'
CREATE USER viconnect WITH PASSWORD 'THAY_BANG_MAT_KHAU_MANH';
CREATE DATABASE viconnect_prod OWNER viconnect;
SQL
```

Postgres mặc định chỉ nghe `localhost` — không cần mở port 5432 ra ngoài
(đã chặn ở bước firewall). Nếu dùng dịch vụ managed (Neon/Supabase/RDS...)
thì bỏ qua bước này và dùng connection string họ cấp.

## 4. Lấy mã nguồn & cài dependencies

```bash
sudo mkdir -p /var/www/vi-connect
sudo chown $USER:$USER /var/www/vi-connect
git clone https://github.com/namdtvast/vi-connect.git /var/www/vi-connect
cd /var/www/vi-connect
npm ci
```

## 5. Cấu hình biến môi trường production

Sao chép mẫu và điền giá trị thật:

```bash
cp .env.production.example .env
```

Sinh `AUTH_SECRET` ngẫu nhiên đủ mạnh:

```bash
openssl rand -base64 32
```

Nội dung `.env` cần có (xem chi tiết từng biến trong
`.env.production.example`):

- `DATABASE_URL` — connection string Postgres production ở bước 3.
- `AUTH_SECRET` — giá trị vừa sinh ở trên.
- `AUTH_TRUST_HOST="true"`
- `NEXTAUTH_URL="https://viconnect.manai.vn"`

**Không commit file `.env` này lên git** — nó đã nằm trong `.gitignore`.

## 6. Migrate database & build

```bash
npx prisma generate
npx prisma migrate deploy   # áp toàn bộ migration đã có, KHÔNG dùng `migrate dev` trên production
npm run build                # chạy next build --webpack
```

Nếu muốn có dữ liệu demo để xem thử giao diện (khuyến nghị chỉ dùng ở môi
trường staging, không dùng cho domain chính thức công khai lâu dài):

```bash
npx prisma db seed
```

## 7. Chạy app bằng systemd

Copy file mẫu, sửa lại `User=`/đường dẫn nếu khác:

```bash
sudo cp deploy/vi-connect.service /etc/systemd/system/vi-connect.service
sudo systemctl daemon-reload
sudo systemctl enable --now vi-connect
sudo systemctl status vi-connect
```

App sẽ chạy nội bộ ở `http://127.0.0.1:3000`, systemd tự khởi động lại nếu
crash hoặc khi VPS reboot.

## 8. Cấu hình Nginx + domain + SSL

```bash
sudo cp deploy/nginx-viconnect.conf /etc/nginx/sites-available/viconnect.manai.vn
sudo ln -s /etc/nginx/sites-available/viconnect.manai.vn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Lấy chứng chỉ SSL Let's Encrypt (yêu cầu DNS đã trỏ đúng về VPS trước khi chạy)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d viconnect.manai.vn
```

Certbot sẽ tự sửa file Nginx để bật HTTPS và cấu hình gia hạn chứng chỉ tự
động (`certbot renew` chạy qua systemd timer có sẵn).

## 9. Kiểm tra sau triển khai

- Truy cập `https://viconnect.manai.vn` — phải thấy trang chủ VI CONNECT,
  banner "Môi trường thí điểm..." ở đầu trang.
- `https://viconnect.manai.vn/login` đăng nhập thử được (nếu đã seed demo).
- Kiểm tra chứng chỉ SSL hợp lệ (khóa xanh trên trình duyệt).
- `sudo journalctl -u vi-connect -f` để xem log runtime khi cần debug.

## 10. Quy trình cập nhật sau này

```bash
cd /var/www/vi-connect
git pull origin main
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
sudo systemctl restart vi-connect
```

## Ghi chú quan trọng

- Đây là **Giai đoạn 1 (thí điểm)** theo `docs/SCOPE.md` — chưa xử lý thanh
  toán/giải ngân thật, AI matching là bộ chấm điểm rule-based có giải thích
  (`lib/matching.ts`), không gọi API AI ngoài.
- Không dùng dữ liệu trong `prisma/seed.ts` làm bằng chứng số liệu chính thức
  của tổ chức chủ quản.
- Trước khi công bố domain `viconnect.manai.vn` rộng rãi, xác nhận lại với
  chủ repo về việc dùng cụm "nền tảng số quốc gia" (chỉ dùng khi có quyết
  định/công nhận của cơ quan có thẩm quyền) và tên tổ chức chủ trì.
