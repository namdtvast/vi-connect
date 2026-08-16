import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "VI CONNECT — Kết nối trí tuệ, Kiến tạo giá trị",
  description:
    "Nền tảng kết nối tri thức, công nghệ và nguồn lực đầu tư cho hệ sinh thái khoa học, công nghệ và đổi mới sáng tạo Việt Nam — vận hành trên Knowledge Graph với AI Matching giải thích được.",
};

const AI_CAPABILITIES = [
  {
    title: "AI Matching giải thích được",
    desc: "Mỗi đề xuất ghép nối chuyên gia – bài toán đều hiển thị rõ lý do và trọng số chấm điểm, không phải hộp đen thuật toán.",
    tag: "Đã có — Giai đoạn 1",
    tagTone: "live" as const,
    icon: (
      <path
        d="M12 4.5c-4.4 0-8.2 3-9.5 7.5 1.3 4.5 5.1 7.5 9.5 7.5s8.2-3 9.5-7.5C20.2 7.5 16.4 4.5 12 4.5Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
        strokeWidth="0"
        fill="currentColor"
      />
    ),
  },
  {
    title: "Semantic Search",
    desc: "Tìm theo ý nghĩa — chuyên gia, công nghệ, bài toán liên quan — thay vì chỉ khớp từ khóa như tra cứu thông thường.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: (
      <path
        d="M10.5 3a7.5 7.5 0 1 0 4.62 13.42l4.98 4.98 1.4-1.4-4.98-4.98A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        strokeWidth="0"
        fill="currentColor"
      />
    ),
  },
  {
    title: "AI Agent",
    desc: "Trợ lý cho chuyên gia, doanh nghiệp và người quản lý dự án — chủ động gợi ý thay vì chỉ chờ người dùng tự tra cứu.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: (
      <path
        d="M12 2 3 7v6c0 5 3.8 8.7 9 9 5.2-.3 9-4 9-9V7l-9-5Zm-3 8.5 2 2 4-4 1.4 1.4L11 15.3l-3.4-3.4L9 10.5Z"
        strokeWidth="0"
        fill="currentColor"
      />
    ),
  },
  {
    title: "Content Intelligence",
    desc: "Tự động phân loại tài liệu, trích xuất metadata từ công bố, sáng chế và kết quả nghiên cứu — không cần nhập tay từng trường.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: (
      <path
        d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM7 12h10v1.6H7V12Zm0 3.6h10v1.6H7v-1.6Zm0-7.2h5v1.6H7V8.4Z"
        strokeWidth="0"
        fill="currentColor"
      />
    ),
  },
];

const COMPARISON = [
  { old: "Dữ liệu tĩnh, cập nhật thủ công theo từng đợt", now: "Knowledge Graph sống, liên kết People – Assets – Opportunities" },
  { old: "Tìm theo từ khóa, dễ bỏ sót ngữ cảnh", now: "Semantic Search + AI Matching có giải thích lý do đề xuất" },
  { old: "Đăng tin rồi tự liên hệ, không ai bảo chứng", now: "Trung gian có bảo chứng: chuẩn hóa bài toán, thẩm định, huy động nhóm liên ngành" },
  { old: "Đo bằng số tài khoản, lượt truy cập", now: "Đo bằng hợp đồng đã ký, nguồn lực đã huy động, tác động đã ghi nhận" },
];

const STEPS = [
  {
    step: "01",
    label: "CONNECT",
    color: "var(--brand)",
    bg: "var(--brand-light)",
    title: "Hồ sơ chuyên gia & tổ chức",
    desc: "Số hóa, xác minh hồ sơ chuyên gia và tổ chức trên một Knowledge Graph dùng chung.",
  },
  {
    step: "02",
    label: "MATCH",
    color: "var(--cyan)",
    bg: "#e3f6fa",
    title: "Ngân hàng bài toán & ghép nối",
    desc: "Doanh nghiệp, địa phương đăng bài toán; AI Matching đề xuất chuyên gia và công nghệ phù hợp, luôn kèm giải thích.",
  },
  {
    step: "03",
    label: "MOBILIZE",
    color: "var(--accent)",
    bg: "var(--accent-light)",
    title: "Huy động nguồn lực",
    desc: "Kết nối chuyên gia, phòng thí nghiệm, tài trợ và đầu tư cần thiết để đưa bài toán thành dự án thật.",
  },
  {
    step: "04",
    label: "IMPACT",
    color: "var(--gold)",
    bg: "var(--gold-light)",
    title: "Đo lường tác động",
    desc: "Theo dõi đến khi hợp đồng được ký, nhiệm vụ nghiệm thu, công nghệ chuyển giao và hiệu quả đo lường được.",
  },
];

const AUDIENCES = [
  {
    title: "Chuyên gia & nhà khoa học",
    desc: "Số hóa hồ sơ năng lực, được đề xuất đúng bài toán phù hợp lĩnh vực, tham gia dự án hợp tác thực tế.",
    cta: "Đăng ký hồ sơ chuyên gia",
    href: "/register",
  },
  {
    title: "Doanh nghiệp",
    desc: "Đăng bài toán công nghệ cần giải, tiếp cận mạng lưới chuyên gia và công nghệ đã được xác minh trên toàn quốc.",
    cta: "Xem ngân hàng bài toán",
    href: "/dashboard/challenges",
  },
  {
    title: "Địa phương & sở, ban, ngành",
    desc: "Kết nối nhu cầu chuyển giao công nghệ của địa phương với nguồn lực khoa học trong mạng lưới.",
    cta: "Xem ngân hàng bài toán",
    href: "/dashboard/challenges",
  },
  {
    title: "Hội thành viên & tổ chức KH&CN",
    desc: "Quản trị hồ sơ tổ chức, phân quyền quản trị theo đơn vị, theo dõi hoạt động kết nối của thành viên.",
    cta: "Đăng nhập quản trị tổ chức",
    href: "/login",
  },
];

function RingMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 620"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M465 145 A210 210 0 1 0 465 455"
        stroke="var(--cyan)"
        strokeWidth="26"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="465" cy="145" r="11" fill="var(--gold)" />
      <circle cx="465" cy="455" r="11" fill="var(--accent)" />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted" aria-hidden="true">
      <path d="M12 4v13.2l4.6-4.6L18 14l-6 6-6-6 1.4-1.4 4.6 4.6V4h2Z" fill="currentColor" />
    </svg>
  );
}

export default function CampaignPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/campaign" className="flex items-center gap-2">
            <svg viewBox="0 0 40 40" className="w-7 h-7" aria-hidden="true">
              <path
                d="M27.3 8.5 A11 11 0 1 0 27.3 24.5"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="3.2"
                strokeLinecap="round"
                transform="translate(3 3.5) scale(0.85)"
              />
              <circle cx="26.5" cy="10.7" r="1.4" fill="var(--gold)" transform="translate(3 3.5) scale(0.85)" />
              <circle cx="26.5" cy="22.3" r="1.4" fill="var(--accent)" transform="translate(3 3.5) scale(0.85)" />
              <path
                d="M9 12 L15.5 22 L21 12"
                fill="none"
                stroke="var(--red)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(3 3.5) scale(0.85)"
              />
            </svg>
            <span className="font-semibold text-brand-dark tracking-tight">
              VI CONNECT
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#khac-biet" className="hover:text-foreground">Khác biệt</a>
            <a href="#cach-hoat-dong" className="hover:text-foreground">Cách hoạt động</a>
            <a href="#danh-cho-ai" className="hover:text-foreground">Dành cho ai</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-foreground hidden sm:inline">
              Đăng nhập
            </Link>
            <Link href="/register">
              <Button size="sm">Tham gia mạng lưới</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-dark to-brand text-white">
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <RingMotif className="pointer-events-none hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2 w-72 h-72 opacity-60 -z-10" />
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-white/70 border border-white/20 rounded-full px-3 py-1">
            Nền tảng kết nối hệ sinh thái khoa học, công nghệ & đổi mới sáng tạo Việt Nam
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Kết nối trí tuệ.{" "}
            <span style={{ color: "var(--gold)" }}>Kiến tạo giá trị.</span>
          </h1>
          <p className="mt-5 text-white/85 max-w-xl text-lg">
            VI CONNECT không phải một cơ sở dữ liệu tĩnh hay sàn đăng tin. Đây là nền
            tảng có trí tuệ, vận hành trên một Knowledge Graph sống, kết nối và kích
            hoạt nguồn lực theo bốn bước Connect – Match – Mobilize – Impact, với AI
            Matching giải thích được xuyên suốt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-brand-dark hover:bg-white/90 border-transparent"
              >
                Tham gia mạng lưới chuyên gia
              </Button>
            </Link>
            <Link href="/dashboard/challenges">
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/40"
              >
                Xem ngân hàng bài toán
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Miễn phí tham gia · Hồ sơ được xác minh · Ghép nối luôn có giải thích
          </p>
        </div>
      </section>

      {/* Scale strip */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 md:-mt-14 w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "152", label: "Hội, hiệp hội thành viên trong mạng lưới mục tiêu" },
            { value: "624", label: "Tổ chức KH&CN trực thuộc mạng lưới mục tiêu" },
            { value: "3 trụ cột", label: "People · Assets · Opportunities trên một Knowledge Graph" },
            { value: "Giai đoạn 1", label: "Đang xây dựng thật — không dữ liệu mock" },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="text-center py-6">
                <div className="text-2xl md:text-3xl font-bold text-brand-dark">
                  {s.value}
                </div>
                <div className="text-xs md:text-sm text-muted mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Khác biệt: Knowledge Graph + AI */}
      <section id="khac-biet" className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand uppercase tracking-wide">
            Sự khác biệt
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark">
            Không phải dữ liệu chết. Là một nền tảng có trí tuệ.
          </h2>
          <p className="mt-3 text-muted leading-relaxed">
            Danh bạ chuyên gia hay sàn đăng tin công nghệ thông thường chỉ lưu trữ
            thông tin tĩnh, cập nhật thủ công, tìm bằng từ khóa. VI CONNECT xây dựng
            quanh một Knowledge Graph sống — liên kết ba trụ cột People, Assets,
            Opportunities — với một lớp trí tuệ nhân tạo xuyên suốt để chủ động hiểu,
            ghép nối và đề xuất, thay vì chỉ chờ người dùng tự tra cứu.
          </p>
        </div>

        {/* Knowledge Graph diagram */}
        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 md:p-10">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "People", desc: "Chuyên gia, tổ chức", color: "var(--cyan)", bg: "#e3f6fa" },
              { label: "Assets", desc: "Công nghệ, sáng chế, kết quả nghiên cứu", color: "var(--accent)", bg: "var(--accent-light)" },
              { label: "Opportunities", desc: "Bài toán, tài trợ, đầu tư", color: "var(--gold)", bg: "var(--gold-light)" },
            ].map((n) => (
              <div
                key={n.label}
                className="rounded-xl p-4 text-center border border-border"
                style={{ background: n.bg }}
              >
                <div className="font-semibold" style={{ color: n.color }}>
                  {n.label}
                </div>
                <div className="text-xs text-muted mt-1">{n.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center my-3">
            <DownArrow />
          </div>
          <div className="mx-auto max-w-sm text-center rounded-xl border-2 py-4 px-6" style={{ borderColor: "var(--brand)", background: "var(--brand-light)" }}>
            <div className="font-bold text-brand-dark">AI Matching Engine</div>
            <div className="text-xs text-muted mt-1">Semantic Search · Explainable Ranking · AI Agent</div>
          </div>
          <div className="flex justify-center my-3">
            <DownArrow />
          </div>
          <div className="mx-auto max-w-sm text-center rounded-xl border border-border bg-background py-4 px-6">
            <div className="font-semibold text-brand-dark">Project · Collaboration</div>
            <div className="text-xs text-muted mt-1">Hợp đồng, nguồn lực huy động, tác động thực</div>
          </div>
        </div>

        {/* AI capability chips */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AI_CAPABILITIES.map((c) => (
            <Card key={c.title}>
              <CardContent className="py-6">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      {c.icon}
                    </svg>
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 whitespace-nowrap"
                    style={
                      c.tagTone === "live"
                        ? { background: "var(--accent-light)", color: "var(--accent-dark)" }
                        : { background: "var(--background)", color: "var(--muted)" }
                    }
                  >
                    {c.tag}
                  </span>
                </div>
                <div className="font-semibold text-brand-dark mt-4">{c.title}</div>
                <p className="text-sm text-muted mt-2 leading-relaxed">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-10 rounded-2xl border border-border overflow-hidden">
          <div className="grid sm:grid-cols-2">
            <div className="p-6 bg-background">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Cách làm cũ
              </div>
              <ul className="mt-3 space-y-3">
                {COMPARISON.map((c) => (
                  <li key={c.old} className="text-sm text-muted leading-relaxed">
                    {c.old}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6" style={{ background: "var(--brand-light)" }}>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">
                VI CONNECT
              </div>
              <ul className="mt-3 space-y-3">
                {COMPARISON.map((c) => (
                  <li key={c.now} className="text-sm text-brand-dark leading-relaxed font-medium">
                    {c.now}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cach-hoat-dong" className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand uppercase tracking-wide">
            Cách VI CONNECT vận hành
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark">
            Từ hồ sơ đến tác động, theo bốn bước rõ ràng
          </h2>
        </div>
        <div className="mt-10 grid md:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div key={s.step} className="relative">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: s.bg, color: s.color }}
              >
                {s.step}
              </div>
              <div
                className="text-xs font-semibold mt-3 tracking-wide"
                style={{ color: s.color }}
              >
                {s.label}
              </div>
              <div className="font-semibold mt-1 text-brand-dark">{s.title}</div>
              <p className="text-sm text-muted mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section id="danh-cho-ai" className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand uppercase tracking-wide">
            Dành cho ai
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark">
            Bốn nhóm đối tượng, một mạng lưới chung
          </h2>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          {AUDIENCES.map((a) => (
            <Card key={a.title}>
              <CardContent className="py-6 flex flex-col h-full">
                <div className="font-semibold text-brand-dark text-lg">{a.title}</div>
                <p className="text-sm text-muted mt-2 leading-relaxed flex-1">{a.desc}</p>
                <Link
                  href={a.href}
                  className="text-sm font-medium text-brand hover:text-brand-dark mt-4 inline-flex items-center gap-1"
                >
                  {a.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Positioning banner */}
      <section className="mt-20 bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-2xl md:text-3xl font-bold leading-snug">
            &ldquo;Nền tảng số kết nối và kích hoạt nguồn lực khoa học, công nghệ
            và đổi mới sáng tạo.&rdquo;
          </p>
          <p className="mt-4 text-white/70">
            Không phải cơ sở dữ liệu. Không phải sàn đăng tin. Là tầng kết nối có
            trí tuệ, với AI Matching giải thích được xuyên suốt.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">
            Sẵn sàng kết nối với hệ sinh thái khoa học công nghệ Việt Nam?
          </h2>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            Tham gia VI CONNECT — miễn phí đăng ký, hồ sơ được xác minh, ghép nối
            luôn có giải thích.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Tham gia mạng lưới chuyên gia</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Đăng nhập tổ chức / doanh nghiệp
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        VI CONNECT — Giai đoạn 1 (thí điểm). Nền tảng kết nối hệ sinh thái khoa học,
        công nghệ & đổi mới sáng tạo Việt Nam.
      </footer>
    </div>
  );
}
