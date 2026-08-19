import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateFundingSourceForm } from "@/components/funding/create-funding-source-form";
import { FundingSourcesListClient } from "@/components/funding/funding-sources-list-client";

export default async function FundingSourcesPage() {
  const session = await auth();
  const canCreate =
    !!session?.user.role &&
    ["SUPERADMIN", "ADMIN", "ENTERPRISE"].includes(session.user.role);

  const sources = await db.fundingSource.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nguồn lực & Tài trợ"
        badge="Cấu phần 06"
        description="Danh mục nguồn lực, chương trình tài trợ do hội thành viên, tổ chức KH&CN, doanh nghiệp hoặc quỹ đầu tư công bố trên mạng lưới. Giai đoạn 1 chỉ theo dõi danh mục — due diligence và giải ngân thật thuộc backlog Giai đoạn 2-3."
      />

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

      <FundingSourcesListClient sources={sources} />
    </div>
  );
}
