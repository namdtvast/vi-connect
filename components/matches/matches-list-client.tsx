"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MATCH_STAGE_BADGE, MATCH_STAGE_LABEL } from "@/lib/match-labels";
import type { MatchStage } from "@/lib/generated/prisma/enums";

type MatchRow = {
  id: string;
  score: number;
  stage: MatchStage;
  need: { id: string; title: string; organization: { name: string } };
  supply: { title: string } | null;
  expertProfile: { user: { name: string | null } | null } | null;
};

export function MatchesListClient({ matches }: { matches: MatchRow[] }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<MatchStage | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return matches.filter((m) => {
      if (stageFilter !== "ALL" && m.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        m.need.title.toLowerCase().includes(q) ||
        m.need.organization.name.toLowerCase().includes(q) ||
        (m.supply?.title.toLowerCase().includes(q) ?? false) ||
        (m.expertProfile?.user?.name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [matches, search, stageFilter]);

  return (
    <div className="space-y-6">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo nhu cầu, đề xuất, tổ chức..."
        filters={
          <Select
            className="w-auto"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as MatchStage | "ALL")}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(MATCH_STAGE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="Không tìm thấy đề xuất ghép nối phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc trạng thái."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                  {filtered.map((m) => (
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
                        {m.supply?.title ?? m.expertProfile?.user?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">{(m.score * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={MATCH_STAGE_BADGE[m.stage]}>
                          {MATCH_STAGE_LABEL[m.stage]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
