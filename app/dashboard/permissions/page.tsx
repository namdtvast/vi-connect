import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { ALL_ROLES, ASSIGNABLE_BY_ADMIN } from "@/lib/permissions";
import { PermissionsListClient } from "@/components/users/permissions-list-client";

export default async function PermissionsPage() {
  const session = await auth();
  const role = session?.user.role;
  if (role !== "SUPERADMIN" && role !== "ADMIN") redirect("/dashboard");

  const isPlatformAdmin = role === "SUPERADMIN";
  const currentUserId = session!.user.id;

  const users = await db.user.findMany({
    where: isPlatformAdmin ? {} : { organizationId: session!.user.organizationId },
    include: { organization: { select: { name: true } } },
    orderBy: [{ organizationId: "asc" }, { createdAt: "asc" }],
  });

  const assignableRoles = isPlatformAdmin ? ALL_ROLES : ASSIGNABLE_BY_ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý phân quyền"
        badge="Cấu phần 10"
        description={`Gán vai trò cho tài khoản ${
          isPlatformAdmin ? "trên toàn nền tảng" : "trong tổ chức của bạn"
        }. Theo thiết kế VC-KT-002 Mục 5, 7.1: quản trị VAST toàn quyền; quản trị hội thành viên chỉ gán được Chuyên gia/Doanh nghiệp/Người xem trong tổ chức mình, không tự cấp quyền quản trị. Mọi thay đổi được ghi vào nhật ký hệ thống.`}
      />

      <PermissionsListClient
        users={users}
        currentUserId={currentUserId}
        isPlatformAdmin={isPlatformAdmin}
        assignableRoles={assignableRoles}
      />
    </div>
  );
}
