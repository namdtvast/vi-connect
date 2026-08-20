import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { formatVnd } from "@/lib/utils";
import { GenerateMatchesButton } from "@/components/matching/generate-matches-button";
import { NeedStatusActions } from "@/components/matching/need-status-actions";
import { MatchCard } from "@/components/matching/match-card";
import { NEED_STATUS_BADGE, NEED_STATUS_LABEL } from "@/lib/need-labels";
import type { MatchReason } from "@/lib/matching";

export default async function NeedDetailPage({
  params,
}: PageProps<"/dashboard/needs/[id]">) {
  const { id } = await params;
  const session = await auth();

  const need = await db.need.findUnique({
    where: { id },
    include: {
      organization: true,
      matches: {
        include: { supply: true, expertProfile: { include: { user: true } } },
        orderBy: { score: "desc" },
      },
    },
  });

  if (!need) notFound();

  // Cùng điều kiện với generateMatchesAction/updateNeedStatusAction
  // (lib/actions/matching.ts) — chỉ hiện nút khi chắc chắn thao tác được,
  // tránh lỗi quyền không xử lý được.
  const canManage =
    session?.user.role === "SUPERADMIN" ||
    ((session?.user.role === "ADMIN" || session?.user.role === "ENTERPRISE") &&
      session.user.organizationId === need.organizationId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{need.title}</h1>
            <Badge variant={NEED_STATUS_BADGE[need.status]}>{NEED_STATUS_LABEL[need.status]}</Badge>
          </div>
          <p className="text-sm text-muted mt-1">{need.organization.name}</p>
        </div>
        {canManage && <NeedStatusActions needId={need.id} status={need.status} />}
      </div>

      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm">{need.description}</p>
          <div className="flex flex-wrap gap-1">
            {need.fields.map((f) => (
              <Badge key={f} variant="brand">
                {fieldLabel(f)}
              </Badge>
            ))}
          </div>
          {need.budgetVnd && (
            <div className="text-sm text-muted">Ngân sách: {formatVnd(need.budgetVnd)}</div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          Đề xuất ghép nối ({need.matches.length}) — cấu phần 05
        </h2>
        {canManage && <GenerateMatchesButton needId={need.id} />}
      </div>

      <div className="space-y-3">
        {need.matches.map((m) => (
          <MatchCard
            key={m.id}
            id={m.id}
            score={m.score}
            reasons={m.reasons as MatchReason[]}
            stage={m.stage}
            label={m.supply ? m.supply.title : (m.expertProfile?.user?.name ?? "—")}
            sublabel={m.supply ? "Công nghệ / giải pháp" : "Chuyên gia"}
            canManage={canManage}
          />
        ))}
        {need.matches.length === 0 && (
          <p className="text-sm text-muted">
            Chưa có đề xuất. Bấm &ldquo;Chạy lại đề xuất ghép nối&rdquo; để hệ thống phân
            tích.
          </p>
        )}
      </div>
    </div>
  );
}
