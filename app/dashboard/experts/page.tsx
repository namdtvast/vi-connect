import Link from "next/link";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { VERIFICATION_BADGE, VERIFICATION_LABEL } from "@/lib/verification-labels";

function ExpertAvatar({
  expertId,
  avatarPath,
  name,
}: {
  expertId: string;
  avatarPath: string | null;
  name: string;
}) {
  if (avatarPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/experts/${expertId}/avatar`}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
      <User className="w-5 h-5 text-muted" />
    </div>
  );
}

export default async function ExpertsPage() {
  const session = await auth();
  const canManage =
    session?.user.role === "VAST_ADMIN" || session?.user.role === "HOI_ADMIN";

  const where =
    session?.user.role === "HOI_ADMIN" && session.user.organizationId
      ? { organizationId: session.user.organizationId }
      : {};

  const experts = await db.expertProfile.findMany({
    where,
    include: { user: true, organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hồ sơ chuyên gia (cấu phần 01)</h1>
        <p className="text-sm text-muted mt-1">
          Trusted Expert Registry — nền móng cho ghép nối, hội đồng chuyên gia và
          Knowledge Graph.
          {session?.user.role === "HOI_ADMIN" &&
            " Bạn đang xem hồ sơ thuộc phạm vi tổ chức của mình."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {experts.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <ExpertAvatar
                    expertId={e.id}
                    avatarPath={e.avatarPath}
                    name={e.user?.name ?? "Hồ sơ chưa có người nhận"}
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {e.title ? `${e.title} ` : ""}
                      {e.user?.name ?? "Hồ sơ chưa có người nhận"}
                    </div>
                    <div className="text-xs text-muted truncate">{e.organization.name}</div>
                  </div>
                </div>
                <Badge variant={VERIFICATION_BADGE[e.verificationStatus]}>
                  {VERIFICATION_LABEL[e.verificationStatus]}
                </Badge>
              </div>
              {e.bio && <p className="text-sm text-muted line-clamp-2">{e.bio}</p>}
              <div className="flex flex-wrap gap-1">
                {e.fields.map((f) => (
                  <Badge key={f} variant="brand">
                    {fieldLabel(f)}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted flex gap-4 mt-1">
                <span>{e.experienceYears ?? 0} năm kinh nghiệm</span>
                <span>{e.publications} công bố</span>
                <span>{e.patents} sáng chế</span>
              </div>
              {(canManage || e.userId === session?.user.id) && (
                <Link
                  href={`/dashboard/experts/${e.id}`}
                  className="text-sm text-brand hover:underline mt-1"
                >
                  {canManage ? "Xem chi tiết / xác minh →" : "Xem / chỉnh sửa hồ sơ →"}
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
        {experts.length === 0 && (
          <p className="text-sm text-muted">Chưa có hồ sơ chuyên gia nào.</p>
        )}
      </div>
    </div>
  );
}
