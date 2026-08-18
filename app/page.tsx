import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  Building2,
  Check,
  Clock,
  FileText,
  FlaskConical,
  Gem,
  Handshake,
  Landmark,
  Layers,
  LineChart,
  Lightbulb,
  MessageCircle,
  Network,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp, Reveal, RotatingWords, StickyCTA } from "@/components/campaign/interactive";

export const metadata = {
  title: "VI CONNECT — Kết nối tri thức, Kiến tạo giá trị",
  description:
    "Nền tảng kết nối tri thức, công nghệ và nguồn lực đầu tư cho hệ sinh thái khoa học, công nghệ và đổi mới sáng tạo Việt Nam — vận hành trên Knowledge Graph với AI Matching giải thích được.",
};

const KICKER_WORDS = [
  "KHÔNG PHẢI CƠ SỞ DỮ LIỆU TĨNH",
  "KHÔNG PHẢI SÀN ĐĂNG TIN",
  "LÀ NỀN TẢNG CÓ TRÍ TUỆ, CÓ AI MATCHING",
];

const DIFFERENTIATORS = [
  {
    title: "Không phải danh bạ chuyên gia",
    desc: "Không chỉ trả lời \"ai giỏi lĩnh vực này\" — mà tìm đúng tổ hợp người, tổ chức, công nghệ và nguồn lực cần kết hợp để giải một bài toán.",
    tag: "Đã có",
    tagTone: "live" as const,
    icon: Layers,
  },
  {
    title: "Không phải sàn đăng tin",
    desc: "Không dừng ở việc giới thiệu hai bên làm quen. Theo bài toán tới tận hợp đồng, mốc triển khai và nghiệm thu, không phải tự liên hệ rồi mất hút.",
    tag: "Đã có",
    tagTone: "live" as const,
    icon: Handshake,
  },
  {
    title: "AI Matching giải thích được",
    desc: "Mỗi đề xuất ghép nối chuyên gia – bài toán đều hiển thị rõ lý do và trọng số chấm điểm, không phải hộp đen thuật toán.",
    tag: "Đã có",
    tagTone: "live" as const,
    icon: Sparkles,
  },
  {
    title: "Hồ sơ có xác minh",
    desc: "Hồ sơ được tổ chức đầu mối xác minh trước khi dùng cho ghép nối — không chỉ dựa trên thông tin tự khai.",
    tag: "Đã có",
    tagTone: "live" as const,
    icon: BadgeCheck,
  },
  {
    title: "AI hình thành đội ngũ liên ngành",
    desc: "Không chỉ tìm một chuyên gia — hướng tới đề xuất cả tổ hợp: chuyên gia, tổ chức chủ trì, công nghệ và nguồn tài trợ phù hợp cho cùng một bài toán.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: Users,
  },
  {
    title: "AI Copilot hội thoại tự nhiên",
    desc: "Trợ lý bằng ngôn ngữ tự nhiên cho mọi tác vụ trên nền tảng — thay vì phải tự mò từng phân hệ.",
    tag: "Định hướng phát triển",
    tagTone: "roadmap" as const,
    icon: MessageCircle,
  },
];

const COMPARISON = [
  { old: "Dữ liệu tĩnh, cập nhật thủ công theo từng đợt", now: "Knowledge Graph sống, liên kết People – Assets – Opportunities" },
  { old: "Tìm theo từ khóa, dễ bỏ sót ngữ cảnh", now: "AI Matching có giải thích lý do đề xuất, không phải hộp đen" },
  { old: "Đăng tin rồi tự liên hệ, không ai bảo chứng", now: "Trung gian có bảo chứng: chuẩn hóa bài toán, thẩm định, đi tới tận hợp đồng và nghiệm thu" },
  { old: "Đo bằng số tài khoản, lượt truy cập", now: "Đo bằng hợp đồng đã ký, nguồn lực đã huy động, tác động đã ghi nhận" },
];

const STEPS = [
  {
    step: "01",
    label: "CONNECT",
    color: "var(--brand)",
    bg: "var(--brand-light)",
    title: "Bài toán thực tiễn & hồ sơ năng lực",
    desc: "Doanh nghiệp, địa phương đưa lên một bài toán thực tế — chuẩn hóa mục tiêu, yêu cầu, sản phẩm đầu ra. Chuyên gia, tổ chức số hóa và xác minh hồ sơ năng lực trên cùng một Knowledge Graph.",
  },
  {
    step: "02",
    label: "MATCH",
    color: "var(--cyan)",
    bg: "#e3f6fa",
    title: "AI Matching & thẩm định",
    desc: "AI phân tích bài toán, đề xuất chuyên gia và công nghệ phù hợp kèm giải thích rõ lý do. Con người thẩm định và quyết định — AI hỗ trợ, không thay thế.",
  },
  {
    step: "03",
    label: "MOBILIZE",
    color: "var(--accent)",
    bg: "var(--accent-light)",
    title: "Huy động nguồn lực",
    desc: "Kết nối chuyên gia, phòng thí nghiệm, tài trợ và đầu tư cần thiết để đưa phương án đã thẩm định thành dự án thật.",
  },
  {
    step: "04",
    label: "EXECUTE",
    color: "var(--red)",
    bg: "var(--red-light)",
    title: "Dự án, hợp đồng & triển khai",
    desc: "Chuyển kết quả huy động thành dự án có mốc, sản phẩm bàn giao và hợp đồng theo dõi được đến khi nghiệm thu.",
  },
  {
    step: "05",
    label: "IMPACT",
    color: "var(--gold)",
    bg: "var(--gold-light)",
    title: "Chuyển giao & đo lường tác động",
    desc: "Theo dõi công nghệ chuyển giao, nhiệm vụ nghiệm thu và hiệu quả kinh tế - xã hội — kết quả này làm giàu Knowledge Graph cho những bài toán tiếp theo.",
  },
];

const AUDIENCES = [
  {
    icon: Users,
    title: "Nhà khoa học & Chuyên gia",
    desc: "VI CONNECT giúp nhà khoa học và chuyên gia xây dựng hồ sơ năng lực số, kết nối với các bài toán, nhiệm vụ, dự án, tổ chức và đối tác phù hợp thông qua AI Matching. Nền tảng đồng thời ghi nhận quá trình tham gia, kết quả thực hiện và đóng góp chuyên môn để hình thành hồ sơ năng lực có minh chứng, tăng cơ hội hợp tác, nghiên cứu, tư vấn và chuyển giao công nghệ.",
    cta: "Đăng ký hồ sơ chuyên gia",
    href: "/register",
  },
  {
    icon: FlaskConical,
    title: "Tổ chức KH&CN & Doanh nghiệp KH&CN",
    desc: "Các viện, trung tâm, trường/PTN, tổ chức nghiên cứu, doanh nghiệp KH&CN cung cấp chuyên gia – công nghệ – thiết bị – phòng thí nghiệm – giải pháp – sản phẩm KH&CN.",
    cta: "Đăng nhập quản trị tổ chức",
    href: "/login",
  },
  {
    icon: Building2,
    title: "Cơ quan quản lý & Đơn vị đặt bài toán",
    desc: "Bộ, ngành, địa phương, cơ quan ngoại giao, doanh nghiệp và các tổ chức có nhu cầu đưa bài toán thực tế lên VI CONNECT để tìm chuyên gia, công nghệ, giải pháp và đối tác phù hợp.",
    cta: "Đăng bài toán của bạn",
    href: "/dashboard/challenges",
  },
  {
    icon: Landmark,
    title: "Quỹ, Nhà tài trợ & Nhà đầu tư",
    desc: "VI CONNECT tập hợp và chuẩn hóa các bài toán, nhiệm vụ, công nghệ, dự án và nhu cầu vốn, đồng thời sử dụng AI Matching để kết nối với quỹ, nhà tài trợ và nhà đầu tư phù hợp. Nền tảng hỗ trợ đánh giá hồ sơ, theo dõi tiến độ, kết quả và tác động, giúp việc tài trợ và đầu tư minh bạch, có căn cứ và dễ ra quyết định hơn.",
    tag: "Định hướng phát triển",
    cta: "Xem cơ hội tài trợ & đầu tư",
    href: "/dashboard/challenges",
  },
];

const WHY_JOIN = [
  {
    icon: Target,
    title: "Được đề xuất đúng bài toán",
    desc: "AI Matching tự tìm bài toán phù hợp lĩnh vực của bạn — không cần rà từng tin đăng thủ công.",
  },
  {
    icon: ShieldCheck,
    title: "Hồ sơ được xác minh",
    desc: "Hồ sơ có xác minh giúp doanh nghiệp, tổ chức tin tưởng và chủ động liên hệ bạn trước.",
  },
  {
    icon: Handshake,
    title: "Không rao vặt, không quảng cáo",
    desc: "Chỉ có bài toán thật từ doanh nghiệp, địa phương đã đăng ký trên mạng lưới — không tin rác.",
  },
  {
    icon: Clock,
    title: "Miễn phí, đăng ký 2 phút",
    desc: "Không mất phí tham gia. Điền hồ sơ, chờ xác minh, sẵn sàng nhận đề xuất ghép nối.",
  },
];

const JOIN_STEPS = [
  { step: "1", title: "Tạo hồ sơ", desc: "Điền lĩnh vực, kinh nghiệm và thế mạnh chuyên môn — khoảng 2 phút." },
  { step: "2", title: "Được xác minh", desc: "Tổ chức đầu mối xác minh hồ sơ để đảm bảo độ tin cậy trên mạng lưới." },
  { step: "3", title: "Nhận đề xuất phù hợp", desc: "AI Matching gợi ý đúng bài toán, kèm giải thích rõ ràng — không đoán mò." },
];

const NORTH_STAR = [
  "Hợp đồng",
  "Tài trợ & Đầu tư",
  "Nhiệm vụ",
  "Công nghệ",
  "Thu nhập",
  "Tác động",
];

const KG_NODES = [
  {
    icon: Users,
    label: "People",
    title: "Con người & Tổ chức",
    desc: "Kết nối chuyên gia, nhà khoa học, tổ chức KH&CN và doanh nghiệp KH&CN.",
    tags: ["Chuyên gia", "Nhà khoa học", "Tổ chức KH&CN", "DN KH&CN"],
    color: "var(--cyan)",
    bg: "#e3f6fa",
  },
  {
    icon: FlaskConical,
    label: "Assets",
    title: "Năng lực & Tài sản KH&CN",
    desc: "Tập hợp, chuẩn hóa và kết nối công nghệ, giải pháp, sáng chế, thiết bị, phòng thí nghiệm và kết quả nghiên cứu.",
    tags: ["Công nghệ", "Giải pháp", "Sáng chế", "Thiết bị", "PTN", "KQNC"],
    color: "var(--accent)",
    bg: "var(--accent-light)",
  },
  {
    icon: Lightbulb,
    label: "Opportunities",
    title: "Bài toán & Cơ hội",
    desc: "Đưa bài toán, nhu cầu thực tế, nhiệm vụ, tài trợ, đầu tư và nhu cầu hợp tác lên nền tảng.",
    tags: ["Bài toán", "Nhiệm vụ", "Tài trợ", "Đầu tư", "Hợp tác"],
    color: "var(--gold)",
    bg: "var(--gold-light)",
  },
];

const AI_FEATURES = [
  { icon: Search, title: "Semantic Search", desc: "Tìm kiếm ngữ nghĩa, hiểu ngữ cảnh" },
  { icon: BarChart3, title: "Explainable Ranking", desc: "Đánh giá & xếp hạng có giải thích" },
  { icon: Bot, title: "AI Agent", desc: "Đề xuất chủ động & hỗ trợ ra quyết định" },
];

const PROJECT_FLOW = [
  { icon: Handshake, label: "Kết nối đối tác" },
  { icon: Package, label: "Huy động nguồn lực" },
  { icon: FileText, label: "Hợp đồng & triển khai" },
  { icon: LineChart, label: "Theo dõi tiến độ" },
  { icon: Target, label: "Kết quả & tác động" },
];

const VALUE_PROPS = [
  { icon: Network, title: "Kết nối thông minh", desc: "Đúng người – đúng năng lực – đúng nhu cầu" },
  { icon: ShieldCheck, title: "Hợp tác hiệu quả", desc: "Rút ngắn thời gian tìm kiếm, tăng tỷ lệ thành công" },
  { icon: Gem, title: "Minh bạch & tin cậy", desc: "Dữ liệu chuẩn hóa, đánh giá có căn cứ, truy vết rõ ràng" },
  { icon: TrendingUp, title: "Kiến tạo giá trị bền vững", desc: "Tối ưu nguồn lực, tạo ra kết quả và tác động thực tiễn" },
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

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <DemoBanner />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-14 w-auto md:h-16" />
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
      <section className="relative overflow-hidden bg-gradient-to-b from-navy to-brand text-white">
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-36">
          <RingMotif className="pointer-events-none hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2 w-72 h-72 opacity-60 -z-10" />

          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white/80 border border-white/25 rounded-full px-3 py-1.5 min-h-[30px]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--gold)" }} />
            <RotatingWords words={KICKER_WORDS} />
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-bold max-w-3xl leading-[1.02] tracking-tight">
            Kết nối tri thức.{" "}
            <span style={{ color: "var(--gold)" }}>Kiến tạo giá trị.</span>
          </h1>
          <p className="mt-4 text-white/90 max-w-xl text-lg font-medium leading-snug">
            Biến bài toán thành đội ngũ. Biến tri thức thành dự án. Biến nguồn lực
            thành kết quả.
          </p>
          <p className="mt-4 text-white/85 max-w-xl leading-relaxed">
            VI CONNECT là nền tảng có trí tuệ, vận hành trên một Knowledge Graph sống,
            kết nối và kích hoạt nguồn lực theo năm bước Connect – Match – Mobilize –
            Execute – Impact, với AI Matching giải thích được xuyên suốt.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="group bg-white text-navy hover:bg-white/90 border-transparent shadow-[0_0_0_0_rgba(247,201,72,0)] hover:shadow-[0_0_24px_2px_rgba(247,201,72,0.35)] transition-shadow"
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
                Đăng bài toán của bạn
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
                <div className="text-2xl md:text-3xl font-bold text-brand-dark">
                  <CountUp value={100} suffix="%" />
                </div>
                <div className="text-xs md:text-sm text-muted mt-1">
                  Đề xuất ghép nối luôn kèm giải thích, không hộp đen thuật toán
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
              VI CONNECT không thay thế các cơ sở dữ liệu, sàn giao dịch công nghệ hay
              quỹ hiện có. Vai trò của nền tảng là tạo ra lớp kết nối và điều phối
              thông minh, giúp biến dữ liệu và nguồn lực đang phân tán thành quan hệ
              hợp tác, dự án và kết quả thực tế — quanh một Knowledge Graph sống liên
              kết ba trụ cột People, Assets, Opportunities.
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
                  className="rounded-xl p-4 border border-border"
                  style={{ background: n.bg }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center mb-2"
                    style={{ background: "rgba(255,255,255,0.6)", color: n.color }}
                  >
                    <n.icon className="w-4 h-4" />
                  </div>
                  <div className="font-semibold" style={{ color: n.color }}>
                    {n.label}
                  </div>
                  <div className="text-xs font-medium text-brand-dark mt-0.5">{n.title}</div>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed">{n.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {n.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium rounded-full border border-border bg-background/70 px-2 py-0.5 text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
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
              className="relative mx-auto max-w-lg rounded-2xl border-2 py-5 px-6"
              style={{ borderColor: "var(--brand)", background: "var(--brand-light)" }}
            >
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full motion-safe:animate-pulse" style={{ background: "var(--accent)" }} aria-hidden="true" />
              <div className="text-center">
                <BrainCircuit className="w-6 h-6 mx-auto mb-1.5 text-brand" aria-hidden="true" />
                <div className="font-bold text-brand-dark">AI Matching Engine</div>
                <p className="text-xs text-muted mt-1">
                  Sử dụng AI để hiểu ngữ cảnh, đánh giá mức độ phù hợp và đề xuất kết nối tối ưu.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {AI_FEATURES.map((f) => (
                  <div key={f.title} className="text-center">
                    <f.icon className="w-4 h-4 mx-auto text-brand" aria-hidden="true" />
                    <div className="text-[11px] font-semibold text-brand-dark mt-1">{f.title}</div>
                    <div className="text-[10px] text-muted mt-0.5 leading-tight">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center my-3 text-muted">
              <ArrowRight className="w-5 h-5 rotate-90" aria-hidden="true" />
            </div>

            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-background py-5 px-6">
              <div className="text-center">
                <Handshake className="w-6 h-6 mx-auto mb-1.5 text-brand-dark" aria-hidden="true" />
                <div className="font-semibold text-brand-dark">Project · Collaboration</div>
                <p className="text-xs text-muted mt-1">Biến kết nối thành dự án và giá trị thực.</p>
              </div>
              <div className="mt-4 flex flex-wrap items-start justify-center gap-x-1 gap-y-3">
                {PROJECT_FLOW.map((p, i) => (
                  <div key={p.label} className="flex items-center">
                    <div className="flex flex-col items-center text-center w-[76px]">
                      <p.icon className="w-4 h-4 text-muted" aria-hidden="true" />
                      <div className="text-[10px] text-muted mt-1 leading-tight">{p.label}</div>
                    </div>
                    {i < PROJECT_FLOW.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted/40 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Value props */}
        <Reveal delay={140}>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="rounded-xl border border-border p-4">
                <v.icon className="w-5 h-5 text-brand" aria-hidden="true" />
                <div className="text-sm font-semibold text-brand-dark mt-2">{v.title}</div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Differentiators */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIFFERENTIATORS.map((c, i) => (
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

      {/* Why join */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-4 w-full">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand uppercase tracking-wide">Vì sao tham gia</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark text-balance">
              Chuyên gia tham gia VI CONNECT được gì?
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_JOIN.map((b, i) => (
            <Reveal key={b.title} delay={i * 60}>
              <Card className={`h-full ${cardHover}`}>
                <CardContent className="py-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}
                  >
                    <b.icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-brand-dark mt-4">{b.title}</div>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div
              className="rounded-2xl px-6 py-10 md:py-12 md:px-12 text-center bg-gradient-to-br from-brand to-navy text-white"
            >
              <h3 className="text-2xl md:text-3xl font-bold max-w-xl mx-auto leading-snug">
                Mạng lưới đang được xây dựng từng ngày. Hồ sơ của bạn có thể là mảnh ghép tiếp theo.
              </h3>
              <div className="mt-7">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group bg-white text-navy hover:bg-white/90 border-transparent"
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
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark text-balance">
              Từ hồ sơ đến tác động, theo năm bước rõ ràng
            </h2>
            <p className="mt-3 text-sm text-muted">
              AI đề xuất — con người thẩm định, quyết định và chịu trách nhiệm.
            </p>
          </div>
        </Reveal>
        <div className="relative mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="hidden lg:block absolute top-[22px] left-[10%] right-[10%] h-px bg-border" aria-hidden="true" />
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
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-dark text-balance">
              Bốn nhóm đối tượng, một mạng lưới chung
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 60}>
              <Card className={`h-full ${cardHover}`}>
                <CardContent className="py-6 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                    >
                      <a.icon className="w-5 h-5" />
                    </div>
                    {"tag" in a && a.tag && (
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 whitespace-nowrap"
                        style={{ background: "var(--background)", color: "var(--muted)" }}
                      >
                        {a.tag}
                      </span>
                    )}
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
      <section className="mt-20 bg-navy text-white">
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
            <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-white/50">
              Đo bằng giá trị được kích hoạt
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {NORTH_STAR.map((label) => (
                <span
                  key={label}
                  className="text-xs font-medium rounded-full border border-white/20 bg-white/5 px-3 py-1.5"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="bg-background">
        <Reveal>
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark text-balance">
              Sẵn sàng kết nối với hệ sinh thái khoa học công nghệ Việt Nam?
            </h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">
              Bạn là nhà khoa học, tổ chức KH&amp;CN, doanh nghiệp, địa phương hay quỹ
              / nhà đầu tư? Hãy bắt đầu từ nhu cầu thực tế của bạn — miễn phí đăng ký,
              hồ sơ được xác minh, ghép nối luôn có giải thích.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
              {JOIN_STEPS.map((s) => (
                <div key={s.step}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                  >
                    {s.step}
                  </div>
                  <div className="font-semibold text-brand-dark mt-2.5 text-sm">{s.title}</div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
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
        VI CONNECT — Nền tảng kết nối hệ sinh thái khoa học, công nghệ & đổi mới
        sáng tạo Việt Nam.
      </footer>
    </div>
  );
}
