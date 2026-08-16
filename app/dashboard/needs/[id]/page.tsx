import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { formatVnd } from "@/lib/utils";
import { GenerateMatchesButton } from "@/components/matching/generate-matches-button";
import { MatchCard } from "@/components/matching/match-card";
import type { MatchReason } from "@/lib/matching";

export default async function NeedDetailPage({
  params,
}: PageProps<"/dashboard/needs/[id]">) {
  const { id } = await params;

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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">{need.title}</h1>
        <p className="text-sm text-muted mt-1">{need.organization.name}</p>
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
        <GenerateMatchesButton needId={need.id} />
      </div>

      <div className="space-y-3">
        {need.matches.map((m) => (
          <MatchCard
            key={m.id}
            id={m.id}
            score={m.score}
            reasons={m.reasons as MatchReason[]}
            stage={m.stage}
            label={m.supply ? m.supply.title : (m.expertProfile?.user.name ?? "—")}
            sublabel={m.supply ? "Công nghệ / giải pháp" : "Chuyên gia"}
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
