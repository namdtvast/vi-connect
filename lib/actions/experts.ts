"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertOrgScope, requireRole, requireUser } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/uploads";
import type { ActionState } from "@/lib/actions/auth";
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

export async function updateAvatarAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const expertProfileId = String(formData.get("expertProfileId") ?? "");

  const profile = await db.expertProfile.findUniqueOrThrow({
    where: { id: expertProfileId },
  });

  const isOwner = profile.userId === user.id;
  const isAdmin =
    user.role === "VAST_ADMIN" ||
    (user.role === "HOI_ADMIN" && user.organizationId === profile.organizationId);
  if (!isOwner && !isAdmin) {
    return { error: "Bạn không có quyền cập nhật ảnh chân dung hồ sơ này." };
  }

  const avatar = formData.get("avatar");
  if (!(avatar instanceof File) || avatar.size === 0) {
    return { error: "Vui lòng chọn ảnh." };
  }
  if (!avatar.type.startsWith("image/")) {
    return { error: "Chỉ nhận tệp ảnh (PNG hoặc JPEG)." };
  }

  let saved;
  try {
    saved = await saveUploadedFile(avatar, "experts/avatars");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Không thể lưu ảnh." };
  }

  await db.expertProfile.update({
    where: { id: expertProfileId },
    data: { avatarPath: saved.path, avatarName: saved.name },
  });

  revalidatePath("/dashboard/experts");
  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return { success: true };
}
