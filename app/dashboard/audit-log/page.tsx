import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  Globe2,
  Plus,
  ScrollText,
  ShieldCheck,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 20;

function buildHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard/audit-log?${qs}` : "/dashboard/audit-log";
}

function actionIcon(action: string): { icon: LucideIcon; className: string } {
  if (action.includes("DELETE")) return { icon: Trash2, className: "text-danger" };
  if (action.includes("REJECT")) return { icon: XCircle, className: "text-danger" };
  if (action.includes("VERIFY")) return { icon: ShieldCheck, className: "text-accent" };
  if (action.includes("CREATE")) return { icon: Plus, className: "text-brand" };
  return { icon: ScrollText, className: "text-muted" };
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "SUPERADMIN") redirect("/dashboard");

  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const requestedPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where = query
    ? {
        OR: [
          { action: { contains: query, mode: "insensitive" as const } },
          { entity: { contains: query, mode: "insensitive" as const } },
          { entityId: { contains: query, mode: "insensitive" as const } },
          { user: { name: { contains: query, mode: "insensitive" as const } } },
          { user: { email: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const total = await db.auditLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const logs = await db.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản trị & Tuân thủ"
        badge="Cấu phần 10"
        description="Nhật ký audit hệ thống — mọi thao tác tạo/ghép nối/thay đổi trạng thái quan trọng đều được ghi lại tự động, phục vụ truy vết và tuân thủ. Chỉ SUPERADMIN xem được toàn bộ nhật ký. Giai đoạn 1 chưa có màn hình chính sách/rủi ro/quy trình phê duyệt — thuộc backlog Giai đoạn 2-3."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ScrollText} label="Tổng bản ghi" value={total} color="brand" />
        <StatCard icon={Clock} label="Trang hiện tại" value={`${page}/${totalPages}`} color="cyan" />
        <StatCard
          icon={Clock}
          label="Sự kiện gần nhất"
          value={logs[0] ? formatDateTime(logs[0].createdAt) : "—"}
          color="gold"
        />
        <StatCard icon={Globe2} label="Phạm vi" value="Toàn hệ thống" color="accent" />
      </div>

      <form method="GET" className="flex gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Tìm theo hành động, đối tượng, người thực hiện..."
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          Tìm kiếm
        </Button>
        {query && (
          <Link href="/dashboard/audit-log">
            <Button type="button" variant="ghost">
              Xóa lọc
            </Button>
          </Link>
        )}
      </form>

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={query ? `Không tìm thấy nhật ký khớp "${query}"` : "Chưa có nhật ký nào"}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-muted text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Thời gian</th>
                    <th className="text-left px-4 py-3">Người thực hiện</th>
                    <th className="text-left px-4 py-3">Hành động</th>
                    <th className="text-left px-4 py-3">Đối tượng</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const { icon: ActionIcon, className } = actionIcon(log.action);
                    return (
                      <tr key={log.id} className="border-t border-border">
                        <td className="px-4 py-3 whitespace-nowrap text-muted">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {log.user ? (
                            <>
                              <div className="font-medium">{log.user.name}</div>
                              <div className="text-xs text-muted">{log.user.email}</div>
                            </>
                          ) : (
                            <span className="text-muted">Hệ thống</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-background border border-border rounded px-1.5 py-0.5 inline-flex items-center gap-1.5">
                            <ActionIcon className={`w-3.5 h-3.5 ${className}`} aria-hidden="true" />
                            {log.action}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {log.entity}
                          {log.entityId ? ` · ${log.entityId}` : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">
          Trang {page}/{totalPages} · {total} bản ghi
          {query ? ` khớp "${query}"` : ""}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={buildHref(page - 1, query)}>
              <Button size="sm" variant="outline">
                ← Trang trước
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              ← Trang trước
            </Button>
          )}
          {page < totalPages ? (
            <Link href={buildHref(page + 1, query)}>
              <Button size="sm" variant="outline">
                Trang sau →
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Trang sau →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
