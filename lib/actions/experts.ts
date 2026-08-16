"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertOrgScope, requireRole } from "@/lib/rbac";
import type { VerificationStatus } from "@/lib/generated/prisma/enums";

export async function verifyExpertAction(
  expertProfileId: string,
  status: VerificationStatus,
  note?: string
) {
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN");

  const profile = await db.expertProfile.findUniqueOrThrow({
    where: { id: expertProfileId },
  });
  assertOrgScope(user, profile.organizationId);

  await db.expertProfile.update({
    where: { id: expertProfileId },
    data: {
      verificationStatus: status,
      verifiedById: user.id,
      verifiedAt: new Date(),
      verificationNote: note,
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: `VERIFY_EXPERT_${status}`,
      entity: "ExpertProfile",
      entityId: expertProfileId,
    },
  });

  revalidatePath("/dashboard/experts");
  revalidatePath(`/dashboard/experts/${expertProfileId}`);
}
