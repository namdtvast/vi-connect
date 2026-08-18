import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { formatVnd } from "@/lib/utils";
import { SubmitSolutionForm } from "@/components/challenges/submit-solution-form";
import { ReviewSolutionActions } from "@/components/challenges/review-solution-actions";
import { CHALLENGE_STATUS_LABEL, SOLUTION_BADGE, SOLUTION_STATUS_LABEL } from "@/lib/challenge-labels";

export default async function ChallengeDetailPage({
  params,
}: PageProps<"/dashboard/challenges/[id]">) {
  const { id } = await params;
  const session = await auth();

  const challenge = await db.challenge.findUnique({
    where: { id },
    include: {
      organization: true,
      solutions: { include: { }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!challenge) notFound();

  const submitterIds = challenge.solutions.map((s) => s.submittedById);
  const submitters = await db.user.findMany({
    where: { id: { in: submitterIds } },
    select: { id: true, name: true },
  });
  const submitterName = (id: string) => submitters.find((u) => u.id === id)?.name ?? "—";

  const canReview =
    session?.user.role === "SUPERADMIN" ||
    (session?.user.organizationId === challenge.organizationId &&
      (session?.user.role === "ADMIN" || session?.user.role === "ENTERPRISE"));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{challenge.title}</h1>
          <p className="text-sm text-muted mt-1">{challenge.organization.name}</p>
        </div>
        <Badge variant="brand">{CHALLENGE_STATUS_LABEL[challenge.status]}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs uppercase text-muted mb-1">Vấn đề / hiện trạng</div>
            <p className="text-sm">{challenge.problem}</p>
          </div>
          {challenge.goal && (
            <div>
              <div className="text-xs uppercase text-muted mb-1">Mục tiêu</div>
              <p className="text-sm">{challenge.goal}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {challenge.fields.map((f) => (
              <Badge key={f}>{fieldLabel(f)}</Badge>
            ))}
          </div>
          <div className="text-sm text-muted">
            Ngân sách: {challenge.hasBudget ? formatVnd(challenge.budgetVnd) : "Chưa xác định"}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">
          Giải pháp đã nộp ({challenge.solutions.length})
        </h2>
        <div className="space-y-3">
          {challenge.solutions.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium">{submitterName(s.submittedById)}</div>
                  <Badge variant={SOLUTION_BADGE[s.status]}>
                    {SOLUTION_STATUS_LABEL[s.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted mt-2">{s.summary}</p>
                <p className="text-sm mt-2">{s.approach}</p>
                {s.reviewScore != null && (
                  <div className="text-xs text-muted mt-2">
                    Điểm đánh giá: {(s.reviewScore * 100).toFixed(0)}%
                  </div>
                )}
                {canReview && s.status !== "SELECTED" && s.status !== "REJECTED" && (
                  <ReviewSolutionActions solutionId={s.id} />
                )}
              </CardContent>
            </Card>
          ))}
          {challenge.solutions.length === 0 && (
            <p className="text-sm text-muted">Chưa có giải pháp nào được nộp.</p>
          )}
        </div>
      </div>

      {session && (
        <Card>
          <CardContent>
            <div className="font-medium text-sm mb-3">Nộp giải pháp của bạn</div>
            <SubmitSolutionForm challengeId={challenge.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
