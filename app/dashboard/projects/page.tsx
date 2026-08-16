import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL } from "@/lib/project-labels";
import { formatVnd } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    include: {
      agreement: true,
      _count: { select: { milestones: true } },
      milestones: { where: { status: "ACCEPTED" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dự án &amp; hợp đồng (cấu phần 04, 09)</h1>
        <p className="text-sm text-muted mt-1">
          Được tạo tự động khi một đề xuất ghép nối được chấp nhận và chuyển thành hợp
          tác thực tế.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{p.title}</div>
                <Badge variant="brand">{PROJECT_STATUS_LABEL[p.status]}</Badge>
              </div>
              {p.summary && <p className="text-sm text-muted mt-2">{p.summary}</p>}
              <div className="text-xs text-muted mt-2 flex justify-between">
                <span>
                  {p.milestones.length}/{p._count.milestones} mốc đã nghiệm thu
                </span>
                {p.agreement?.valueVnd && <span>{formatVnd(p.agreement.valueVnd)}</span>}
              </div>
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="text-sm text-brand hover:underline mt-2 inline-block"
              >
                Xem chi tiết →
              </Link>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-muted">
            Chưa có dự án nào. Dự án được tạo từ trang Ghép nối khi một đề xuất được chấp
            nhận.
          </p>
        )}
      </div>
    </div>
  );
}
