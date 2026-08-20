import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL } from "@/lib/project-labels";
import { MilestonePanel } from "@/components/projects/milestone-panel";
import { AgreementPanel } from "@/components/projects/agreement-panel";
import { EvaluationPanel } from "@/components/projects/evaluation-panel";
import { TeamPanel } from "@/components/projects/team-panel";
import { ProjectStatusActions } from "@/components/projects/project-status-actions";
import { partyOrganizationIdsOfMatch } from "@/lib/rbac";

export default async function ProjectDetailPage({
  params,
}: PageProps<"/dashboard/projects/[id]">) {
  const { id } = await params;
  const session = await auth();

  const project = await db.project.findUnique({
    where: { id },
    include: {
      milestones: { include: { deliverables: true }, orderBy: { createdAt: "asc" } },
      agreement: true,
      evaluations: { include: { evaluatedBy: true }, orderBy: { createdAt: "desc" } },
      members: { include: { user: true }, orderBy: { addedAt: "asc" } },
      match: {
        include: { need: { include: { organization: true } }, supply: true, expertProfile: true },
      },
    },
  });

  if (!project) notFound();

  // Cùng điều kiện với các action trong lib/actions/projects.ts (assertPartyScope)
  // — chỉ hiện nút khi chắc chắn thao tác được, tránh lỗi quyền không xử lý được.
  const partyOrgIds = partyOrganizationIdsOfMatch(project.match);
  const canManage =
    session?.user.role === "SUPERADMIN" ||
    (["ADMIN", "ENTERPRISE"].includes(session?.user.role ?? "") &&
      !!session?.user.organizationId &&
      partyOrgIds.includes(session.user.organizationId));

  const eligibleUsers = canManage
    ? await db.user.findMany({
        where: { organizationId: { in: partyOrgIds } },
        select: { id: true, name: true, organizationId: true },
        orderBy: { name: "asc" },
      })
    : [];

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
        {canManage ? (
          <ProjectStatusActions projectId={project.id} status={project.status} />
        ) : (
          <Badge variant="brand">{PROJECT_STATUS_LABEL[project.status]}</Badge>
        )}
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
          <MilestonePanel projectId={project.id} milestones={project.milestones} canManage={canManage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng / thỏa thuận (cấu phần 07)</CardTitle>
        </CardHeader>
        <CardContent>
          <AgreementPanel projectId={project.id} agreement={project.agreement} canManage={canManage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đánh giá dự án (cấu phần 08)</CardTitle>
        </CardHeader>
        <CardContent>
          <EvaluationPanel
            projectId={project.id}
            evaluations={project.evaluations}
            canManage={canManage}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đội thực hiện (cấu phần 09)</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPanel
            projectId={project.id}
            members={project.members}
            eligibleUsers={eligibleUsers}
            canManage={canManage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
