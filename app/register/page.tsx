import { db } from "@/lib/db";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";

// Danh sách tổ chức được đọc từ PostgreSQL tại thời điểm request.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const organizations = await db.organization.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="font-semibold text-brand text-lg">VI CONNECT</div>
            <p className="text-sm text-muted mt-1">Đăng ký hồ sơ chuyên gia</p>
          </div>
          <RegisterForm organizations={organizations} />
        </CardContent>
      </Card>
    </div>
  );
}
