import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL } from "@/lib/project-labels";
import { MilestonePanel } from "@/components/projects/milestone-panel";
import { AgreementPanel } from "@/components/projects/agreement-panel";

export default async function ProjectDetailPage({
  params,
}: PageProps<"/dashboard/projects/[id]">) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
      agreement: true,
      match: { include: { need: { include: { organization: true } } } },
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{project.title}</h1>
          {project.match?.need && (
            <p className="text-sm text-muted mt-1">
              Từ nhu cầu: {project.match.need.title} ({project.match.need.organization.name})
            </p>
          )}
        </div>
        <Badge variant="brand">{PROJECT_STATUS_LABEL[project.status]}</Badge>
      </div>

      {project.summary && (
        <Card>
          <CardContent>
            <p className="text-sm">{project.summary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mốc thực hiện (cấu phần 07)</CardTitle>
        </CardHeader>
        <CardContent>
          <MilestonePanel projectId={project.id} milestones={project.milestones} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng / thỏa thuận (cấu phần 07)</CardTitle>
        </CardHeader>
        <CardContent>
          <AgreementPanel projectId={project.id} agreement={project.agreement} />
        </CardContent>
      </Card>
    </div>
  );
}
