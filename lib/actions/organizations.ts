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

// Xoá vĩnh viễn — chỉ cho phép khi tổ chức không còn dữ liệu liên kết nào,
// tránh xoá cascade âm thầm cuốn theo tài khoản/hồ sơ/nhu cầu thật. Còn dữ
// liệu liên kết thì dùng setOrganizationStatusAction("SUSPENDED") thay thế.
export async function deleteOrganizationAction(
  organizationId: string
): Promise<{ error?: string }> {
  const user = await requireRole("SUPERADMIN");

  const org = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    include: {
      _count: {
        select: {
          users: true,
          members: true,
          affiliations: true,
          needs: true,
          supplies: true,
          challenges: true,
          fundingSources: true,
          children: true,
        },
      },
    },
  });

  const c = org._count;
  const total =
    c.users + c.members + c.affiliations + c.needs + c.supplies + c.challenges + c.fundingSources + c.children;
  if (total > 0) {
    return {
      error: `Không thể xoá — tổ chức còn ${c.users} tài khoản, ${c.members} hồ sơ chuyên gia, ${c.needs} nhu cầu, ${c.supplies} công nghệ/giải pháp, ${c.challenges} bài toán, ${c.fundingSources} nguồn lực, ${c.children} tổ chức trực thuộc liên kết. Dùng "Tạm ngưng" thay vì xoá.`,
    };
  }

  await db.organization.delete({ where: { id: organizationId } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "DELETE_ORGANIZATION",
      entity: "Organization",
      entityId: organizationId,
    },
  });

  revalidatePath("/dashboard/organizations");
  return {};
}
