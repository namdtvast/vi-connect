import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/role-labels";
import { ADMIN_ROLES, ALL_ROLES, ASSIGNABLE_BY_HOI_ADMIN } from "@/lib/permissions";
import { UpdateRoleForm } from "@/components/users/update-role-form";

export default async function PermissionsPage() {
  const session = await auth();
  const role = session?.user.role;
  if (role !== "VAST_ADMIN" && role !== "HOI_ADMIN") redirect("/dashboard");

  const isPlatformAdmin = role === "VAST_ADMIN";
  const currentUserId = session!.user.id;

  const users = await db.user.findMany({
    where: isPlatformAdmin ? {} : { organizationId: session!.user.organizationId },
    include: { organization: { select: { name: true } } },
    orderBy: [{ organizationId: "asc" }, { createdAt: "asc" }],
  });

  const assignableRoles = isPlatformAdmin ? ALL_ROLES : ASSIGNABLE_BY_HOI_ADMIN;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quản lý phân quyền (cấu phần 10)</h1>
        <p className="text-sm text-muted mt-1">
          Gán vai trò cho tài khoản{" "}
          {isPlatformAdmin ? "trên toàn nền tảng" : "trong tổ chức của bạn"}. Theo
          thiết kế VC-KT-002 Mục 5, 7.1: quản trị VAST toàn quyền; quản trị hội
          thành viên chỉ gán được Chuyên gia/Doanh nghiệp/Người xem trong tổ chức
          mình, không tự cấp quyền quản trị. Mọi thay đổi được ghi vào nhật ký hệ
          thống.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
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
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const targetIsAdmin = ADMIN_ROLES.includes(u.role);
                const canEdit = !isSelf && (isPlatformAdmin || !targetIsAdmin);

                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-2">
                        {u.name}
                        {isSelf && <Badge variant="brand">Bạn</Badge>}
                      </div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {u.organization?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={targetIsAdmin ? "brand" : "default"}>
                        {ROLE_LABEL[u.role]}
                      </Badge>
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
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    Chưa có tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
