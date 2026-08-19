"use client";

import { useMemo, useState } from "react";
import { Building2, StickyNote, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { fieldLabel } from "@/lib/taxonomy";

type FundingSourceRow = {
  id: string;
  name: string;
  fields: string[];
  note: string | null;
  organization: { name: string };
};

export function FundingSourcesListClient({ sources }: { sources: FundingSourceRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.organization.name.toLowerCase().includes(q) ||
        (s.note?.toLowerCase().includes(q) ?? false)
    );
  }, [sources, search]);

  const orgCount = new Set(sources.map((s) => s.organization.name)).size;
  const withNote = sources.filter((s) => s.note).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Wallet} label="Tổng số nguồn lực" value={sources.length} color="brand" />
        <StatCard icon={Building2} label="Tổ chức tham gia" value={orgCount} color="cyan" />
        <StatCard icon={StickyNote} label="Có ghi chú" value={withNote} color="gold" />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, tổ chức, ghi chú..."
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Không tìm thấy nguồn lực/tài trợ phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted mt-1">{s.organization.name}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.fields.map((f) => (
                    <Badge key={f}>{fieldLabel(f)}</Badge>
                  ))}
                </div>
                {s.note && <p className="text-sm text-muted mt-2">{s.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
