import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { SuppliesListClient } from "@/components/matching/supplies-list-client";

export default async function SuppliesPage() {
  const session = await auth();
  const canPost = session?.user.role === "SUPERADMIN" || session?.user.role === "ADMIN";

  const supplies = await db.supply.findMany({
    where: { status: "PUBLISHED" },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nguồn cung công nghệ"
        badge="Cấu phần 02"
        description="Công nghệ, giải pháp, sáng chế do hội thành viên / tổ chức KH&CN đăng để chào kết nối."
      />
      <SuppliesListClient supplies={supplies} canPost={canPost} />
    </div>
  );
}
