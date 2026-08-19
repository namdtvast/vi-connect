"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UpdateRoleForm } from "@/components/users/update-role-form";
import { ROLE_BADGE, ROLE_LABEL } from "@/lib/role-labels";
import { ADMIN_ROLES } from "@/lib/permissions";
import type { Role } from "@/lib/generated/prisma/enums";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: { name: string } | null;
};

export function PermissionsListClient({
  users,
  currentUserId,
  isPlatformAdmin,
  assignableRoles,
}: {
  users: UserRow[];
  currentUserId: string;
  isPlatformAdmin: boolean;
  assignableRoles: Role[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization?.name.toLowerCase().includes(q) ?? false) ||
        ROLE_LABEL[u.role].toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, email, tổ chức, vai trò..."
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy tài khoản phù hợp"
          description="Thử điều chỉnh từ khoá tìm kiếm."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-muted text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Tài khoản</th>
                    <th className="text-left px-4 py-3">Tổ chức</th>
                    <th className="text-left px-4 py-3">Vai trò hiện tại</th>
                    <th className="text-left px-4 py-3">Đổi vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const isSelf = u.id === currentUserId;
                    const targetIsAdmin = ADMIN_ROLES.includes(u.role);
                    const canEdit = !isSelf && (isPlatformAdmin || !targetIsAdmin);

                    return (
                      <tr key={u.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} size="sm" />
                            <div className="min-w-0">
                              <div className="font-medium flex items-center gap-2 truncate">
                                {u.name}
                                {isSelf && <Badge variant="brand">Bạn</Badge>}
                              </div>
                              <div className="text-xs text-muted truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {u.organization?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {canEdit ? (
                            <UpdateRoleForm
                              userId={u.id}
                              currentRole={u.role}
                              options={assignableRoles}
                            />
                          ) : (
                            <span className="text-xs text-muted">
                              {isSelf ? "Không thể tự đổi" : "Ngoài phạm vi quản trị"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
