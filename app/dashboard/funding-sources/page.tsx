import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateFundingSourceForm } from "@/components/funding/create-funding-source-form";
import { fieldLabel } from "@/lib/taxonomy";

export default async function FundingSourcesPage() {
  const session = await auth();
  const canCreate =
    !!session?.user.role &&
    ["VAST_ADMIN", "HOI_ADMIN", "ENTERPRISE"].includes(session.user.role);

  const sources = await db.fundingSource.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nguồn lực &amp; Tài trợ (cấu phần 06)</h1>
        <p className="text-sm text-muted mt-1">
          Danh mục nguồn lực, chương trình tài trợ do hội thành viên, tổ chức KH&amp;CN,
          doanh nghiệp hoặc quỹ đầu tư công bố trên mạng lưới. Giai đoạn 1 chỉ theo dõi
          danh mục — due diligence và giải ngân thật thuộc backlog Giai đoạn 2-3.
        </p>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Công bố nguồn lực / tài trợ mới</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateFundingSourceForm />
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {sources.map((s) => (
          <Card key={s.id}>
            <CardContent>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted mt-1">{s.organization.name}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.fields.map((f) => (
                  <Badge key={f}>{fieldLabel(f)}</Badge>
                ))}
              </div>
              {s.note && <p className="text-sm text-muted mt-2">{s.note}</p>}
            </CardContent>
          </Card>
        ))}
        {sources.length === 0 && (
          <p className="text-sm text-muted">Chưa có nguồn lực/tài trợ nào được công bố.</p>
        )}
      </div>
    </div>
  );
}
