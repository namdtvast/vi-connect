import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  Check,
  FlaskConical,
  Handshake,
  Landmark,
  Layers,
  Lightbulb,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp, Reveal, RotatingWords, StickyCTA } from "@/components/campaign/interactive";

export const metadata = {
  title: "VI CONNECT — Kết nối trí tuệ, Kiến tạo giá trị",
  description:
    "Nền tảng kết nối tri thức, công nghệ và nguồn lực đầu tư cho hệ sinh thái khoa học, công nghệ và đổi mới sáng tạo Việt Nam — vận hành trên Knowledge Graph với AI Matching giải thích được.",
};

const KICKER_WORDS = [
  "KHÔNG PHẢI CƠ SỞ DỮ LIỆU TĨNH",
  "KHÔNG PHẢI SÀN ĐĂNG TIN",
  "LÀ NỀN TẢNG CÓ TRÍ TUỆ, CÓ AI MATCHING",
];

const AI_CAPABILITIES = [
  {
    title: "AI Matching giải thích được",
    desc: "Mỗi đề xuất ghép nối chuyên gia – bài toán đều hiển thị rõ lý do và trọng số chấm điểm, không phải hộp đen thuật toán.",
    tag: "Đã có — Giai đoạn 1",
    tagTone: "live" as const,
    icon: Sparkles,
  },
  {
    title: "Semantic Search",
    desc: "Tìm theo ý nghĩa — chuyên gia, công nghệ, bài toán liên quan — thay vì chỉ khớp từ khóa như tra cứu thông thường.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: Search,
  },
  {
    title: "AI Agent",
    desc: "Trợ lý cho chuyên gia, doanh nghiệp và người quản lý dự án — chủ động gợi ý thay vì chỉ chờ người dùng tự tra cứu.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: Bot,
  },
  {
    title: "Content Intelligence",
    desc: "Tự động phân loại tài liệu, trích xuất metadata từ công bố, sáng chế và kết quả nghiên cứu — không cần nhập tay từng trường.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: Layers,
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
    icon: Users,
    title: "Chuyên gia & nhà khoa học",
    desc: "Số hóa hồ sơ năng lực, được đề xuất đúng bài toán phù hợp lĩnh vực, tham gia dự án hợp tác thực tế.",
    cta: "Đăng ký hồ sơ chuyên gia",
    href: "/register",
  },
  {
    icon: Building2,
    title: "Doanh nghiệp",
    desc: "Đăng bài toán công nghệ cần giải, tiếp cận mạng lưới chuyên gia và công nghệ đã được xác minh trên toàn quốc.",
    cta: "Xem ngân hàng bài toán",
    href: "/dashboard/challenges",
  },
  {
    icon: MapPin,
    title: "Địa phương & sở, ban, ngành",
    desc: "Kết nối nhu cầu chuyển giao công nghệ của địa phương với nguồn lực khoa học trong mạng lưới.",
    cta: "Xem ngân hàng bài toán",
    href: "/dashboard/challenges",
  },
  {
    icon: Landmark,
    title: "Hội thành viên & tổ chức KH&CN",
    desc: "Quản trị hồ sơ tổ chức, phân quyền quản trị theo đơn vị, theo dõi hoạt động kết nối của thành viên.",
    cta: "Đăng nhập quản trị tổ chức",
    href: "/login",
  },
];

const KG_NODES = [
  { icon: Users, label: "People", desc: "Chuyên gia, tổ chức", color: "var(--cyan)", bg: "#e3f6fa" },
  { icon: FlaskConical, label: "Assets", desc: "Công nghệ, sáng chế, kết quả nghiên cứu", color: "var(--accent)", bg: "var(--accent-light)" },
  { icon: Lightbulb, label: "Opportunities", desc: "Bài toán, tài trợ, đầu tư", color: "var(--gold)", bg: "var(--gold-light)" },
];

function RingMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 620 620" className={className} fill="none" aria-hidden="true">
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

const cardHover =
  "transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md";

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
            <span className="font-semibold text-brand-dark tracking-tight">VI CONNECT</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#khac-biet" className="hover:text-foreground transition-colors">Khác biệt</a>
            <a href="#cach-hoat-dong" className="hover:text-foreground transition-colors">Cách hoạt động</a>
            <a href="#danh-cho-ai" className="hover:text-foreground transition-colors">Dành cho ai</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-foreground hidden sm:inline transition-colors">
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
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-36">
          <RingMotif className="pointer-events-none hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2 w-72 h-72 opacity-60 -z-10" />

          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white/80 border border-white/25 rounded-full px-3 py-1.5 min-h-[30px]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--gold)" }} />
            <RotatingWords words={KICKER_WORDS} />
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-bold max-w-3xl leading-[1.02] tracking-tight">
            Kết nối trí tuệ.{" "}
            <span style={{ color: "var(--gold)" }}>Kiến tạo giá trị.</span>
          </h1>
          <p className="mt-6 text-white/85 max-w-xl text-lg leading-relaxed">
            VI CONNECT là nền tảng có trí tuệ, vận hành trên một Knowledge Graph sống,
            kết nối và kích hoạt nguồn lực theo bốn bước Connect – Match – Mobilize –
            Impact, với AI Matching giải thích được xuyên suốt.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="group bg-white text-brand-dark hover:bg-white/90 border-transparent shadow-[0_0_0_0_rgba(247,201,72,0)] hover:shadow-[0_0_24px_2px_rgba(247,201,72,0.35)] transition-shadow"
              >
                Tham gia mạng lưới chuyên gia
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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

          <div id="hero-end" />
        </div>
      </section>

      <StickyCTA sentinelId="hero-end" />

      {/* Scale strip */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 md:-mt-14 w-full relative z-10">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={`shadow-sm ${cardHover}`}>
              <CardContent className="text-center py-6">
                <div className="text-2xl md:text-3xl font-bold text-brand-dark">
                  <CountUp value={152} />
                </div>
                <div className="text-xs md:text-sm text-muted mt-1">
                  Hội, hiệp hội thành viên trong mạng lưới mục tiêu
                </div>
              </CardContent>
            </Card>
            <Card className={`shadow-sm ${cardHover}`}>
              <CardContent className="text-center py-6">
                <div className="text-2xl md:text-3xl font-bold text-brand-dark">
                  <CountUp value={624} />
                </div>
                <div className="text-xs md:text-sm text-muted mt-1">
                  Tổ chức KH&CN trực thuộc mạng lưới mục tiêu
                </div>
              </CardContent>
            </Card>
            <Card className={`shadow-sm ${cardHover}`}>
              <CardContent className="text-center py-6">
                <div className="text-2xl md:text-3xl font-bold text-brand-dark">3 trụ cột</div>
                <div className="text-xs md:text-sm text-muted mt-1">
                  People · Assets · Opportunities trên một Knowledge Graph
                </div>
              </CardContent>
            </Card>
            <Card className={`shadow-sm ${cardHover}`}>
              <CardContent className="text-center py-6">
                <div className="text-2xl md:text-3xl font-bold text-brand-dark">Giai đoạn 1</div>
                <div className="text-xs md:text-sm text-muted mt-1">
                  Đang xây dựng thật — không dữ liệu mock
                </div>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </section>

      {/* Khác biệt: Knowledge Graph + AI */}
      <section id="khac-biet" className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand uppercase tracking-wide">Sự khác biệt</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">
              Không phải dữ liệu chết.
              <br />
              Là một nền tảng có trí tuệ.
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Danh bạ chuyên gia hay sàn đăng tin công nghệ thông thường chỉ lưu trữ
              thông tin tĩnh, cập nhật thủ công, tìm bằng từ khóa. VI CONNECT xây dựng
              quanh một Knowledge Graph sống — liên kết ba trụ cột People, Assets,
              Opportunities — với một lớp trí tuệ nhân tạo xuyên suốt để chủ động hiểu,
              ghép nối và đề xuất, thay vì chỉ chờ người dùng tự tra cứu.
            </p>
          </div>
        </Reveal>

        {/* Knowledge Graph diagram */}
        <Reveal delay={100}>
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 md:p-10">
            <div className="grid sm:grid-cols-3 gap-4">
              {KG_NODES.map((n) => (
                <div
                  key={n.label}
                  className="rounded-xl p-4 text-center border border-border"
                  style={{ background: n.bg }}
                >
                  <div
                    className="w-9 h-9 mx-auto rounded-full flex items-center justify-center mb-2"
                    style={{ background: "rgba(255,255,255,0.6)", color: n.color }}
                  >
                    <n.icon className="w-4 h-4" />
                  </div>
                  <div className="font-semibold" style={{ color: n.color }}>
                    {n.label}
                  </div>
                  <div className="text-xs text-muted mt-1">{n.desc}</div>
                </div>
              ))}
            </div>

            <svg viewBox="0 0 300 56" preserveAspectRatio="none" className="hidden md:block w-full h-10 text-brand/25" aria-hidden="true">
              <path d="M50 0 L150 56" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M150 0 L150 56" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M250 0 L150 56" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <div className="flex justify-center md:hidden my-3 text-muted">
              <ArrowRight className="w-5 h-5 rotate-90" aria-hidden="true" />
            </div>

            <div
              className="relative mx-auto max-w-sm text-center rounded-2xl border-2 py-5 px-6"
              style={{ borderColor: "var(--brand)", background: "var(--brand-light)" }}
            >
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full motion-safe:animate-pulse" style={{ background: "var(--accent)" }} aria-hidden="true" />
              <BrainCircuit className="w-6 h-6 mx-auto mb-1.5 text-brand" aria-hidden="true" />
              <div className="font-bold text-brand-dark">AI Matching Engine</div>
              <div className="text-xs text-muted mt-1">Semantic Search · Explainable Ranking · AI Agent</div>
            </div>

            <div className="flex justify-center my-3 text-muted">
              <ArrowRight className="w-5 h-5 rotate-90" aria-hidden="true" />
            </div>

            <div className="mx-auto max-w-sm text-center rounded-2xl border border-border bg-background py-5 px-6">
              <Handshake className="w-6 h-6 mx-auto mb-1.5 text-brand-dark" aria-hidden="true" />
              <div className="font-semibold text-brand-dark">Project · Collaboration</div>
              <div className="text-xs text-muted mt-1">Hợp đồng, nguồn lực huy động, tác động thực</div>
            </div>
          </div>
        </Reveal>

        {/* AI capability chips */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AI_CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <Card className={`h-full ${cardHover}`}>
                <CardContent className="py-6">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                    >
                      <c.icon className="w-5 h-5" />
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
            </Reveal>
          ))}
        </div>

        {/* Comparison */}
        <Reveal delay={80}>
          <div className="mt-10 rounded-2xl border border-border overflow-hidden">
            <div className="grid sm:grid-cols-2">
              <div className="p-6 bg-background">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Cách làm cũ
                </div>
                <ul className="mt-4 space-y-3.5">
                  {COMPARISON.map((c) => (
                    <li key={c.old} className="flex items-start gap-2.5 text-sm text-muted leading-relaxed">
                      <X className="w-4 h-4 mt-0.5 shrink-0 text-muted/70" aria-hidden="true" />
                      {c.old}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 border-t sm:border-t-0 sm:border-l-2" style={{ background: "var(--brand-light)", borderColor: "var(--brand)" }}>
                <div className="text-xs font-semibold uppercase tracking-wide text-brand">
                  VI CONNECT
                </div>
                <ul className="mt-4 space-y-3.5">
                  {COMPARISON.map((c) => (
                    <li key={c.now} className="flex items-start gap-2.5 text-sm text-brand-dark leading-relaxed font-medium">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                      {c.now}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Mid-page CTA */}
      <section className="mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div
              className="rounded-2xl px-6 py-10 md:py-12 md:px-12 text-center bg-gradient-to-br from-brand to-brand-dark text-white"
            >
              <h3 className="text-2xl md:text-3xl font-bold max-w-xl mx-auto leading-snug">
                Mạng lưới đang được xây dựng từng ngày. Hồ sơ của bạn có thể là mảnh ghép tiếp theo.
              </h3>
              <div className="mt-7">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group bg-white text-brand-dark hover:bg-white/90 border-transparent"
                  >
                    Tham gia ngay
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="cach-hoat-dong" className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand uppercase tracking-wide">
              Cách VI CONNECT vận hành
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark">
              Từ hồ sơ đến tác động, theo bốn bước rõ ràng
            </h2>
          </div>
        </Reveal>
        <div className="relative mt-10 grid md:grid-cols-4 gap-5">
          <div className="hidden md:block absolute top-[22px] left-[12.5%] right-[12.5%] h-px bg-border" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 80} className="relative">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm relative z-10 ring-4 ring-background"
                style={{ background: s.bg, color: s.color }}
              >
                {s.step}
              </div>
              <div className="text-xs font-semibold mt-3 tracking-wide" style={{ color: s.color }}>
                {s.label}
              </div>
              <div className="font-semibold mt-1 text-brand-dark">{s.title}</div>
              <p className="text-sm text-muted mt-2 leading-relaxed">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section id="danh-cho-ai" className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand uppercase tracking-wide">Dành cho ai</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark">
              Bốn nhóm đối tượng, một mạng lưới chung
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 60}>
              <Card className={`h-full ${cardHover}`}>
                <CardContent className="py-6 flex flex-col h-full">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                  >
                    <a.icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-brand-dark text-lg">{a.title}</div>
                  <p className="text-sm text-muted mt-2 leading-relaxed flex-1">{a.desc}</p>
                  <Link
                    href={a.href}
                    className="group text-sm font-medium text-brand hover:text-brand-dark mt-4 inline-flex items-center gap-1"
                  >
                    {a.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Positioning banner */}
      <section className="mt-20 bg-brand-dark text-white">
        <Reveal>
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
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="bg-background">
        <Reveal>
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
                <Button size="lg" className="group">
                  Tham gia mạng lưới chuyên gia
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Đăng nhập tổ chức / doanh nghiệp
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        VI CONNECT — Giai đoạn 1 (thí điểm). Nền tảng kết nối hệ sinh thái khoa học,
        công nghệ & đổi mới sáng tạo Việt Nam.
      </footer>
    </div>
  );
}
