"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import type { ActionState } from "@/lib/actions/auth";

const orgSchema = z.object({
  name: z.string().min(3, "Tên tổ chức tối thiểu 3 ký tự"),
  shortName: z.string().optional(),
  type: z.enum([
    "HOI_THANH_VIEN",
    "TO_CHUC_KHCN",
    "DOANH_NGHIEP",
    "QUY_DAU_TU",
    "CO_QUAN_QUAN_LY",
    "KHAC",
  ]),
  province: z.string().optional(),
  description: z.string().optional(),
});

export async function createOrganizationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN");

  const parsed = orgSchema.safeParse({
    name: formData.get("name"),
    shortName: formData.get("shortName") || undefined,
    type: formData.get("type"),
    province: formData.get("province") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const org = await db.organization.create({
    data: { ...parsed.data, status: "ACTIVE" },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE_ORGANIZATION",
      entity: "Organization",
      entityId: org.id,
    },
  });

  revalidatePath("/dashboard/organizations");
  return { success: true };
}

export async function setOrganizationStatusAction(
  organizationId: string,
  status: "ACTIVE" | "SUSPENDED" | "PENDING"
) {
  const user = await requireRole("SUPERADMIN");
  await db.organization.update({ where: { id: organizationId }, data: { status } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: `SET_ORG_STATUS_${status}`,
      entity: "Organization",
      entityId: organizationId,
    },
  });
  revalidatePath("/dashboard/organizations");
}
