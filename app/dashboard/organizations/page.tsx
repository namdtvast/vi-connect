import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { OrganizationsListClient } from "@/components/organizations/organizations-list-client";

export default async function OrganizationsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "SUPERADMIN";

  const organizations = await db.organization.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổ chức & Hội thành viên"
        badge="Cấu phần 01"
        description="Danh mục hội thành viên, tổ chức KH&CN trực thuộc, doanh nghiệp và quỹ tham gia nền tảng. Mỗi hội được cấp không gian quản trị hồ sơ riêng (delegated administration)."
      />
      <OrganizationsListClient organizations={organizations} isAdmin={isAdmin} />
    </div>
  );
}
