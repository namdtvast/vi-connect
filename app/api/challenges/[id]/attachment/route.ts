import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertOrgScope, ForbiddenError } from "@/lib/rbac";
import { readUploadedFile } from "@/lib/uploads";

// Kiểm tra quyền theo VC-KT-002 Mục 8: status = PUBLISHED xem được ở scope
// PLATFORM* (mọi user đăng nhập), các trạng thái khác chỉ ORGANIZATION sở
// hữu — không phục vụ tệp qua public/ để tránh bỏ qua kiểm tra này.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const challenge = await db.challenge.findUnique({ where: { id } });
  if (!challenge || !challenge.attachmentPath) {
    return new Response("Not found", { status: 404 });
  }

  if (challenge.status !== "PUBLISHED") {
    try {
      assertOrgScope(session.user, challenge.organizationId);
    } catch (e) {
      if (e instanceof ForbiddenError) return new Response("Forbidden", { status: 403 });
      throw e;
    }
  }

  const buffer = await readUploadedFile(challenge.attachmentPath);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(challenge.attachmentName ?? "attachment")}"`,
    },
  });
}
