import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VI CONNECT — Nền tảng kết nối tri thức, công nghệ và nguồn lực đầu tư",
  description:
    "Nền tảng số quản trị, kết nối và huy động nguồn lực khoa học, công nghệ và đổi mới sáng tạo Việt Nam.",
};

// Set .dark trước khi React hydrate để tránh nháy sáng/tối khi tải trang (FOUC).
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("theme");
    var isDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
