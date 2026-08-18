import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/uploads";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

// Hồ sơ chuyên gia hiển thị toàn nền tảng cho user đã đăng nhập (trang danh
// sách/chi tiết không giới hạn theo tổ chức, trừ khi viewer là HOI_ADMIN lọc
// theo tổ chức mình) — ảnh đại diện dùng chung mức truy cập với hồ sơ.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const expert = await db.expertProfile.findUnique({ where: { id } });
  if (!expert || !expert.avatarPath) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readUploadedFile(expert.avatarPath);
  const ext = expert.avatarPath.slice(expert.avatarPath.lastIndexOf("."));
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
