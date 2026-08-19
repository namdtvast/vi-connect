"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Database, Lightbulb, Paperclip, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { fieldLabel } from "@/lib/taxonomy";
import { formatVnd } from "@/lib/utils";
import { CHALLENGE_STATUS_BADGE, CHALLENGE_STATUS_LABEL } from "@/lib/challenge-labels";
import type { ChallengeStatus } from "@/lib/generated/prisma/enums";

type ChallengeRow = {
  id: string;
  title: string;
  problem: string;
  fields: string[];
  status: ChallengeStatus;
  hasBudget: boolean;
  budgetVnd: bigint | null;
  attachmentPath: string | null;
  attachmentName: string | null;
  organization: { name: string };
  _count: { solutions: number };
};

export function ChallengesListClient({ challenges }: { challenges: ChallengeRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return challenges.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.problem.toLowerCase().includes(q) ||
        c.organization.name.toLowerCase().includes(q)
      );
    });
  }, [challenges, search, statusFilter]);

  const publishedCount = challenges.filter((c) => c.status === "PUBLISHED").length;
  const withBudget = challenges.filter((c) => c.hasBudget).length;
  const totalSolutions = challenges.reduce((sum, c) => sum + c._count.solutions, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Database} label="Tổng số bài toán" value={challenges.length} color="brand" />
        <StatCard icon={Lightbulb} label="Đã công bố" value={publishedCount} color="cyan" />
        <StatCard icon={Wallet} label="Có ngân sách" value={withBudget} color="gold" />
        <StatCard icon={Paperclip} label="Tổng giải pháp đã nộp" value={totalSolutions} color="accent" />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, mô tả bài toán, tổ chức..."
        filters={
          <Select
            className="w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ChallengeStatus | "ALL")}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(CHALLENGE_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Database}
          title="Không tìm thấy bài toán phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc trạng thái."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{c.title}</div>
                  <Badge variant={CHALLENGE_STATUS_BADGE[c.status]}>
                    {CHALLENGE_STATUS_LABEL[c.status]}
                  </Badge>
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
                {c.attachmentPath && (
                  <a
                    href={`/api/challenges/${c.id}/attachment`}
                    className="text-sm text-brand hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    {c.attachmentName ?? "Tệp đính kèm"}
                  </a>
                )}
                <Link
                  href={`/dashboard/challenges/${c.id}`}
                  className="text-sm text-brand hover:underline mt-2 block"
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
