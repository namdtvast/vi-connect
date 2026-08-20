"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { extractDoi, fetchCrossrefWorkByDoi, type CrossrefWork } from "@/lib/integrations/crossref";
import { FIELDS } from "@/lib/taxonomy";
import type { ActionState } from "@/lib/actions/auth";

/** Cấu phần 03: tra DOI thật qua Crossref để điền sẵn form đăng công bố. */
export async function lookupDoiAction(
  input: string
): Promise<{ data?: CrossrefWork; error?: string }> {
  await requireRole("SUPERADMIN", "ADMIN");

  const doi = extractDoi(input);
  if (!doi) return { error: "Không nhận diện được DOI hợp lệ trong chuỗi đã nhập." };

  const work = await fetchCrossrefWorkByDoi(doi);
  if (!work) return { error: "Không tìm thấy công bố cho DOI này trên Crossref." };
  return { data: work };
}

const publicationSchema = z.object({
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  abstract: z.string().optional(),
  type: z.enum([
    "JOURNAL_ARTICLE",
    "CONFERENCE_PAPER",
    "BOOK",
    "BOOK_CHAPTER",
    "PREPRINT",
    "TECHNICAL_REPORT",
    "OTHER",
  ]),
  containerTitle: z.string().optional(),
  year: z.string().optional(),
  doi: z.string().optional(),
  authors: z.string().optional(),
  fields: z.array(z.string()).min(1, "Chọn ít nhất 1 lĩnh vực"),
});

/** Cấu phần 03: đăng công bố khoa học (Publication) — v1 chỉ ADMIN/SUPERADMIN. */
export async function createPublicationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("SUPERADMIN", "ADMIN");
  if (!user.organizationId) return { error: "Tài khoản chưa gắn với tổ chức." };

  const validCodes = new Set<string>(FIELDS.map((f) => f.code));
  const rawDoi = String(formData.get("doi") ?? "").trim();
  const parsed = publicationSchema.safeParse({
    title: formData.get("title"),
    abstract: formData.get("abstract") || undefined,
    type: formData.get("type"),
    containerTitle: formData.get("containerTitle") || undefined,
    year: formData.get("year") || undefined,
    doi: rawDoi || undefined,
    authors: formData.get("authors") || undefined,
    fields: formData.getAll("fields").map(String).filter((f) => validCodes.has(f)),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const doi = parsed.data.doi ? extractDoi(parsed.data.doi) : null;
  if (parsed.data.doi && !doi) {
    return { error: "DOI nhập vào không đúng định dạng." };
  }
  if (doi) {
    const existing = await db.publication.findUnique({ where: { doi } });
    if (existing) return { error: "DOI này đã được đăng trên hệ thống." };
  }

  const authors = (parsed.data.authors ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  await db.publication.create({
    data: {
      title: parsed.data.title,
      abstract: parsed.data.abstract,
      type: parsed.data.type,
      containerTitle: parsed.data.containerTitle,
      year: parsed.data.year ? Number(parsed.data.year) : null,
      fields: parsed.data.fields,
      authors,
      doi,
      sourceType: doi ? "CROSSREF" : "INTERNAL",
      organizationId: user.organizationId,
    },
  });

  revalidatePath("/dashboard/publications");
  return { success: true };
}

/** Xác minh một Publication — Maker-Checker nhẹ: người verify khác người tạo tổ chức đã đăng vẫn cho phép cùng ADMIN, chỉ chặn khác role thấp hơn (VC-KT-013 Muc 7, chú thích ³). */
export async function verifyPublicationAction(publicationId: string) {
  const user = await requireRole("SUPERADMIN", "ADMIN");

  const publication = await db.publication.findUniqueOrThrow({ where: { id: publicationId } });
  if (user.role === "ADMIN" && user.organizationId !== publication.organizationId) {
    throw new Error("Bạn không có quyền xác minh công bố của tổ chức khác.");
  }

  await db.publication.update({
    where: { id: publicationId },
    data: { verificationStatus: "VERIFIED", verifiedById: user.id, verifiedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "VERIFY_PUBLICATION",
      entity: "Publication",
      entityId: publicationId,
    },
  });

  revalidatePath("/dashboard/publications");
}
