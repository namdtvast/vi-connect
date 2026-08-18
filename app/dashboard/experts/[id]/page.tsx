import { notFound } from "next/navigation";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { VERIFICATION_BADGE, VERIFICATION_LABEL } from "@/lib/verification-labels";
import { VerifyActions } from "@/components/experts/verify-actions";
import { AvatarUploadForm } from "@/components/experts/avatar-upload-form";
import { EditProfileForm } from "@/components/experts/edit-profile-form";
import { formatDate } from "@/lib/utils";
import type { FieldVisibility } from "@/lib/domain/identity";
import { isOrcidOAuthConfigured } from "@/lib/integrations/orcid";
import {
  AdminClaimsSection,
  AffiliationSection,
  ClaimSection,
  ConsentSection,
  EnrichmentAndProposalsSection,
  ExpertiseCapabilitySection,
  IdentityMatchSection,
  MergeHistorySection,
  OrcidSection,
  VisibilitySection,
} from "@/components/experts/identity-panel";

const ORCID_ERROR_LABEL: Record<string, string> = {
  denied: "Bạn đã huỷ hoặc ORCID từ chối yêu cầu kết nối.",
  state: "Yêu cầu kết nối ORCID hết hạn hoặc không hợp lệ, thử lại.",
  profile: "Không tìm thấy hồ sơ để kết nối ORCID.",
  forbidden: "Bạn không có quyền kết nối ORCID cho hồ sơ này.",
  token: "Không xác thực được với ORCID, thử lại.",
  conflict: "ORCID này đã xác thực trên một hồ sơ khác — đã ghi nhận nghi ngờ trùng để admin xử lý.",
};

export default async function ExpertDetailPage({
  params,
  searchParams,
}: PageProps<"/dashboard/experts/[id]"> & {
  searchParams: Promise<{ orcid_connected?: string; orcid_error?: string }>;
}) {
  const { id } = await params;
  const { orcid_connected, orcid_error } = await searchParams;
  const session = await auth();

  const expert = await db.expertProfile.findUnique({
    where: { id },
    include: {
      user: true,
      organization: true,
      identifiers: true,
      consents: { orderBy: { grantedAt: "desc" } },
      fieldProposals: { where: { decision: "PENDING" }, orderBy: { createdAt: "desc" } },
      expertise: true,
      capabilities: { include: { evidence: true } },
      affiliations: { include: { organization: true }, orderBy: { createdAt: "asc" } },
      externalConnections: true,
    },
  });

  if (!expert) notFound();

  const canManage =
    session?.user.role === "VAST_ADMIN" ||
    (session?.user.role === "HOI_ADMIN" &&
      session.user.organizationId === expert.organizationId);
  const canMerge = session?.user.role === "VAST_ADMIN";
  const isOwner = Boolean(session?.user && expert.userId === session.user.id);
  // Admin (VAST_ADMIN toàn hệ thống, HOI_ADMIN đúng tổ chức) được thao tác
  // thay chủ hồ sơ — ADR-0001 Mục 5.1. lib/actions/identity.ts tự kiểm tra
  // lại quyền này ở server, đây chỉ là điều kiện hiển thị form.
  const canEdit = isOwner || canManage;

  const viewerHasProfile = session?.user
    ? Boolean(await db.expertProfile.findUnique({ where: { userId: session.user.id } }))
    : true;

  const [organizations, pendingClaims, identityMatches, mergeHistory] = await Promise.all([
    canEdit ? db.organization.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    canManage
      ? db.profileClaim.findMany({
          where: { expertProfileId: id, status: "PENDING" },
          include: { claimant: true },
        })
      : Promise.resolve([]),
    canManage
      ? db.identityMatch.findMany({
          where: { OR: [{ profileAId: id }, { profileBId: id }], status: { not: "MERGED" } },
          include: {
            profileA: { include: { user: true, organization: true } },
            profileB: { include: { user: true, organization: true } },
          },
        })
      : Promise.resolve([]),
    canManage
      ? db.mergeHistory.findMany({
          where: { targetProfileId: id },
          include: { sourceProfile: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4 min-w-0">
          {expert.avatarPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/experts/${expert.id}/avatar`}
              alt={expert.user?.name ?? "Ảnh chuyên gia"}
              className="w-20 h-20 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-muted" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold">
              {expert.title ? `${expert.title} ` : ""}
              {expert.user?.name ?? "Hồ sơ chưa có người nhận"}
            </h1>
            <p className="text-sm text-muted">{expert.organization.name}</p>
          </div>
        </div>
        <Badge variant={VERIFICATION_BADGE[expert.verificationStatus]}>
          {VERIFICATION_LABEL[expert.verificationStatus]}
        </Badge>
      </div>

      {canEdit && (
        <Card>
          <CardContent>
            <div className="text-sm font-medium mb-2">Ảnh chân dung</div>
            <AvatarUploadForm expertProfileId={expert.id} />
          </CardContent>
        </Card>
      )}

      {canEdit && (
        <Card>
          <CardContent>
            <div className="text-sm font-medium mb-2">Chỉnh sửa thông tin hồ sơ</div>
            <EditProfileForm
              expertProfileId={expert.id}
              title={expert.title}
              headline={expert.headline}
              bio={expert.bio}
              fields={expert.fields}
              skills={expert.skills}
              experienceYears={expert.experienceYears}
              publications={expert.publications}
              patents={expert.patents}
            />
          </CardContent>
        </Card>
      )}

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

      {!expert.userId && session?.user && !viewerHasProfile && (
        <ClaimSection expertProfileId={expert.id} />
      )}

      {canManage && <AdminClaimsSection claims={pendingClaims} />}

      <OrcidSection
        expertProfileId={expert.id}
        orcidValue={expert.identifiers.find((i) => i.type === "ORCID")?.value ?? null}
        connectionStatus={expert.externalConnections.find((c) => c.sourceType === "ORCID")?.status ?? null}
        canEdit={canEdit}
        oauthConfigured={isOrcidOAuthConfigured()}
        banner={
          orcid_connected
            ? { kind: "success", message: "Đã kết nối ORCID qua OAuth thật." }
            : orcid_error
              ? { kind: "error", message: ORCID_ERROR_LABEL[orcid_error] ?? "Có lỗi khi kết nối ORCID." }
              : null
        }
      />

      <ConsentSection expertProfileId={expert.id} consents={expert.consents} canEdit={canEdit} />

      <EnrichmentAndProposalsSection
        expertProfileId={expert.id}
        proposals={expert.fieldProposals}
        canEdit={canEdit}
      />

      <ExpertiseCapabilitySection
        expertProfileId={expert.id}
        expertise={expert.expertise}
        capabilities={expert.capabilities}
        canEdit={canEdit}
        canVerify={canManage}
      />

      <AffiliationSection
        expertProfileId={expert.id}
        affiliations={expert.affiliations}
        organizations={organizations}
        canEdit={canEdit}
        canVerify={canManage}
      />

      <VisibilitySection
        expertProfileId={expert.id}
        visibility={(expert.visibility as Record<string, FieldVisibility>) ?? {}}
        canEdit={canEdit}
      />

      {canManage && (
        <IdentityMatchSection
          expertProfileId={expert.id}
          canMerge={canMerge}
          matches={identityMatches.map((m) => {
            const other = m.profileAId === expert.id ? m.profileB : m.profileA;
            return {
              id: m.id,
              score: m.score,
              status: m.status,
              otherProfile: {
                id: other.id,
                name: other.user?.name ?? other.headline ?? "Hồ sơ chưa có tên",
                organizationName: other.organization.name,
              },
            };
          })}
        />
      )}

      {canManage && (
        <MergeHistorySection
          merges={mergeHistory.map((m) => ({
            id: m.id,
            reason: m.reason,
            rolledBackAt: m.rolledBackAt ? m.rolledBackAt.toISOString() : null,
            sourceProfileName: m.sourceProfile.user?.name ?? m.sourceProfile.headline ?? "hồ sơ khác",
          }))}
        />
      )}
    </div>
  );
}
