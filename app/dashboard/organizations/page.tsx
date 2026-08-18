import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateOrgForm } from "@/components/organizations/create-org-form";
import { OrgStatusActions } from "@/components/organizations/org-status-actions";
import { ORG_STATUS_LABEL, ORG_TYPE_LABEL } from "@/lib/org-labels";

export default async function OrganizationsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "SUPERADMIN";

  const organizations = await db.organization.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Tổ chức &amp; Hội thành viên (cấu phần 01)
        </h1>
        <p className="text-sm text-muted mt-1">
          Danh mục hội thành viên, tổ chức KH&amp;CN trực thuộc, doanh nghiệp và quỹ tham
          gia nền tảng. Mỗi hội được cấp không gian quản trị hồ sơ riêng (delegated
          administration).
        </p>
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

      <Card>
        <CardContent className="p-0">
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
              {organizations.map((org) => (
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
                    <Badge
                      variant={
                        org.status === "ACTIVE"
                          ? "success"
                          : org.status === "SUSPENDED"
                            ? "danger"
                            : "warning"
                      }
                    >
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
        </CardContent>
      </Card>
    </div>
  );
}
