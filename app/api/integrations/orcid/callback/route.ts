import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exchangeOrcidCode } from "@/lib/integrations/orcid";

/** Xác minh state ký ở /connect — sai chữ ký hoặc quá 10 phút thì từ chối. */
function verifyState(state: string): string | null {
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [expertProfileId, ts, sig] = parts;

  const expected = crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`${expertProfileId}.${ts}`)
    .digest("hex");
  if (sig !== expected) return null;
  if (Date.now() - Number(ts) > 10 * 60 * 1000) return null;

  return expertProfileId;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.redirect(new URL("/login", request.url), 302);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError || !code || !state) {
    return Response.redirect(new URL("/dashboard/experts?orcid_error=denied", request.url), 302);
  }

  const expertProfileId = verifyState(state);
  if (!expertProfileId) {
    return Response.redirect(new URL("/dashboard/experts?orcid_error=state", request.url), 302);
  }

  const profile = await db.expertProfile.findUnique({ where: { id: expertProfileId } });
  if (!profile) {
    return Response.redirect(new URL("/dashboard/experts?orcid_error=profile", request.url), 302);
  }

  const isOwner = profile.userId === session.user.id;
  const isAdmin =
    session.user.role === "VAST_ADMIN" ||
    (session.user.role === "HOI_ADMIN" && session.user.organizationId === profile.organizationId);
  if (!isOwner && !isAdmin) {
    return Response.redirect(
      new URL(`/dashboard/experts/${expertProfileId}?orcid_error=forbidden`, request.url),
      302
    );
  }

  const redirectUri = new URL("/api/integrations/orcid/callback", request.url).toString();
  const token = await exchangeOrcidCode({ code, redirectUri });
  if (!token) {
    return Response.redirect(
      new URL(`/dashboard/experts/${expertProfileId}?orcid_error=token`, request.url),
      302
    );
  }

  let conflictProfileId: string | null = null;

  await db.$transaction(async (tx) => {
    const existingIdentifier = await tx.identifier.findUnique({
      where: { type_value: { type: "ORCID", value: token.orcid } },
    });

    // Một ORCID đã xác thực chỉ được gắn với một golden profile — nếu đã
    // thuộc hồ sơ khác, KHÔNG cướp danh tính, chỉ ghi nhận nghi ngờ trùng
    // để admin xử lý qua Identity Match (VC-NV-011 Mục 17.3).
    if (existingIdentifier?.expertProfileId && existingIdentifier.expertProfileId !== expertProfileId) {
      conflictProfileId = existingIdentifier.expertProfileId;

      const [profileAId, profileBId] = [expertProfileId, conflictProfileId].sort();
      await tx.identityMatch.upsert({
        where: { profileAId_profileBId: { profileAId, profileBId } },
        create: {
          profileAId,
          profileBId,
          score: 1,
          signals: { orcidAuthenticatedConflict: 1 },
          status: "LIKELY_SAME",
        },
        update: {
          score: 1,
          signals: { orcidAuthenticatedConflict: 1 },
          status: "LIKELY_SAME",
        },
      });

      const ownConnection = await tx.externalConnection.findFirst({
        where: { expertProfileId, sourceType: "ORCID" },
      });
      if (ownConnection) {
        await tx.externalConnection.update({
          where: { id: ownConnection.id },
          data: { externalId: token.orcid, status: "DISPUTED" },
        });
      } else {
        await tx.externalConnection.create({
          data: { expertProfileId, sourceType: "ORCID", externalId: token.orcid, status: "DISPUTED" },
        });
      }
      return;
    }

    if (!existingIdentifier) {
      await tx.identifier.create({ data: { type: "ORCID", value: token.orcid, expertProfileId } });
    } else if (existingIdentifier.expertProfileId !== expertProfileId) {
      await tx.identifier.update({ where: { id: existingIdentifier.id }, data: { expertProfileId } });
    }

    const connection = await tx.externalConnection.findFirst({
      where: { expertProfileId, sourceType: "ORCID" },
    });
    if (connection) {
      await tx.externalConnection.update({
        where: { id: connection.id },
        data: { externalId: token.orcid, status: "AUTHENTICATED", revokedAt: null },
      });
    } else {
      await tx.externalConnection.create({
        data: { expertProfileId, sourceType: "ORCID", externalId: token.orcid, status: "AUTHENTICATED" },
      });
    }
  });

  if (conflictProfileId) {
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ORCID_OAUTH_CONFLICT",
        entity: "ExpertProfile",
        entityId: expertProfileId,
        meta: { orcid: token.orcid, conflictProfileId },
      },
    });
    return Response.redirect(
      new URL(`/dashboard/experts/${expertProfileId}?orcid_error=conflict`, request.url),
      302
    );
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ORCID_OAUTH_CONNECTED",
      entity: "ExpertProfile",
      entityId: expertProfileId,
      meta: { orcid: token.orcid, actingAsAdmin: !isOwner },
    },
  });

  return Response.redirect(
    new URL(`/dashboard/experts/${expertProfileId}?orcid_connected=1`, request.url),
    302
  );
}
