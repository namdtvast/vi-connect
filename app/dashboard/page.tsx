import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVnd } from "@/lib/utils";
import { MATCH_FUNNEL, MATCH_STAGE_LABEL } from "@/lib/match-labels";

export default async function DashboardHomePage() {
  const [
    orgCount,
    verifiedExpertCount,
    expertCount,
    matches,
    fundingSourceCount,
    agreementsSum,
    completedProjects,
    activeProjects,
    challengeCount,
    solutionCount,
  ] = await Promise.all([
    db.organization.count({ where: { status: "ACTIVE" } }),
    db.expertProfile.count({ where: { verificationStatus: "VERIFIED" } }),
    db.expertProfile.count(),
    db.match.findMany({ select: { stage: true } }),
    db.fundingSource.count(),
    db.agreement.aggregate({
      where: { status: { in: ["SIGNED", "COMPLETED"] } },
      _sum: { valueVnd: true },
    }),
    db.project.count({ where: { status: "COMPLETED" } }),
    db.project.count({ where: { status: { in: ["ACTIVE", "PLANNING"] } } }),
    db.challenge.count(),
    db.solution.count({ where: { status: "SELECTED" } }),
  ]);

  const funnel = MATCH_FUNNEL.map((stage) => ({
    stage,
    count: matches.filter((m) => m.stage === stage).length,
  }));
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));

  const connectMatch = matches.length
    ? Math.round(
        (matches.filter((m) => m.stage !== "SUGGESTED" && m.stage !== "REJECTED").length /
          matches.length) *
          100
      )
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">
          Tổng quan điều hành (cấu phần 11 — rút gọn Giai đoạn 1)
        </h1>
        <p className="text-sm text-muted mt-1">
          KPI theo năm bước Connect – Match – Mobilize – Execute – Impact. AI Governance,
          Risk &amp; Compliance, Forecasting là backlog Giai đoạn 2-3.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="CONNECT — Tổ chức & chuyên gia"
          value={`${orgCount} tổ chức`}
          sub={`${verifiedExpertCount}/${expertCount} chuyên gia đã xác minh`}
        />
        <KpiCard
          label="MATCH — Ghép nối"
          value={`${matches.length} đề xuất`}
          sub={`${connectMatch}% đã tiến triển sau đề xuất ban đầu`}
        />
        <KpiCard
          label="MOBILIZE — Nguồn lực huy động"
          value={`${fundingSourceCount} nguồn lực`}
          sub="Nguồn lực/tài trợ đã công bố trên nền tảng"
        />
        <KpiCard
          label="EXECUTE — Dự án & hợp đồng"
          value={`${activeProjects} dự án đang triển khai`}
          sub={`Tổng giá trị hợp đồng đã ký: ${formatVnd(agreementsSum._sum.valueVnd)}`}
        />
        <KpiCard
          label="IMPACT — Kết quả"
          value={`${completedProjects} dự án hoàn thành`}
          sub={`${solutionCount} giải pháp được chọn để triển khai`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Funnel (KPI 11.3)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {funnel.map((f) => (
            <div key={f.stage} className="flex items-center gap-3">
              <div className="w-40 text-sm text-muted shrink-0">
                {MATCH_STAGE_LABEL[f.stage]}
              </div>
              <div className="flex-1 bg-background rounded h-4 overflow-hidden">
                <div
                  className="bg-brand h-4 rounded"
                  style={{ width: `${(f.count / maxFunnel) * 100}%` }}
                />
              </div>
              <div className="w-8 text-sm text-right">{f.count}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ngân hàng bài toán</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted">
          {challengeCount} bài toán đã được công bố trên nền tảng, {solutionCount} giải
          pháp đã được chọn để triển khai.
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs uppercase text-muted">{label}</div>
        <div className="text-2xl font-bold text-brand mt-1">{value}</div>
        <div className="text-xs text-muted mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}
