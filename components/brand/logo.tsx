import { cn } from "@/lib/utils";

// Logo chính thức (brand/logo/vi-connect-logo-{primary,reverse}.svg). Bản
// phục vụ tại public/brand/ đã bỏ nền cứng (trong suốt, hòa với nền web) và
// phóng to riêng dòng tagline để đọc được ở kích thước hiển thị trên web —
// file gốc trong brand/logo/ (dành cho in ấn) giữ nguyên, không chỉnh sửa.
// Dùng thẻ <img> thuần thay vì next/image vì đây là SVG tĩnh.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-10 w-auto", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/vi-connect-logo-primary.svg"
        alt="VI CONNECT — Việt Nam · Kết nối tri thức và công nghệ"
        className="h-full w-auto dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/vi-connect-logo-reverse.svg"
        alt="VI CONNECT — Việt Nam · Kết nối tri thức và công nghệ"
        className="hidden h-full w-auto dark:block"
      />
    </span>
  );
}
