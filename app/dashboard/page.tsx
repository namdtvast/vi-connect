import { AlertTriangle, Building2, FileText, Link2, TrendingUp, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
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
    unsolvedPublishedChallenges,
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
    db.challenge.count({ where: { status: "PUBLISHED", solutions: { none: {} } } }),
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

  const unverifiedExpertCount = expertCount - verifiedExpertCount;

  const alerts = [
    unverifiedExpertCount > 0
      ? {
          text: `${unverifiedExpertCount} hồ sơ chuyên gia chưa xác minh`,
          href: "/dashboard/experts",
        }
      : null,
    unsolvedPublishedChallenges > 0
      ? {
          text: `${unsolvedPublishedChallenges} bài toán đã công bố chưa có giải pháp nào`,
          href: "/dashboard/challenges",
        }
      : null,
  ].filter((a): a is { text: string; href: string } => a !== null);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tổng quan điều hành"
        badge="Cấu phần 11"
        description="KPI theo năm bước Connect – Match – Mobilize – Execute – Impact. AI Governance, Risk & Compliance, Forecasting thuộc backlog."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Building2}
          label="CONNECT — Tổ chức & chuyên gia"
          value={`${orgCount} tổ chức`}
          sub={`${verifiedExpertCount}/${expertCount} chuyên gia đã xác minh`}
          color="brand"
        />
        <StatCard
          icon={Link2}
          label="MATCH — Ghép nối"
          value={`${matches.length} đề xuất`}
          sub={`${connectMatch}% đã tiến triển sau đề xuất ban đầu`}
          color="cyan"
        />
        <StatCard
          icon={Wallet}
          label="MOBILIZE — Nguồn lực huy động"
          value={`${fundingSourceCount} nguồn lực`}
          sub="Nguồn lực/tài trợ đã công bố trên nền tảng"
          color="accent"
        />
        <StatCard
          icon={FileText}
          label="EXECUTE — Dự án & hợp đồng"
          value={`${activeProjects} dự án đang triển khai`}
          sub={`Tổng giá trị hợp đồng đã ký: ${formatVnd(agreementsSum._sum.valueVnd)}`}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="IMPACT — Kết quả"
          value={`${completedProjects} dự án hoàn thành`}
          sub={`${solutionCount} giải pháp được chọn để triển khai`}
          color="gold"
        />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Điểm cần chú ý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <a
                key={a.text}
                href={a.href}
                className="flex items-center gap-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm hover:bg-warning/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
                <span>{a.text}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

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
