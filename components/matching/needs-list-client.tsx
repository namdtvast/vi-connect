"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Link2, Paperclip, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { fieldLabel } from "@/lib/taxonomy";
import { formatVnd } from "@/lib/utils";

type NeedRow = {
  id: string;
  title: string;
  description: string;
  fields: string[];
  budgetVnd: bigint | null;
  attachmentPath: string | null;
  attachmentName: string | null;
  organization: { name: string };
  _count: { matches: number };
};

export function NeedsListClient({ needs }: { needs: NeedRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return needs;
    return needs.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.organization.name.toLowerCase().includes(q)
    );
  }, [needs, search]);

  const withBudget = needs.filter((n) => n.budgetVnd).length;
  const withAttachment = needs.filter((n) => n.attachmentPath).length;
  const totalMatches = needs.reduce((sum, n) => sum + n._count.matches, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Tổng số nhu cầu" value={needs.length} color="brand" />
        <StatCard icon={Wallet} label="Có ngân sách" value={withBudget} color="gold" />
        <StatCard icon={Paperclip} label="Có tệp đính kèm" value={withAttachment} color="cyan" />
        <StatCard icon={Link2} label="Tổng đề xuất ghép nối" value={totalMatches} color="accent" />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, mô tả, tổ chức..."
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không tìm thấy nhu cầu phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((n) => (
            <Card key={n.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{n.title}</div>
                  <Badge variant="brand">{n._count.matches} đề xuất</Badge>
                </div>
                <div className="text-xs text-muted mt-1">{n.organization.name}</div>
                <p className="text-sm text-muted mt-2 line-clamp-2">{n.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {n.fields.map((f) => (
                    <Badge key={f}>{fieldLabel(f)}</Badge>
                  ))}
                </div>
                {n.budgetVnd && (
                  <div className="text-xs text-muted mt-2">
                    Ngân sách: {formatVnd(n.budgetVnd)}
                  </div>
                )}
                {n.attachmentPath && (
                  <a
                    href={`/api/needs/${n.id}/attachment`}
                    className="text-sm text-brand hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    {n.attachmentName ?? "Tệp đính kèm"}
                  </a>
                )}
                <Link
                  href={`/dashboard/needs/${n.id}`}
                  className="text-sm text-brand hover:underline mt-2 block"
                >
                  Xem đề xuất ghép nối →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
