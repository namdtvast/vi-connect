import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsListClient } from "@/components/projects/projects-list-client";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    include: {
      agreement: true,
      _count: { select: { milestones: true } },
      milestones: { where: { status: "ACCEPTED" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dự án & hợp đồng"
        badge="Cấu phần 07"
        description="Được tạo tự động khi một đề xuất ghép nối được chấp nhận và chuyển thành hợp tác thực tế."
      />
      <ProjectsListClient projects={projects} />
    </div>
  );
}
