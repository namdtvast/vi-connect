"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertOrgScope, requireRole, requireUser, type CurrentUser } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/uploads";
import { FIELDS } from "@/lib/taxonomy";
import type { ActionState } from "@/lib/actions/auth";
import type { VerificationStatus } from "@/lib/generated/prisma/enums";

// Chủ hồ sơ tự sửa dữ liệu của mình; admin (VAST_ADMIN toàn hệ thống,
// HOI_ADMIN đúng tổ chức) được thao tác thay chủ hồ sơ — ADR-0001 Mục 5.1.
function canEditProfile(user: CurrentUser, profile: { userId: string | null; organizationId: string }) {
  return (
    profile.userId === user.id ||
    user.role === "VAST_ADMIN" ||
    (user.role === "HOI_ADMIN" && user.organizationId === profile.organizationId)
  );
}

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

  if (!canEditProfile(user, profile)) {
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

const profileSchema = z.object({
  title: z.string().max(50).optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  fields: z.array(z.string()),
  skills: z.string().max(500).optional(),
  experienceYears: z.string().optional(),
  publications: z.string().optional(),
  patents: z.string().optional(),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const expertProfileId = String(formData.get("expertProfileId") ?? "");

  const profile = await db.expertProfile.findUniqueOrThrow({
    where: { id: expertProfileId },
  });

  if (!canEditProfile(user, profile)) {
    return { error: "Bạn không có quyền cập nhật hồ sơ này." };
  }

  const validCodes = new Set<string>(FIELDS.map((f) => f.code));
  const parsed = profileSchema.safeParse({
    title: formData.get("title") || undefined,
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    fields: formData.getAll("fields").map(String).filter((f) => validCodes.has(f)),
    skills: formData.get("skills") || undefined,
    experienceYears: formData.get("experienceYears") || undefined,
    publications: formData.get("publications") || undefined,
    patents: formData.get("patents") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const skills = parsed.data.skills
    ? parsed.data.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  await db.expertProfile.update({
    where: { id: expertProfileId },
    data: {
      title: parsed.data.title ?? null,
      headline: parsed.data.headline ?? null,
      bio: parsed.data.bio ?? null,
      fields: parsed.data.fields,
      skills,
      experienceYears: parsed.data.experienceYears ? Number(parsed.data.experienceYears) : null,
      publications: parsed.data.publications ? Number(parsed.data.publications) : 0,
      patents: parsed.data.patents ? Number(parsed.data.patents) : 0,
    },
  });

  revalidatePath("/dashboard/experts");
  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return { success: true };
}
