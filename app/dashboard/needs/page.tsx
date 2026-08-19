import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateNeedForm } from "@/components/matching/create-need-form";
import { NeedsListClient } from "@/components/matching/needs-list-client";

export default async function NeedsPage() {
  const needs = await db.need.findMany({
    include: { organization: true, _count: { select: { matches: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhu cầu"
        badge="Cấu phần 04"
        description="Nhu cầu công nghệ / chuyên gia / R&D do doanh nghiệp, hội thành viên đăng."
      />

      <Card>
        <CardHeader>
          <CardTitle>Đăng nhu cầu mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateNeedForm />
        </CardContent>
      </Card>

      <NeedsListClient needs={needs} />
    </div>
  );
}
