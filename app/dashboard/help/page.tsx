import { ArrowRight, ArrowDown, CircleAlert, Info } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Stage = { title: string; scope: string; desc: string };
type Step = { title: string; scope: string; desc: string; note?: string };

const STAGES: Stage[] = [
  { title: "Kết nối", scope: "01–04", desc: "Tổ chức, chuyên gia, công nghệ/giải pháp, tri thức, nhu cầu/bài toán vào hệ thống." },
  { title: "Ghép nối", scope: "05", desc: "Hệ thống chấm điểm và gợi ý ghép nối nhu cầu với nguồn lực phù hợp." },
  { title: "Huy động", scope: "06", desc: "Gắn nguồn lực/tài trợ cho cặp ghép nối đã chốt (bước không bắt buộc)." },
  { title: "Triển khai", scope: "07–09", desc: "Dự án, hợp đồng, mốc tiến độ, đội thực hiện, đánh giá chạy thật." },
  { title: "Quản trị", scope: "10–11", desc: "Audit, phân quyền, đo tác động — kết quả quay lại nuôi giai đoạn Kết nối." },
];

const STEPS: Step[] = [
  {
    title: "Đăng nhu cầu / bài toán",
    scope: "Cấu phần 04",
    desc: "Tổ chức/doanh nghiệp đăng nhu cầu — tiêu đề ≥5 ký tự, mô tả ≥10 ký tự, chọn ít nhất 1 lĩnh vực. Đăng xong hiển thị công khai ngay.",
    note: "Chỉ SUPERADMIN/ADMIN/ENTERPRISE đăng được — chuyên gia (EXPERT) không tạo Need, chỉ là bên được gợi ý ghép nối tới.",
  },
  {
    title: "Gợi ý & xác nhận ghép nối",
    scope: "Cấu phần 05",
    desc: "Hệ thống chấm điểm nhu cầu với công nghệ/giải pháp và hồ sơ chuyên gia đang hoạt động, tạo gợi ý ghép nối có giải thích lý do. Người phụ trách duyệt qua từng bước cho tới khi hợp tác.",
    note: "Chạy lại không mất tiến độ — chỉ các gợi ý chưa ai xử lý mới bị làm mới. Nếu chưa có công nghệ/giải pháp hoặc hồ sơ chuyên gia nào đủ điều kiện, hệ thống trả về 0 gợi ý mà không báo lỗi.",
  },
  {
    title: "Gắn nguồn tài trợ",
    scope: "Cấu phần 06",
    desc: "Gắn nguồn lực/tài trợ liên quan cho tổ chức. Bước này không bắt buộc — dự án vẫn hình thành được mà không cần qua đây.",
  },
  {
    title: "Chuyển thành dự án, ký hợp đồng",
    scope: "Cấu phần 07",
    desc: "Ghép nối đã xác nhận hợp tác được chuyển thành dự án, tự tạo kèm mốc tiến độ đầu tiên. Sau đó khởi tạo và ký thoả thuận hợp tác.",
    note: "Cả hai bên trong ghép nối (bên có nhu cầu và bên có giải pháp/chuyên gia) đều thao tác được, không riêng bên đăng nhu cầu.",
  },
  {
    title: "Triển khai: mốc tiến độ & đội thực hiện",
    scope: "Cấu phần 07 · 09",
    desc: "Thêm các mốc tiến độ tiếp theo; thêm thành viên vào đội thực hiện dự án.",
    note: "Chỉ thêm được người thuộc 1 trong 2 tổ chức của ghép nối gốc — hệ thống tự kiểm tra, không thêm được người ngoài dự án.",
  },
  {
    title: "Bàn giao & đánh giá",
    scope: "Cấu phần 07 · 08",
    desc: "Nộp sản phẩm bàn giao theo từng mốc và nghiệm thu. Đánh giá hiệu quả dự án (điểm số, tiêu chí, ghi chú).",
    note: "Đánh giá là ghi nhận một chiều (không sửa/xoá sau khi tạo) và không bắt buộc phải chờ dự án hoàn thành hay có bàn giao trước.",
  },
  {
    title: "Hoàn thành dự án",
    scope: "Cấu phần 07",
    desc: "Chuyển trạng thái dự án sang hoàn thành, tạm dừng hoặc chấm dứt.",
    note: "Hệ thống không tự chặn nếu hợp đồng chưa ký hoặc mốc tiến độ chưa xong — quyết định đóng dự án là thủ công của người phụ trách.",
  },
  {
    title: "Audit & đo tác động",
    scope: "Cấu phần 10 · 11",
    desc: "Mọi thao tác quan trọng ở trên đều được ghi nhật ký. Trang tổng quan tính KPI trực tiếp từ dữ liệu hiện có, cảnh báo tự sinh khi có hồ sơ chưa xác minh hoặc bài toán chưa có giải pháp — thúc đẩy vòng lặp mới quay lại bước 1.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Trợ giúp & hướng dẫn"
        description="Tổng quan chu trình vận hành VI-CONNECT từ đầu đến cuối, dành cho đội thực hiện dự án."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-brand-dark">Chu trình vận hành khép kín</h2>
        <div className="flex flex-wrap items-stretch gap-2">
          {STAGES.map((stage, i) => (
            <div key={stage.title} className="flex items-stretch gap-2">
              <Card className="w-40 shrink-0">
                <CardContent className="p-3">
                  <Badge variant="brand">{stage.scope}</Badge>
                  <div className="font-medium text-sm mt-1.5">{stage.title}</div>
                  <p className="text-xs text-muted mt-1">{stage.desc}</p>
                </CardContent>
              </Card>
              {i < STAGES.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted self-center shrink-0" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">
          Kết quả đo được ở giai đoạn Quản trị (tổ chức mới, nhu cầu mới phát sinh từ tác động) quay lại nuôi
          giai đoạn Kết nối — khép vòng, không có điểm kết thúc cố định.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-brand-dark">Quy trình một dự án — 8 bước</h2>
        <div className="space-y-2">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <Card>
                <CardContent className="p-4 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{step.title}</span>
                      <Badge>{step.scope}</Badge>
                    </div>
                    <p className="text-sm text-muted">{step.desc}</p>
                    {step.note && (
                      <p className="text-xs text-warning flex items-start gap-1.5 mt-1">
                        <CircleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{step.note}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-brand-dark">Chưa có Tổ chức hoặc Chuyên gia thì sao?</h2>
        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-medium">Chưa có tổ chức: </span>
                <span className="text-muted">
                  chỉ SUPERADMIN mới tạo được tổ chức mới. Không có đường tự đăng ký tổ chức trên nền tảng.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-medium">Chưa có chuyên gia: </span>
                <span className="text-muted">
                  chuyên gia tự đăng ký được, nhưng bắt buộc chọn một tổ chức đã tồn tại trong form đăng ký —
                  nghĩa là tổ chức phải có trước. Hồ sơ mới đăng ký ở trạng thái chờ xác minh, cần
                  SUPERADMIN/ADMIN xác minh mới đủ điều kiện được gợi ý ghép nối ổn định.
                </span>
              </div>
            </div>
            <p className="text-xs text-muted border-t border-border pt-3">
              Trình tự khởi động bắt buộc: SUPERADMIN tạo tổ chức → chuyên gia/doanh nghiệp đăng ký hoặc được
              cấp tài khoản gắn tổ chức đó → (khuyến nghị) xác minh hồ sơ → lúc đó chu trình ở trên mới vận
              hành được từ bước 1.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
