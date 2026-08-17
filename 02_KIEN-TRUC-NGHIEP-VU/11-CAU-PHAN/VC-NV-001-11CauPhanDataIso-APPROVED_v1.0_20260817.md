# VI-CONNECT — 11 Cấu phần chuẩn

**Phiên bản:** 1.0  
**Ngày chốt:** 17/08/2026  
**Trạng thái:** Baseline dùng cho Đề án, DATA, UI/UX, API và kiến trúc hệ thống.

## 1. Danh mục 11 cấu phần

| # | Cấu phần VI-CONNECT | Nhóm DATA chính | Ánh xạ ISO chính | Ghi chú chức năng ISO cần tích hợp |
|---|---|---|---|---|
| 01 | **Hồ sơ & Định danh** | `Expert`, `Person`, `Organization`, `Competence`, `Membership` | ISO 56001:2024 — Clause 7 Support | Quản lý năng lực, nguồn lực, vai trò con người và thông tin hỗ trợ hệ thống quản lý đổi mới sáng tạo. |
| 02 | **Công nghệ & Giải pháp** | `Technology`, `Solution`, `Product`, `IP`, `TRL` | ISO 56001:2024 — Clause 8 Operation; ISO 56005:2020 | Quản lý kết quả đổi mới, công nghệ, giải pháp, sản phẩm và tài sản trí tuệ; hỗ trợ bảo vệ, khai thác và chuyển giao IP. |
| 03 | **Tri thức & Dữ liệu** | `Publication`, `Patent`, `Dataset`, `Knowledge`, `Evidence` | ISO 56001:2024 — Clause 7 Support; ISO 56006:2021 | Quản lý tri thức, dữ liệu và strategic intelligence; thu thập, phân tích và cung cấp bằng chứng phục vụ quyết định đổi mới. |
| 04 | **Bài toán & Nhu cầu** | `Need`, `Problem`, `Challenge`, `Opportunity`, `Idea` | ISO 56001:2024 — Clauses 6, 8; ISO 56007:2023 | Xác định nhu cầu, vấn đề, cơ hội và ý tưởng; chuẩn hóa đầu bài để đưa vào quy trình ghép nối và triển khai. |
| 05 | **Tìm kiếm & Ghép nối** | `Match`, `Score`, `Recommendation`, `Evidence` | ISO 56003:2019; ISO/IEC 42001:2023 | Tìm kiếm, đánh giá và lựa chọn chuyên gia, tổ chức, công nghệ, đối tác và nguồn lực; AI chỉ hỗ trợ quyết định và phải có giải thích, kiểm soát rủi ro. |
| 06 | **Nguồn lực & Tài trợ** | `Funding`, `Funder`, `Call`, `Investment`, `Resource` | ISO 56001:2024 — Clauses 6, 7 | Hoạch định, huy động và phân bổ nguồn lực; quản lý chương trình tài trợ, nguồn vốn, đầu tư và điều kiện tham gia. |
| 07 | **Dự án & Giao dịch** | `Project`, `Proposal`, `Contract`, `Milestone`, `Disbursement` | ISO 56001:2024 — Clause 8 Operation | Quản lý vòng đời từ đề xuất, hợp đồng, thực hiện, mốc tiến độ, giải ngân, nghiệm thu đến kết thúc dự án/giao dịch. |
| 08 | **Thẩm định & Đánh giá** | `Review`, `Assessment`, `DueDiligence`, `Evaluation` | ISO 56001:2024 — Clause 9 Performance Evaluation; ISO/TR 56004:2019 | Thẩm định hồ sơ, năng lực, công nghệ, dự án và nguồn lực; đánh giá hiệu quả hệ thống và chất lượng quyết định. |
| 09 | **Cộng tác & Mạng lưới** | `Partnership`, `Team`, `Network`, `Collaboration` | ISO 56003:2019 — Clauses 4–8 | Hình thành và quản lý quan hệ hợp tác, nhóm thực hiện, mạng lưới chuyên gia/tổ chức và tương tác đối tác đổi mới. |
| 10 | **Quản trị & Tuân thủ** | `Policy`, `Strategy`, `Objective`, `Risk`, `Workflow`, `Approval`, `Compliance` | ISO 56001:2024 — Clauses 4, 5, 6, 10; ISO 9001; ISO/IEC 27001; ISO/IEC 27701 | Quản trị chính sách, chiến lược, mục tiêu, rủi ro, phân quyền, phê duyệt, tuân thủ pháp luật/ISO, audit và cải tiến. |
| 11 | **Phân tích & Tác động** | `KPI`, `Metric`, `Outcome`, `Impact`, `Forecast` | ISO 56001:2024 — Clause 9; ISO 56008:2024 | Dashboard, KPI, đo lường kết quả và tác động; phân tích xu hướng, dự báo và hỗ trợ ra quyết định. |

## 2. Nhóm kiến trúc nghiệp vụ

### CONNECT
- 01. Hồ sơ & Định danh
- 02. Công nghệ & Giải pháp
- 03. Tri thức & Dữ liệu
- 04. Bài toán & Nhu cầu

### MATCH
- 05. Tìm kiếm & Ghép nối

### MOBILIZE
- 06. Nguồn lực & Tài trợ

### EXECUTE
- 07. Dự án & Giao dịch
- 08. Thẩm định & Đánh giá
- 09. Cộng tác & Mạng lưới

### GOVERN & IMPACT
- 10. Quản trị & Tuân thủ
- 11. Phân tích & Tác động

## 3. Quy ước đặt tên

### Tên hiển thị
- Mỗi cấu phần dùng tối đa hai cụm danh từ.
- Dùng dấu `&` để thống nhất UI/UX.
- Không đưa công nghệ triển khai như AI, Knowledge Graph, Dashboard, Marketplace vào tên cấp cấu phần nếu không phải bản chất domain.

### Tên thư mục/module đề xuất

```text
01_ho-so-dinh-danh
02_cong-nghe-giai-phap
03_tri-thuc-du-lieu
04_bai-toan-nhu-cau
05_tim-kiem-ghep-noi
06_nguon-luc-tai-tro
07_du-an-giao-dich
08_tham-dinh-danh-gia
09_cong-tac-mang-luoi
10_quan-tri-tuan-thu
11_phan-tich-tac-dong
```

### Namespace API đề xuất

```text
/api/v1/ho-so-dinh-danh
/api/v1/cong-nghe-giai-phap
/api/v1/tri-thuc-du-lieu
/api/v1/bai-toan-nhu-cau
/api/v1/tim-kiem-ghep-noi
/api/v1/nguon-luc-tai-tro
/api/v1/du-an-giao-dich
/api/v1/tham-dinh-danh-gia
/api/v1/cong-tac-mang-luoi
/api/v1/quan-tri-tuan-thu
/api/v1/phan-tich-tac-dong
```

## 4. Quy tắc baseline

Bộ 11 cấu phần này là taxonomy chuẩn của VI-CONNECT. Khi bổ sung chức năng mới, ưu tiên đặt dưới một trong 11 domain trên thay vì tạo thêm cấu phần cấp 1. AI Copilot, API Gateway, IAM, Data Platform, Knowledge Graph, Search Engine và các dashboard là các lớp hoặc module dùng chung, không làm thay đổi số lượng 11 cấu phần.
