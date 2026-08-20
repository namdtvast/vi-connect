import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { SuppliesListClient } from "@/components/matching/supplies-list-client";

export default async function SuppliesPage() {
  const session = await auth();
  const canPost = session?.user.role === "SUPERADMIN" || session?.user.role === "ADMIN";

  // status = PUBLISHED công khai toàn nền tảng; DRAFT/ARCHIVED chỉ tổ chức sở
  // hữu (hoặc SUPERADMIN) mới thấy — trước đây where: {status: "PUBLISHED"}
  // cứng khiến nguồn cung tự lưu trữ biến mất khỏi mắt chính chủ, không ai
  // xem/mở lại được (VC-KT-002 Mục 8).
  const supplies = await db.supply.findMany({
    where:
      session?.user.role === "SUPERADMIN"
        ? {}
        : session?.user.organizationId
          ? { OR: [{ status: "PUBLISHED" }, { organizationId: session.user.organizationId }] }
          : { status: "PUBLISHED" },
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
      <SuppliesListClient
        supplies={supplies}
        canPost={canPost}
        viewerRole={session?.user.role ?? null}
        viewerOrganizationId={session?.user.organizationId ?? null}
      />
    </div>
  );
}
