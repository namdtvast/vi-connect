import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VI CONNECT — Nền tảng kết nối tri thức, công nghệ và nguồn lực đầu tư",
  description:
    "Nền tảng số quản trị, kết nối và huy động nguồn lực khoa học, công nghệ và đổi mới sáng tạo Việt Nam.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
