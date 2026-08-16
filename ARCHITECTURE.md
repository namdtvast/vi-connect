# Kiến trúc VI CONNECT

VI CONNECT là ứng dụng giao dịch độc lập, không phải thư mục con hay bản sao của
MANLAB-AIOS. Nền tảng tổ chức code theo bốn miền nghiệp vụ của MVP:

1. **Connect** — tài khoản, chuyên gia, tổ chức và xác minh hồ sơ.
2. **Discover & Match** — nhu cầu, nguồn cung, bài toán, giải pháp và matching có giải thích.
3. **Execute** — dự án, mốc thực hiện, sản phẩm bàn giao và thỏa thuận.
4. **Impact** — KPI Connect–Match–Mobilize–Impact và audit log.

## Ranh giới với MANLAB-AIOS

MANLAB-AIOS là nguồn tham chiếu cho capability, quy trình, kiểm soát, AI governance
và compliance của ETV. VI CONNECT chỉ trao đổi qua API contract, schema phiên bản hóa
hoặc event contract. Không import trực tiếp dữ liệu sản xuất, hồ sơ ISO hay đường dẫn
`MPxx/Mxx` vào database của VI CONNECT.

Adapter tích hợp sau này đặt tại `lib/integrations/manlab/`. Mọi quyết định tích hợp
phải ghi trong `docs/adr/` trước khi kết nối dữ liệu thật.

## Quy tắc kỹ thuật

- `app/`: route, page, server action và route handler của Next.js.
- `components/`: giao diện; không chứa quyết định phân quyền phía máy chủ.
- `lib/domain/`: quy tắc thuần, không phụ thuộc framework và có unit test.
- `lib/actions/`: application workflow, xác thực và ghi audit.
- `lib/integrations/`: adapter tới hệ thống bên ngoài.
- `prisma/`: schema, migration và seed demo.

AI chỉ đưa ra gợi ý có giải thích. Con người hoặc hội đồng chịu trách nhiệm lựa chọn,
thẩm định, nghiệm thu và phê duyệt cuối cùng.
