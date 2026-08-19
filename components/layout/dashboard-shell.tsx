"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";

export function DashboardShell({
  sidebar,
  userName,
  roleLabel,
  avatarSrc,
  children,
}: {
  sidebar: React.ReactNode;
  userName: string;
  roleLabel: string;
  avatarSrc?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Đóng drawer mỗi khi chuyển trang — tránh menu che nội dung sau khi bấm
  // một mục điều hướng trên di động.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface border-r border-border p-4 flex flex-col overflow-y-auto transform transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:max-w-none md:shrink-0 md:translate-x-0 md:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu điều hướng"
          className="md:hidden self-end mb-2 p-2 -mr-2 text-foreground/60"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebar}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          onMenuClick={() => setOpen(true)}
          userName={userName}
          roleLabel={roleLabel}
          avatarSrc={avatarSrc}
        />
        <main className="flex-1 p-6 bg-background overflow-auto">{children}</main>
      </div>
    </div>
  );
}
