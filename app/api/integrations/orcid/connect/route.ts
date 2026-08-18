import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildOrcidAuthorizeUrl, isOrcidOAuthConfigured } from "@/lib/integrations/orcid";

/** State ký HMAC bằng AUTH_SECRET — chống CSRF, không cần session store riêng. */
function signState(expertProfileId: string): string {
  const ts = Date.now().toString();
  const sig = crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`${expertProfileId}.${ts}`)
    .digest("hex");
  return `${expertProfileId}.${ts}.${sig}`;
}

export async function GET(request: Request) {
  if (!isOrcidOAuthConfigured()) {
    return new Response(
      "ORCID_CLIENT_ID/ORCID_CLIENT_SECRET chưa được cấu hình trên server này.",
      { status: 501 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return Response.redirect(new URL("/login", request.url), 302);
  }

  const expertProfileId = new URL(request.url).searchParams.get("expertProfileId");
  if (!expertProfileId) {
    return new Response("Thiếu expertProfileId.", { status: 400 });
  }

  const profile = await db.expertProfile.findUnique({ where: { id: expertProfileId } });
  if (!profile) {
    return new Response("Không tìm thấy hồ sơ.", { status: 404 });
  }

  const isOwner = profile.userId === session.user.id;
  const isAdmin =
    session.user.role === "SUPERADMIN" ||
    (session.user.role === "ADMIN" && session.user.organizationId === profile.organizationId);
  if (!isOwner && !isAdmin) {
    return new Response("Không có quyền kết nối ORCID cho hồ sơ này.", { status: 403 });
  }

  const redirectUri = new URL("/api/integrations/orcid/callback", request.url).toString();
  const authorizeUrl = buildOrcidAuthorizeUrl({ redirectUri, state: signState(expertProfileId) });

  return Response.redirect(authorizeUrl, 302);
}
