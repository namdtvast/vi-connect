import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { VERIFICATION_BADGE, VERIFICATION_LABEL } from "@/lib/verification-labels";
import { VerifyActions } from "@/components/experts/verify-actions";
import { formatDate } from "@/lib/utils";

export default async function ExpertDetailPage({
  params,
}: PageProps<"/dashboard/experts/[id]">) {
  const { id } = await params;
  const session = await auth();

  const expert = await db.expertProfile.findUnique({
    where: { id },
    include: { user: true, organization: true, identifiers: true },
  });

  if (!expert) notFound();

  const canManage =
    session?.user.role === "VAST_ADMIN" ||
    (session?.user.role === "HOI_ADMIN" &&
      session.user.organizationId === expert.organizationId);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {expert.title ? `${expert.title} ` : ""}
            {expert.user.name}
          </h1>
          <p className="text-sm text-muted">{expert.organization.name}</p>
        </div>
        <Badge variant={VERIFICATION_BADGE[expert.verificationStatus]}>
          {VERIFICATION_LABEL[expert.verificationStatus]}
        </Badge>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs uppercase text-muted mb-1">Giới thiệu</div>
            <p className="text-sm">{expert.bio ?? "Chưa cập nhật."}</p>
          </div>
          <div>
            <div className="text-xs uppercase text-muted mb-1">Lĩnh vực chuyên môn</div>
            <div className="flex flex-wrap gap-1">
              {expert.fields.map((f) => (
                <Badge key={f} variant="brand">
                  {fieldLabel(f)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted mb-1">Kỹ năng</div>
            <div className="flex flex-wrap gap-1">
              {expert.skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted">Kinh nghiệm</div>
              <div className="font-medium">{expert.experienceYears ?? 0} năm</div>
            </div>
            <div>
              <div className="text-xs text-muted">Công bố</div>
              <div className="font-medium">{expert.publications}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Sáng chế</div>
              <div className="font-medium">{expert.patents}</div>
            </div>
          </div>
          {expert.verifiedAt && (
            <p className="text-xs text-muted">
              Xác minh lần cuối: {formatDate(expert.verifiedAt)}
            </p>
          )}
        </CardContent>
      </Card>

      {canManage && expert.verificationStatus !== "VERIFIED" && (
        <Card>
          <CardContent>
            <div className="text-sm font-medium mb-2">Xác minh hồ sơ (cấu phần 01)</div>
            <VerifyActions expertProfileId={expert.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
