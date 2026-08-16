import Link from "next/link";
import { db } from "@/lib/db";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Trang chủ hiển thị số liệu sống từ PostgreSQL, không được truy vấn DB khi build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [orgCount, expertCount, challengeCount, projectCount] =
    await Promise.all([
      db.organization.count(),
      db.expertProfile.count(),
      db.challenge.count({ where: { status: "PUBLISHED" } }),
      db.project.count(),
    ]);

  const stats = [
    { label: "Tổ chức tham gia", value: orgCount },
    { label: "Hồ sơ chuyên gia", value: expertCount },
    { label: "Bài toán đang mở", value: challengeCount },
    { label: "Dự án hợp tác", value: projectCount },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <DemoBanner />
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-brand">VI CONNECT</div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-foreground">
              Đăng nhập
            </Link>
            <Link href="/register">
              <Button size="sm">Đăng ký hồ sơ chuyên gia</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-b from-brand-dark to-brand text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="uppercase tracking-wide text-sm text-white/70 mb-3">
            Viện Hàn lâm Khoa học và Công nghệ Việt Nam — Trung tâm Đổi mới sáng tạo công nghệ cao
          </p>
          <h1 className="text-4xl font-bold max-w-2xl leading-tight">
            Nền tảng kết nối tri thức, công nghệ và nguồn lực đầu tư
          </h1>
          <p className="mt-4 text-white/80 max-w-xl">
            &ldquo;Kết nối trí tuệ - Kiến tạo giá trị&rdquo;. VI CONNECT vận hành theo bốn bước Connect
            (Kết nối) - Match (Ghép nối) - Mobilize (Huy động nguồn lực) - Impact
            (Tạo tác động).
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-white text-brand-dark hover:bg-white/90">
                Tham gia mạng lưới chuyên gia
              </Button>
            </Link>
            <Link href="/dashboard/challenges">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 border border-white/40">
                Xem ngân hàng bài toán
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-10 pb-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-brand">{s.value}</div>
                <div className="text-sm text-muted mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-10">
          {[
            {
              step: "01. CONNECT",
              title: "Hồ sơ chuyên gia & tổ chức",
              desc: "Số hóa, xác minh hồ sơ chuyên gia và hội thành viên trên toàn hệ thống VAST.",
            },
            {
              step: "02. MATCH",
              title: "Ngân hàng bài toán & ghép nối",
              desc: "Doanh nghiệp, địa phương đăng bài toán; hệ thống đề xuất chuyên gia/công nghệ phù hợp, có giải thích.",
            },
            {
              step: "03. EXECUTE",
              title: "Dự án & hợp đồng",
              desc: "Chuyển kết quả ghép nối thành dự án có mốc, sản phẩm bàn giao và hợp đồng theo dõi được.",
            },
            {
              step: "04. IMPACT",
              title: "Đo lường tác động",
              desc: "Theo dõi KPI Connect – Match – Mobilize – Impact theo thời gian thực.",
            },
          ].map((f) => (
            <Card key={f.step}>
              <CardContent>
                <div className="text-xs font-semibold text-accent">{f.step}</div>
                <div className="font-semibold mt-1">{f.title}</div>
                <p className="text-sm text-muted mt-2">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        VI CONNECT — Giai đoạn 1 (thí điểm). Trung tâm Đổi mới sáng tạo công nghệ cao (HTIC) — VAST.
      </footer>
    </div>
  );
}
