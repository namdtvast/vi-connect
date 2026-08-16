"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/enums";

type NavItem = { href: string; label: string; roles?: Role[] };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan (KPI)" },
  { href: "/dashboard/organizations", label: "Tổ chức & hội thành viên" },
  { href: "/dashboard/experts", label: "Chuyên gia" },
  { href: "/dashboard/needs", label: "Nhu cầu" },
  { href: "/dashboard/supplies", label: "Nguồn cung / công nghệ" },
  { href: "/dashboard/matches", label: "Ghép nối (Matching)" },
  { href: "/dashboard/challenges", label: "Ngân hàng bài toán" },
  { href: "/dashboard/projects", label: "Dự án & hợp đồng" },
];

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm",
              active
                ? "bg-brand/10 text-brand font-medium"
                : "text-foreground/80 hover:bg-background"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
