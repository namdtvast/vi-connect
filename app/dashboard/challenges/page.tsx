import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateChallengeForm } from "@/components/challenges/create-challenge-form";
import { ChallengesListClient } from "@/components/challenges/challenges-list-client";

export default async function ChallengesPage() {
  const session = await auth();
  const canPost =
    session?.user.role === "SUPERADMIN" ||
    session?.user.role === "ADMIN" ||
    session?.user.role === "ENTERPRISE";

  const challenges = await db.challenge.findMany({
    include: { organization: true, _count: { select: { solutions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân hàng bài toán"
        badge="Cấu phần 04"
        description="Challenge Bank quốc gia: nhu cầu thực tế được chuẩn hóa thành bài toán để cộng đồng chuyên gia cùng giải quyết."
      />

      {canPost && (
        <Card>
          <CardHeader>
            <CardTitle>Đăng bài toán mới</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateChallengeForm />
          </CardContent>
        </Card>
      )}

      <ChallengesListClient challenges={challenges} />
    </div>
  );
}
