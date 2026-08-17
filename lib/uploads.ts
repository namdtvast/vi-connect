import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Lưu ngoài public/ để bắt buộc đi qua route handler có kiểm tra quyền
// (VC-KT-002 Mục 8: DRAFT chỉ ORGANIZATION, PUBLISHED thì PLATFORM*) — không
// phục vụ tệp tĩnh không qua xác thực.
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export type SavedFile = { path: string; name: string };

/** Lưu file tải lên đĩa, trả về đường dẫn tương đối (lưu vào DB) + tên gốc. */
export async function saveUploadedFile(file: File, folder: string): Promise<SavedFile> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Tệp đính kèm vượt quá 10MB.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      "Định dạng tệp không được hỗ trợ — chỉ nhận PDF, Word, Excel, PowerPoint hoặc ảnh."
    );
  }

  const ext = path.extname(file.name);
  const relativePath = path.posix.join(folder, `${randomUUID()}${ext}`);
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_ROOT, folder, path.basename(relativePath)), buffer);

  return { path: relativePath, name: file.name };
}

export async function readUploadedFile(relativePath: string): Promise<Buffer> {
  return readFile(path.join(UPLOAD_ROOT, relativePath));
}
