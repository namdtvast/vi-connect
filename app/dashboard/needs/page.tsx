import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { CreateNeedForm } from "@/components/matching/create-need-form";
import { formatVnd } from "@/lib/utils";

export default async function NeedsPage() {
  const needs = await db.need.findMany({
    include: { organization: true, _count: { select: { matches: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nhu cầu (cấu phần 04)</h1>
        <p className="text-sm text-muted mt-1">
          Nhu cầu công nghệ / chuyên gia / R&amp;D do doanh nghiệp, hội thành viên đăng.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đăng nhu cầu mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateNeedForm />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {needs.map((n) => (
          <Card key={n.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{n.title}</div>
                <Badge variant="brand">{n._count.matches} đề xuất</Badge>
              </div>
              <div className="text-xs text-muted mt-1">{n.organization.name}</div>
              <p className="text-sm text-muted mt-2 line-clamp-2">{n.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {n.fields.map((f) => (
                  <Badge key={f}>{fieldLabel(f)}</Badge>
                ))}
              </div>
              {n.budgetVnd && (
                <div className="text-xs text-muted mt-2">
                  Ngân sách: {formatVnd(n.budgetVnd)}
                </div>
              )}
              <Link
                href={`/dashboard/needs/${n.id}`}
                className="text-sm text-brand hover:underline mt-2 inline-block"
              >
                Xem đề xuất ghép nối →
              </Link>
            </CardContent>
          </Card>
        ))}
        {needs.length === 0 && <p className="text-sm text-muted">Chưa có nhu cầu nào.</p>}
      </div>
    </div>
  );
}
