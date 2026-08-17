import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

const DISPLAY_LIMIT = 200;

export default async function AuditLogPage() {
  const session = await auth();
  if (session?.user.role !== "VAST_ADMIN") redirect("/dashboard");

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: DISPLAY_LIMIT,
    }),
    db.auditLog.count(),
  ]);

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
                    Chưa có nhật ký nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {total > DISPLAY_LIMIT && (
        <p className="text-xs text-muted">
          Hiển thị {DISPLAY_LIMIT} bản ghi gần nhất trên tổng số {total}. Phân trang đầy
          đủ thuộc backlog Giai đoạn 2.
        </p>
      )}
    </div>
  );
}
