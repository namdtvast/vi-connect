import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { MATCH_FUNNEL, MATCH_STAGE_LABEL } from "@/lib/match-labels";
import { MatchesListClient } from "@/components/matches/matches-list-client";

export default async function MatchesPage() {
  const matches = await db.match.findMany({
    include: {
      need: { include: { organization: true } },
      supply: true,
      expertProfile: { include: { user: true } },
    },
    orderBy: { score: "desc" },
  });

  const funnelCounts = MATCH_FUNNEL.map((stage) => ({
    stage,
    count: matches.filter((m) => m.stage === stage).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ghép nối"
        badge="Cấu phần 05 / KPI 11.3"
        description="Match Funnel: Nhu cầu → Đề xuất → Xem → Chấp nhận → Liên hệ → Hợp tác → Dự án/Hợp đồng."
      />

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {funnelCounts.map((f) => (
          <Card key={f.stage}>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-brand">{f.count}</div>
              <div className="text-xs text-muted mt-1">{MATCH_STAGE_LABEL[f.stage]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MatchesListClient matches={matches} />
    </div>
  );
}
