"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, User, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { fieldLabel } from "@/lib/taxonomy";
import { VERIFICATION_BADGE, VERIFICATION_LABEL } from "@/lib/verification-labels";
import type { VerificationStatus } from "@/lib/generated/prisma/enums";

type ExpertRow = {
  id: string;
  userId: string | null;
  title: string | null;
  bio: string | null;
  avatarPath: string | null;
  fields: string[];
  experienceYears: number | null;
  publications: number | null;
  patents: number | null;
  verificationStatus: VerificationStatus;
  user: { name: string | null } | null;
  organization: { name: string };
};

function ExpertAvatar({
  expertId,
  avatarPath,
  name,
}: {
  expertId: string;
  avatarPath: string | null;
  name: string;
}) {
  if (avatarPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/experts/${expertId}/avatar`}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
      <User className="w-5 h-5 text-muted" />
    </div>
  );
}

export function ExpertsListClient({
  experts,
  canManage,
  currentUserId,
}: {
  experts: ExpertRow[];
  canManage: boolean;
  currentUserId?: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return experts.filter((e) => {
      if (statusFilter !== "ALL" && e.verificationStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        (e.user?.name?.toLowerCase().includes(q) ?? false) ||
        e.organization.name.toLowerCase().includes(q) ||
        (e.bio?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [experts, search, statusFilter]);

  const verifiedCount = experts.filter((e) => e.verificationStatus === "VERIFIED").length;
  const pendingCount = experts.filter((e) => e.verificationStatus === "PENDING").length;
  const rejectedCount = experts.filter((e) => e.verificationStatus === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Tổng số hồ sơ" value={experts.length} color="brand" />
        <StatCard icon={UserCheck} label="Đã xác minh" value={verifiedCount} color="accent" />
        <StatCard icon={ShieldCheck} label="Chờ xác minh" value={pendingCount} color="gold" />
        <StatCard icon={UserX} label="Từ chối" value={rejectedCount} color="red" />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, tổ chức, giới thiệu..."
        filters={
          <Select
            className="w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | "ALL")}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(VERIFICATION_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy hồ sơ chuyên gia phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc trạng thái."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <ExpertAvatar
                      expertId={e.id}
                      avatarPath={e.avatarPath}
                      name={e.user?.name ?? "Hồ sơ chưa có người nhận"}
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {e.title ? `${e.title} ` : ""}
                        {e.user?.name ?? "Hồ sơ chưa có người nhận"}
                      </div>
                      <div className="text-xs text-muted truncate">{e.organization.name}</div>
                    </div>
                  </div>
                  <Badge variant={VERIFICATION_BADGE[e.verificationStatus]}>
                    {VERIFICATION_LABEL[e.verificationStatus]}
                  </Badge>
                </div>
                {e.bio && <p className="text-sm text-muted line-clamp-2">{e.bio}</p>}
                <div className="flex flex-wrap gap-1">
                  {e.fields.map((f) => (
                    <Badge key={f} variant="brand">
                      {fieldLabel(f)}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted flex gap-4 mt-1">
                  <span>{e.experienceYears ?? 0} năm kinh nghiệm</span>
                  <span>{e.publications ?? 0} công bố</span>
                  <span>{e.patents ?? 0} sáng chế</span>
                </div>
                {(canManage || e.userId === currentUserId) && (
                  <Link
                    href={`/dashboard/experts/${e.id}`}
                    className="text-sm text-brand hover:underline mt-1"
                  >
                    {canManage ? "Xem chi tiết / xác minh →" : "Xem / chỉnh sửa hồ sơ →"}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
