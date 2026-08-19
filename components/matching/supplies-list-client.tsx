"use client";

import { useMemo, useState } from "react";
import { Award, Lightbulb, Package, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateSupplyForm } from "@/components/matching/create-supply-form";
import { fieldLabel } from "@/lib/taxonomy";

const TYPE_LABEL: Record<string, string> = {
  TECHNOLOGY: "Công nghệ",
  SOLUTION: "Giải pháp",
  EXPERT_SERVICE: "Dịch vụ chuyên gia",
  PATENT: "Sáng chế",
};

type SupplyRow = {
  id: string;
  title: string;
  description: string;
  type: string;
  fields: string[];
  trl: number | null;
  organization: { name: string } | null;
};

export function SuppliesListClient({
  supplies,
  canPost,
}: {
  supplies: SupplyRow[];
  canPost: boolean;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return supplies.filter((s) => {
      if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.organization?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [supplies, search, typeFilter]);

  const techCount = supplies.filter((s) => s.type === "TECHNOLOGY").length;
  const solutionCount = supplies.filter((s) => s.type === "SOLUTION").length;
  const patentCount = supplies.filter((s) => s.type === "PATENT").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Tổng số" value={supplies.length} color="brand" />
        <StatCard icon={Wrench} label="Công nghệ" value={techCount} color="cyan" />
        <StatCard icon={Lightbulb} label="Giải pháp" value={solutionCount} color="accent" />
        <StatCard icon={Award} label="Sáng chế" value={patentCount} color="gold" />
      </div>

      {canPost && (
        <Card>
          <CardHeader>
            <CardTitle>Đăng công nghệ / giải pháp mới</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateSupplyForm />
          </CardContent>
        </Card>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, mô tả, tổ chức..."
        filters={
          <Select className="w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">Tất cả loại</option>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Không tìm thấy công nghệ/giải pháp phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc loại."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{s.title}</div>
                  <Badge variant="brand">{TYPE_LABEL[s.type]}</Badge>
                </div>
                <div className="text-xs text-muted mt-1">{s.organization?.name}</div>
                <p className="text-sm text-muted mt-2 line-clamp-2">{s.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.fields.map((f) => (
                    <Badge key={f}>{fieldLabel(f)}</Badge>
                  ))}
                  {s.trl && <Badge variant="success">TRL {s.trl}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
