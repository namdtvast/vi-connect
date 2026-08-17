import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { formatVnd } from "@/lib/utils";
import { CreateChallengeForm } from "@/components/challenges/create-challenge-form";
import { CHALLENGE_STATUS_LABEL } from "@/lib/challenge-labels";

export default async function ChallengesPage() {
  const session = await auth();
  const canPost =
    session?.user.role === "VAST_ADMIN" ||
    session?.user.role === "HOI_ADMIN" ||
    session?.user.role === "ENTERPRISE";

  const challenges = await db.challenge.findMany({
    include: { organization: true, _count: { select: { solutions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ngân hàng bài toán (cấu phần 04)</h1>
        <p className="text-sm text-muted mt-1">
          Challenge Bank quốc gia: nhu cầu thực tế được chuẩn hóa thành bài toán để cộng
          đồng chuyên gia cùng giải quyết.
        </p>
      </div>

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

      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((c) => (
          <Card key={c.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{c.title}</div>
                <Badge variant="brand">{CHALLENGE_STATUS_LABEL[c.status]}</Badge>
              </div>
              <div className="text-xs text-muted mt-1">{c.organization.name}</div>
              <p className="text-sm text-muted mt-2 line-clamp-2">{c.problem}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {c.fields.map((f) => (
                  <Badge key={f}>{fieldLabel(f)}</Badge>
                ))}
              </div>
              <div className="text-xs text-muted mt-2 flex justify-between items-center">
                <span>{c.hasBudget ? formatVnd(c.budgetVnd) : "Chưa có ngân sách"}</span>
                <span>{c._count.solutions} giải pháp đã nộp</span>
              </div>
              <Link
                href={`/dashboard/challenges/${c.id}`}
                className="text-sm text-brand hover:underline mt-2 inline-block"
              >
                Xem chi tiết →
              </Link>
            </CardContent>
          </Card>
        ))}
        {challenges.length === 0 && (
          <p className="text-sm text-muted">Chưa có bài toán nào.</p>
        )}
      </div>
    </div>
  );
}
