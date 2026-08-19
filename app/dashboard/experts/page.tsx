import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { ExpertsListClient } from "@/components/experts/experts-list-client";

export default async function ExpertsPage() {
  const session = await auth();
  const canManage =
    session?.user.role === "SUPERADMIN" || session?.user.role === "ADMIN";

  const where =
    session?.user.role === "ADMIN" && session.user.organizationId
      ? { organizationId: session.user.organizationId }
      : {};

  const experts = await db.expertProfile.findMany({
    where,
    include: { user: true, organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ chuyên gia"
        badge="Cấu phần 01"
        description={`Trusted Expert Registry — nền móng cho ghép nối, hội đồng chuyên gia và Knowledge Graph.${
          session?.user.role === "ADMIN" ? " Bạn đang xem hồ sơ thuộc phạm vi tổ chức của mình." : ""
        }`}
      />
      <ExpertsListClient
        experts={experts}
        canManage={canManage}
        currentUserId={session?.user.id}
      />
    </div>
  );
}
