<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# VI CONNECT — quy tắc làm việc cho Codex và coding agents

Đọc `README.md`, `ARCHITECTURE.md` và `docs/SCOPE.md` trước khi thay đổi phạm vi.
Đây là MVP Giai đoạn 1; không tự mở rộng sang giải ngân, đầu tư hoặc AI tự quyết định.

## Lệnh kiểm tra bắt buộc

```bash
npm run check
```

Không tuyên bố hoàn thành nếu lint, typecheck, unit test, Prisma validation hoặc
production build chưa đạt. Không dùng dữ liệu demo làm bằng chứng về VAST/HTIC.

## Quy tắc kiến trúc

- Quy tắc nghiệp vụ thuần đặt tại `lib/domain/` và phải có test.
- Kiểm tra xác thực/phân quyền ở server; giao diện chỉ hỗ trợ trải nghiệm người dùng.
- Tích hợp MANLAB-AIOS qua `lib/integrations/manlab/` và contract phiên bản hóa;
  không sao chép toàn bộ module hoặc dữ liệu nội bộ.
- Không sửa hoặc xóa migration đã được chia sẻ; tạo migration mới.
- Không commit `.env`, secret, dữ liệu cá nhân hoặc dữ liệu sản xuất.

Commit theo Conventional Commits bằng tiếng Việt. Mọi thay đổi vào `main` phải qua PR
và CI, trừ khi chủ repo có chỉ thị khác.
