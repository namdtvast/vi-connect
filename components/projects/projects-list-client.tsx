"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, PlayCircle, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL } from "@/lib/project-labels";
import { formatVnd } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";

type ProjectRow = {
  id: string;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  agreement: { valueVnd: bigint | null } | null;
  _count: { milestones: number };
  milestones: { id: string }[];
};

export function ProjectsListClient({ projects }: { projects: ProjectRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) || (p.summary?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, search, statusFilter]);

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;
  const totalValue = projects.reduce(
    (sum, p) => sum + (p.agreement?.valueVnd ? Number(p.agreement.valueVnd) : 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Tổng số dự án" value={projects.length} color="brand" />
        <StatCard icon={PlayCircle} label="Đang triển khai" value={activeCount} color="cyan" />
        <StatCard icon={CheckCircle2} label="Hoàn thành" value={completedCount} color="accent" />
        <StatCard icon={Wallet} label="Tổng giá trị hợp đồng" value={formatVnd(totalValue)} color="gold" />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, tóm tắt dự án..."
        filters={
          <Select
            className="w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "ALL")}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không tìm thấy dự án phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc trạng thái."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{p.title}</div>
                  <Badge variant={PROJECT_STATUS_BADGE[p.status]}>
                    {PROJECT_STATUS_LABEL[p.status]}
                  </Badge>
                </div>
                {p.summary && <p className="text-sm text-muted mt-2">{p.summary}</p>}
                <div className="text-xs text-muted mt-2 flex justify-between">
                  <span>
                    {p.milestones.length}/{p._count.milestones} mốc đã nghiệm thu
                  </span>
                  {p.agreement?.valueVnd && <span>{formatVnd(p.agreement.valueVnd)}</span>}
                </div>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="text-sm text-brand hover:underline mt-2 inline-block"
                >
                  Xem chi tiết →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
