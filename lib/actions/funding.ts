"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { FIELDS } from "@/lib/taxonomy";
import type { ActionState } from "@/lib/actions/auth";

const fundingSourceSchema = z.object({
  name: z.string().min(3, "Tên nguồn lực/tài trợ tối thiểu 3 ký tự"),
  fields: z.array(z.string()).min(1, "Chọn ít nhất 1 lĩnh vực"),
  note: z.string().optional(),
});

export async function createFundingSourceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN", "ENTERPRISE");
  if (!user.organizationId) return { error: "Tài khoản chưa gắn với tổ chức." };

  const validCodes = new Set<string>(FIELDS.map((f) => f.code));
  const parsed = fundingSourceSchema.safeParse({
    name: formData.get("name"),
    fields: formData.getAll("fields").map(String).filter((f) => validCodes.has(f)),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const source = await db.fundingSource.create({
    data: {
      name: parsed.data.name,
      fields: parsed.data.fields,
      note: parsed.data.note,
      organizationId: user.organizationId,
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE_FUNDING_SOURCE",
      entity: "FundingSource",
      entityId: source.id,
    },
  });

  revalidatePath("/dashboard/funding-sources");
  return { success: true };
}
