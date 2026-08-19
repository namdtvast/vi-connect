"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { resolvePageTitle } from "@/lib/page-titles";

export function TopHeader({
  onMenuClick,
  userName,
  roleLabel,
  avatarSrc,
}: {
  onMenuClick: () => void;
  userName: string;
  roleLabel: string;
  avatarSrc?: string | null;
}) {
  const pathname = usePathname();
  const title = resolvePageTitle(pathname);

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center gap-3 px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Mở menu điều hướng"
        className="md:hidden p-2 -ml-2 text-foreground/80"
      >
        <Menu className="w-5 h-5" />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="hidden sm:flex items-center gap-1.5 text-sm text-muted min-w-0"
      >
        <span>VI CONNECT</span>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="text-foreground font-medium truncate">{title}</span>
      </nav>
      <span className="sm:hidden font-medium text-foreground truncate">{title}</span>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Tìm kiếm"
          title="Tìm kiếm (sắp có)"
          className="w-9 h-9 rounded-md flex items-center justify-center text-foreground/70 hover:bg-background hover:text-foreground transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Thông báo"
          title="Thông báo (sắp có)"
          className="w-9 h-9 rounded-md flex items-center justify-center text-foreground/70 hover:bg-background hover:text-foreground transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border">
          <Avatar src={avatarSrc} name={userName} size="sm" />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate max-w-[140px]">{userName}</div>
            <div className="text-xs text-muted truncate max-w-[140px]">{roleLabel}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
