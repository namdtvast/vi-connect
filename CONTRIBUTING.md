# Đóng góp

## Luồng làm việc

1. Tạo nhánh từ `main`: `feat/<slug>`, `fix/<slug>` hoặc `docs/<slug>`.
2. Chỉ sửa trong phạm vi một mục tiêu có thể review.
3. Chạy `npm run check` trước khi commit.
4. Dùng Conventional Commits bằng tiếng Việt, ví dụ `feat(matching): thêm giải thích điểm`.
5. Mở pull request; không merge khi CI chưa đạt.

Không commit `.env`, credentials, dữ liệu thật, database dump hoặc hồ sơ có thông tin
cá nhân. Migration Prisma phải đi cùng thay đổi schema và phải chạy được từ database sạch.
