import { cn } from "@/lib/utils";

// Logo chính thức (brand/logo/vi-connect-logo-primary.svg, sao chép vào
// public/brand/ để phục vụ tĩnh). Dùng thẻ <img> thuần thay vì next/image vì
// đây là SVG tĩnh, tránh phải bật images.dangerouslyAllowSVG cho pipeline
// tối ưu ảnh không cần thiết với vector có sẵn.
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/vi-connect-logo-primary.svg"
      alt="VI CONNECT — Việt Nam · Kết nối tri thức và công nghệ"
      className={cn("h-10 w-auto", className)}
    />
  );
}
