"use client";

import { useMemo, useState } from "react";
import { Building2, Factory, FlaskConical, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateOrgForm } from "@/components/organizations/create-org-form";
import { OrgStatusActions } from "@/components/organizations/org-status-actions";
import { ORG_STATUS_BADGE, ORG_STATUS_LABEL, ORG_TYPE_LABEL } from "@/lib/org-labels";
import type { OrganizationType, OrgStatus } from "@/lib/generated/prisma/enums";

type OrgRow = {
  id: string;
  name: string;
  shortName: string | null;
  type: OrganizationType;
  province: string | null;
  status: OrgStatus;
  _count: { members: number };
};

export function OrganizationsListClient({
  organizations,
  isAdmin,
}: {
  organizations: OrgRow[];
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrganizationType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<OrgStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return organizations.filter((org) => {
      if (typeFilter !== "ALL" && org.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && org.status !== statusFilter) return false;
      if (!q) return true;
      return (
        org.name.toLowerCase().includes(q) ||
        (org.shortName?.toLowerCase().includes(q) ?? false) ||
        (org.province?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [organizations, search, typeFilter, statusFilter]);

  const memberCount = organizations.filter((o) => o.type === "HOI_THANH_VIEN").length;
  const khcnCount = organizations.filter((o) => o.type === "TO_CHUC_KHCN").length;
  const enterpriseCount = organizations.filter((o) => o.type === "DOANH_NGHIEP").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Building2} label="Tổng số tổ chức" value={organizations.length} color="brand" />
        <StatCard icon={Users} label="Hội thành viên" value={memberCount} color="cyan" />
        <StatCard icon={FlaskConical} label="Tổ chức KH&CN" value={khcnCount} color="accent" />
        <StatCard icon={Factory} label="Doanh nghiệp" value={enterpriseCount} color="gold" />
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm tổ chức mới</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateOrgForm />
          </CardContent>
        </Card>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, viết tắt, tỉnh/thành..."
        filters={
          <>
            <Select
              className="w-auto"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OrganizationType | "ALL")}
            >
              <option value="ALL">Tất cả loại hình</option>
              {Object.entries(ORG_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              className="w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrgStatus | "ALL")}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(ORG_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Không tìm thấy tổ chức phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-muted text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Tên tổ chức</th>
                    <th className="text-left px-4 py-3">Loại hình</th>
                    <th className="text-left px-4 py-3">Tỉnh/TP</th>
                    <th className="text-left px-4 py-3">Chuyên gia</th>
                    <th className="text-left px-4 py-3">Trạng thái</th>
                    {isAdmin && <th className="text-left px-4 py-3">Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((org) => (
                    <tr key={org.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium">{org.name}</div>
                        {org.shortName && (
                          <div className="text-xs text-muted">{org.shortName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">{ORG_TYPE_LABEL[org.type]}</td>
                      <td className="px-4 py-3">{org.province ?? "—"}</td>
                      <td className="px-4 py-3">{org._count.members}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ORG_STATUS_BADGE[org.status]}>
                          {ORG_STATUS_LABEL[org.status]}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <OrgStatusActions
                            organizationId={org.id}
                            organizationName={org.name}
                            status={org.status}
                          />
                        </td>
                      )}
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
