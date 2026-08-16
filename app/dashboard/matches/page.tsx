import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATCH_FUNNEL, MATCH_STAGE_LABEL } from "@/lib/match-labels";

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
      <div>
        <h1 className="text-xl font-semibold">Ghép nối (cấu phần 05 / KPI 11.3)</h1>
        <p className="text-sm text-muted mt-1">
          Match Funnel: Nhu cầu → Đề xuất → Xem → Chấp nhận → Liên hệ → Hợp tác → Dự án/Hợp
          đồng.
        </p>
      </div>

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

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nhu cầu</th>
                <th className="text-left px-4 py-3">Đề xuất</th>
                <th className="text-left px-4 py-3">Điểm phù hợp</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/needs/${m.need.id}`}
                      className="text-brand hover:underline"
                    >
                      {m.need.title}
                    </Link>
                    <div className="text-xs text-muted">{m.need.organization.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    {m.supply?.title ?? m.expertProfile?.user.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{(m.score * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3">
                    <Badge>{MATCH_STAGE_LABEL[m.stage]}</Badge>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    Chưa có đề xuất ghép nối nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
