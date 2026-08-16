"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { FIELDS } from "@/lib/taxonomy";

export type ActionState = { error?: string; success?: boolean };

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    throw error;
  }
}

const registerSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  organizationId: z.string().min(1, "Vui lòng chọn tổ chức"),
  title: z.string().optional(),
  bio: z.string().optional(),
  fields: z.array(z.string()).min(1, "Chọn ít nhất 1 lĩnh vực chuyên môn"),
});

export async function registerExpertAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationId: formData.get("organizationId"),
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
    fields: formData.getAll("fields").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const validFieldCodes = new Set<string>(FIELDS.map((f) => f.code));
  const fields = parsed.data.fields.filter((f) => validFieldCodes.has(f));

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Email này đã được đăng ký." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "EXPERT",
      organizationId: parsed.data.organizationId,
      expertProfile: {
        create: {
          organizationId: parsed.data.organizationId,
          title: parsed.data.title,
          bio: parsed.data.bio,
          fields,
          verificationStatus: "PENDING",
        },
      },
    },
  });

  return { success: true };
}
