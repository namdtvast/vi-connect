import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { PublicationsListClient } from "@/components/knowledge/publications-list-client";

export default async function PublicationsPage() {
  const session = await auth();
  const canPost = session?.user.role === "SUPERADMIN" || session?.user.role === "ADMIN";

  const publications = await db.publication.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tri thức & Dữ liệu"
        badge="Cấu phần 03"
        description="Công bố khoa học (Publication) do hội thành viên / tổ chức KH&CN đăng — tra DOI thật qua Crossref. Patent, Dataset, Knowledge chưa xây (backlog)."
      />
      <PublicationsListClient publications={publications} canPost={canPost} />
    </div>
  );
}
