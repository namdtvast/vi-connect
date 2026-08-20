"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  Database,
  FileText,
  LayoutGrid,
  Link2,
  Package,
  ScrollText,
  ShieldCheck,
  Users,
  Users2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/enums";

type NavItem = { href: string; label: string; icon: LucideIcon; roles?: Role[] };
type NavGroup = { group: string; items: NavItem[] };

// Sắp xếp theo kiến trúc nghiệp vụ 11 cấu phần VI-CONNECT (baseline
// VC-NV-001, 02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN). Chỉ liệt kê các cấu phần
// đã có trang triển khai thật. 08 (Đánh giá dự án) và 09 (Đội thực hiện)
// không có trang danh sách riêng — nội dung nằm lồng trong trang chi tiết
// từng dự án (07) — nên cùng trỏ về /dashboard/projects, chỉ khác nhãn để
// người dùng biết tính năng đó nằm ở đâu (VC-KT-018, VC-KT-019).
const OVERVIEW: NavItem = { href: "/dashboard", label: "11 · Tổng quan (KPI)", icon: LayoutGrid };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "CONNECT",
    items: [
      { href: "/dashboard/organizations", label: "01 · Tổ chức & hội thành viên", icon: Building2 },
      { href: "/dashboard/experts", label: "01 · Chuyên gia", icon: Users },
      { href: "/dashboard/supplies", label: "02 · Công nghệ & giải pháp", icon: Package },
      { href: "/dashboard/publications", label: "03 · Tri thức & dữ liệu", icon: BookOpen },
      { href: "/dashboard/needs", label: "04 · Nhu cầu", icon: FileText },
      { href: "/dashboard/challenges", label: "04 · Ngân hàng bài toán", icon: Database },
    ],
  },
  {
    group: "MATCH",
    items: [{ href: "/dashboard/matches", label: "05 · Ghép nối (Matching)", icon: Link2 }],
  },
  {
    group: "MOBILIZE",
    items: [{ href: "/dashboard/funding-sources", label: "06 · Nguồn lực & tài trợ", icon: Wallet }],
  },
  {
    group: "EXECUTE",
    items: [
      { href: "/dashboard/projects", label: "07 · Dự án & hợp đồng", icon: FileText },
      { href: "/dashboard/projects", label: "08 · Đánh giá dự án", icon: ClipboardCheck },
      { href: "/dashboard/projects", label: "09 · Đội thực hiện", icon: Users2 },
    ],
  },
  {
    group: "GOVERN & IMPACT",
    items: [
      {
        href: "/dashboard/permissions",
        label: "10 · Quản lý phân quyền",
        icon: ShieldCheck,
        roles: ["SUPERADMIN", "ADMIN"],
      },
      {
        href: "/dashboard/audit-log",
        label: "10 · Nhật ký hệ thống",
        icon: ScrollText,
        roles: ["SUPERADMIN"],
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
        active ? "bg-brand/10 text-brand font-medium" : "text-foreground/80 hover:bg-background"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const allowed = (item: NavItem) => !item.roles || item.roles.includes(role);

  return (
    <nav className="space-y-4">
      <div className="space-y-1">
        <NavLink
          href={OVERVIEW.href}
          label={OVERVIEW.label}
          icon={OVERVIEW.icon}
          active={isActive(pathname, OVERVIEW.href)}
        />
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
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(pathname, item.href)}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
