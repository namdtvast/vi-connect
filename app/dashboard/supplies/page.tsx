import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/lib/taxonomy";
import { CreateSupplyForm } from "@/components/matching/create-supply-form";

const TYPE_LABEL: Record<string, string> = {
  TECHNOLOGY: "Công nghệ",
  SOLUTION: "Giải pháp",
  EXPERT_SERVICE: "Dịch vụ chuyên gia",
  PATENT: "Sáng chế",
};

export default async function SuppliesPage() {
  const session = await auth();
  const canPost = session?.user.role === "SUPERADMIN" || session?.user.role === "ADMIN";

  const supplies = await db.supply.findMany({
    where: { status: "PUBLISHED" },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nguồn cung công nghệ (cấu phần 02)</h1>
        <p className="text-sm text-muted mt-1">
          Công nghệ, giải pháp, sáng chế do hội thành viên / tổ chức KH&amp;CN đăng để chào
          kết nối.
        </p>
      </div>

      {canPost && (
        <Card>
          <CardHeader>
            <CardTitle>Đăng công nghệ / giải pháp mới</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateSupplyForm />
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {supplies.map((s) => (
          <Card key={s.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{s.title}</div>
                <Badge variant="brand">{TYPE_LABEL[s.type]}</Badge>
              </div>
              <div className="text-xs text-muted mt-1">{s.organization?.name}</div>
              <p className="text-sm text-muted mt-2 line-clamp-2">{s.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.fields.map((f) => (
                  <Badge key={f}>{fieldLabel(f)}</Badge>
                ))}
                {s.trl && <Badge variant="success">TRL {s.trl}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
        {supplies.length === 0 && (
          <p className="text-sm text-muted">Chưa có công nghệ/giải pháp nào.</p>
        )}
      </div>
    </div>
  );
}
