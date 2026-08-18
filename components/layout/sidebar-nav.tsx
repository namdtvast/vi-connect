"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/enums";

type NavItem = { href: string; label: string; roles?: Role[] };
type NavGroup = { group: string; items: NavItem[] };

// Sắp xếp theo kiến trúc nghiệp vụ 11 cấu phần VI-CONNECT (baseline
// VC-NV-001, 02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN). Chỉ liệt kê các cấu phần
// đã có trang triển khai thật ở Giai đoạn 1; cấu phần chưa xây (03, 08, 09)
// chưa xuất hiện trong menu để tránh liên kết chết.
const OVERVIEW: NavItem = { href: "/dashboard", label: "Tổng quan (KPI)" };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "CONNECT",
    items: [
      { href: "/dashboard/organizations", label: "01 · Tổ chức & hội thành viên" },
      { href: "/dashboard/experts", label: "01 · Chuyên gia" },
      { href: "/dashboard/supplies", label: "02 · Công nghệ & giải pháp" },
      { href: "/dashboard/needs", label: "04 · Nhu cầu" },
      { href: "/dashboard/challenges", label: "04 · Ngân hàng bài toán" },
    ],
  },
  {
    group: "MATCH",
    items: [{ href: "/dashboard/matches", label: "05 · Ghép nối (Matching)" }],
  },
  {
    group: "MOBILIZE",
    items: [{ href: "/dashboard/funding-sources", label: "06 · Nguồn lực & tài trợ" }],
  },
  {
    group: "EXECUTE",
    items: [{ href: "/dashboard/projects", label: "07 · Dự án & hợp đồng" }],
  },
  {
    group: "GOVERN & IMPACT",
    items: [
      {
        href: "/dashboard/permissions",
        label: "10 · Quản lý phân quyền",
        roles: ["SUPERADMIN", "ADMIN"],
      },
      {
        href: "/dashboard/audit-log",
        label: "10 · Nhật ký hệ thống",
        roles: ["SUPERADMIN"],
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-md px-3 py-2 text-sm",
        active ? "bg-brand/10 text-brand font-medium" : "text-foreground/80 hover:bg-background"
      )}
    >
      {label}
    </Link>
  );
}

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const allowed = (item: NavItem) => !item.roles || item.roles.includes(role);

  return (
    <nav className="space-y-4">
      <div className="space-y-1">
        <NavLink href={OVERVIEW.href} label={OVERVIEW.label} active={isActive(pathname, OVERVIEW.href)} />
      </div>
      {NAV_GROUPS.map((g) => {
        const items = g.items.filter(allowed);
        if (items.length === 0) return null;
        return (
          <div key={g.group} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {g.group}
            </div>
            {items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(pathname, item.href)}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
