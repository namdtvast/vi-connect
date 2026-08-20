"use client";

import { useMemo, useState, useTransition } from "react";
import { BadgeCheck, BookOpen, Link2, ShieldQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreatePublicationForm } from "@/components/knowledge/create-publication-form";
import { verifyPublicationAction } from "@/lib/actions/knowledge";
import { fieldLabel } from "@/lib/taxonomy";

const TYPE_LABEL: Record<string, string> = {
  JOURNAL_ARTICLE: "Bài báo tạp chí",
  CONFERENCE_PAPER: "Kỷ yếu hội thảo",
  BOOK: "Sách",
  BOOK_CHAPTER: "Chương sách",
  PREPRINT: "Preprint",
  TECHNICAL_REPORT: "Báo cáo kỹ thuật",
  OTHER: "Khác",
};

type PublicationRow = {
  id: string;
  title: string;
  abstract: string | null;
  type: string;
  containerTitle: string | null;
  year: number | null;
  fields: string[];
  authors: string[];
  doi: string | null;
  verificationStatus: string;
  organization: { name: string } | null;
};

export function PublicationsListClient({
  publications,
  canPost,
}: {
  publications: PublicationRow[];
  canPost: boolean;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publications.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q)) ||
        (p.organization?.name.toLowerCase().includes(q) ?? false) ||
        (p.doi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [publications, search, typeFilter]);

  const verifiedCount = publications.filter((p) => p.verificationStatus === "VERIFIED").length;
  const doiCount = publications.filter((p) => p.doi).length;

  const handleVerify = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      await verifyPublicationAction(id);
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={BookOpen} label="Tổng số công bố" value={publications.length} color="brand" />
        <StatCard icon={BadgeCheck} label="Đã xác minh" value={verifiedCount} color="cyan" />
        <StatCard icon={Link2} label="Có DOI (Crossref)" value={doiCount} color="gold" />
      </div>

      {canPost && (
        <Card>
          <CardHeader>
            <CardTitle>Đăng công bố khoa học mới</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePublicationForm />
          </CardContent>
        </Card>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, tác giả, tổ chức, DOI..."
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
          icon={BookOpen}
          title="Không tìm thấy công bố phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc loại."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{p.title}</div>
                  {p.verificationStatus === "VERIFIED" ? (
                    <Badge variant="success">Đã xác minh</Badge>
                  ) : (
                    <Badge variant="brand">{TYPE_LABEL[p.type]}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted mt-1">
                  {p.organization?.name}
                  {p.authors.length > 0 && ` · ${p.authors.join(", ")}`}
                  {p.year && ` · ${p.year}`}
                </div>
                {p.containerTitle && (
                  <div className="text-xs text-muted italic mt-0.5">{p.containerTitle}</div>
                )}
                {p.abstract && <p className="text-sm text-muted mt-2 line-clamp-2">{p.abstract}</p>}
                <div className="flex flex-wrap gap-1 mt-2 items-center">
                  {p.fields.map((f) => (
                    <Badge key={f}>{fieldLabel(f)}</Badge>
                  ))}
                  {p.doi && (
                    <a
                      href={`https://doi.org/${p.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan underline"
                    >
                      DOI: {p.doi}
                    </a>
                  )}
                </div>
                {canPost && p.verificationStatus !== "VERIFIED" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    disabled={isPending && pendingId === p.id}
                    onClick={() => handleVerify(p.id)}
                  >
                    <ShieldQuestion className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    {isPending && pendingId === p.id ? "Đang xác minh..." : "Xác minh"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
