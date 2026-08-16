# VI CONNECT — Brand Identity v3.1

Trạng thái: **Đề xuất — chờ VAST/HTIC phê duyệt chính thức** và kiểm tra khả năng đăng ký bảo hộ trước khi công bố.

Xem toàn bộ hệ thống nhận diện (logo, màu sắc, typography, ứng dụng) tại [`guidelines/index.html`](guidelines/index.html), hoặc bản chiến lược gốc 14 trang tại [`guidelines/VI_CONNECT_Brand_Guidelines_v3_1.pdf`](guidelines/VI_CONNECT_Brand_Guidelines_v3_1.pdf).

## Cấu trúc thư mục

| Thư mục | Nội dung |
|---|---|
| `logo/` | Logo ngang + biểu tượng, bản primary/reverse, SVG + PNG. |
| `applications/` | LinkedIn cover, profile avatar, infographic giải thích logo (đã sửa lỗi PNG rỗng). |
| `cip/` | Business card, letterhead A4, slide tiêu đề, chữ ký email — hoàn thiện thêm trong phiên làm việc này. |
| `favicon/` | Favicon/app icon 8 kích thước (16→512px) + bản maskable, đã cài vào `app/`. |
| `tokens/` | `colors.json` (tóm tắt màu dùng cho code) + bản gốc `brand-tokens-v3.1.json`. |
| `guidelines/` | Brand guidelines hợp nhất (HTML) + tài liệu chiến lược gốc (PDF/DOCX). |
| `alt-concepts/network-mark/` | Phương án logo thay thế (mạng lưới 3 nút hội tụ hình chữ V) — không dùng, giữ lại tham khảo. |

## Việc đã hoàn thiện trong phiên này

- **Sửa lỗi**: `applications/profile-avatar.svg` và `applications/linkedin-cover.svg` xuất PNG rỗng do dùng `<image href="../logos/...svg">` tham chiếu chéo file — nhiều bộ rasterize (kể cả pipeline tạo bản gốc) không nhúng được SVG ngoài qua `<image>`. Đã thay bằng `<svg>` lồng trực tiếp (inline), không còn phụ thuộc file ngoài.
- **Bổ sung**: business card (2 mặt), letterhead A4, slide tiêu đề thuyết trình, chữ ký email (HTML thật, không phải ảnh), bộ favicon/app icon đầy đủ kích thước.
- **Tích hợp code**: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` đã dùng biểu tượng mới; `app/globals.css` đã cập nhật đúng bảng màu v3.1 (`--brand`, `--accent`, `--gold`, `--red`, `--cyan`…).

## Điều chỉnh nội dung sau bản giao v3.1 gốc

`VI_CONNECT_Brand_Guidelines_v3_1.docx` và `.pdf` đã được sửa trực tiếp (không phải bản gốc nguyên vẹn từ `tokens/manifest-v3.1.csv` — checksum trong file đó vẫn giữ nguyên làm mốc đối chiếu bản giao ban đầu):

- Trang 4 ("Ý tưởng tạo hình"): bổ sung nghĩa kép của chữ **I** — vừa tiếp nối "Việt Nam", vừa là **Innovation (Đổi mới sáng tạo)**, đúng tinh thần HTIC.
- Trang 6 (bảng màu, dòng Vietnam Red): "VI = Việt Nam" → "Chữ V trong VI = Việt Nam" cho khớp cách diễn giải mới.
- `guidelines/index.html` (bản hợp nhất) đã cập nhật tương ứng từ trước.

SHA-256 sau chỉnh sửa: docx `87972cc3…d76f4cd`, pdf `efdb851a…840ac89a4`.

## Việc còn lại trước khi công bố chính thức

Theo đúng quy trình phát hành trong tài liệu gốc (mục "12 · Quản trị thương hiệu"): xác nhận pháp lý tên gọi, phê duyệt phương án logo/tagline, kiểm tra tương phản, khóa phiên bản 3.1 và chỉ định người phê duyệt cuối cùng.
