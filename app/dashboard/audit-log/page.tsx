import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 20;

function buildHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard/audit-log?${qs}` : "/dashboard/audit-log";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "VAST_ADMIN") redirect("/dashboard");

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
      <div>
        <h1 className="text-xl font-semibold">Quản trị &amp; Tuân thủ (cấu phần 10)</h1>
        <p className="text-sm text-muted mt-1">
          Nhật ký audit hệ thống — mọi thao tác tạo/ghép nối/thay đổi trạng thái quan
          trọng đều được ghi lại tự động, phục vụ truy vết và tuân thủ. Chỉ VAST_ADMIN
          xem được toàn bộ nhật ký. Giai đoạn 1 chưa có màn hình chính sách/rủi ro/quy
          trình phê duyệt — thuộc backlog Giai đoạn 2-3.
        </p>
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

      <Card>
        <CardContent className="p-0">
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
              {logs.map((log) => (
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
                    <code className="text-xs bg-background border border-border rounded px-1.5 py-0.5">
                      {log.action}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.entity}
                    {log.entityId ? ` · ${log.entityId}` : ""}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    {query
                      ? `Không tìm thấy nhật ký khớp "${query}".`
                      : "Chưa có nhật ký nào."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
