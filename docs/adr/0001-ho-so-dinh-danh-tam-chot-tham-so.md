# ADR-0001 — Tạm chốt tham số cấu phần 01 (Hồ sơ & Định danh)

**Trạng thái:** TẠM/DEMO — chưa phải quyết định chính thức của Product Owner.
**Căn cứ:** `VC-NV-011-HoSoDinhDanh-DRAFT_v2.0` Mục 22 liệt kê các tham số
"không được tự suy diễn khi code". ADR này tự đặt giá trị tạm cho từng mục để
có thể code hoá và chạy thử được cấu phần 01 trên môi trường demo, đúng lựa
chọn của chủ repo ("tự chốt tạm để code hết"). Mọi giá trị dưới đây phải được
Product Owner xác nhận lại trước khi dùng cho dữ liệu VAST/HTIC thật — xem
`docs/SCOPE.md` ("không dùng dữ liệu demo làm bằng chứng về VAST/HTIC").

## 1. Cấu trúc ID công khai

Chưa cấp ID công khai dạng `VI-RID`/`VI-OID` riêng — dùng `cuid()` nội bộ hiện
có của `ExpertProfile.id`/`Organization.id` làm định danh. Không thêm định
dạng ID công khai mới ở v1.

## 2. Ngưỡng confidence và `bulk-safe-accept`

- Trường không nhạy cảm (`headline`, `bio`, `fields`, `skills`,
  `experienceYears`, số liệu `publications`/`patents`) + `confidence ≥ 0.9` +
  không có `conflictFlags` → đủ điều kiện "Đồng ý tất cả đề xuất an toàn".
- Trường nhạy cảm hoặc ảnh hưởng quyền (`email`, `phone`, affiliation,
  identifier, mọi đề xuất có `conflictFlags`) → luôn yêu cầu xác nhận thủ công
  từng cái, bất kể confidence.

## 3. Trọng số Identity Resolution

Tổ hợp tuyến tính, cắt về `[0, 1]`:

| Tín hiệu | Trọng số |
|---|---|
| ORCID trùng, connection `AUTHENTICATED` | 0.9 |
| ORCID trùng, connection `ENTERED`/`MATCHED` (chưa xác thực) | 0.5 |
| Email tổ chức trùng domain | 0.3 |
| Tên giống nhau (so khớp token, không phân biệt hoa/thường/dấu) | tối đa 0.3 |
| Có affiliation cùng tổ chức | 0.2 |

Đồng tác giả/DOI chưa đưa vào v1 (chưa có model `Publication`) — để backlog.

Ngưỡng trạng thái:

- `score ≥ 0.85` → `LIKELY_SAME` (hiển thị, chờ người dùng xác nhận "Đây là tôi").
- `0.6 ≤ score < 0.85` → `POTENTIAL_DUPLICATE` (hiển thị kèm giải thích, không tự claim).
- `score < 0.6` → không hiển thị làm ứng viên.

## 4. Bằng chứng bắt buộc cho Capability

Một `Capability` chỉ được chuyển `verificationStatus = VERIFIED` khi có ít
nhất một `CapabilityEvidence` liên kết. Không có ngoại lệ ở v1.

## 5. Vai trò được phép xác nhận affiliation, verify, merge

Theo đúng `assertOrgScope` đã có ở `lib/domain/access-control.ts`
(`VC-KT-002`):

- `VAST_ADMIN`: toàn hệ thống.
- `HOI_ADMIN`: chỉ trong tổ chức của mình (affiliation, verify).
- **Merge (approve)**: chỉ `VAST_ADMIN` ở v1 — rủi ro cao (gộp identity), giữ
  tập trung, không phân quyền xuống `HOI_ADMIN` cho tới khi có quy trình
  Maker-Checker riêng.
- Chủ hồ sơ (`EXPERT`, scope `OWN`): claim, accept/reject/edit proposal,
  consent, đặt field visibility cho hồ sơ của chính mình.

### 5.1. Admin thao tác thay chủ hồ sơ (bổ sung 2026-08-18)

Theo yêu cầu vận hành thực tế (nhiều chuyên gia cần admin hỗ trợ nhập liệu),
`VAST_ADMIN` và `HOI_ADMIN` (đúng tổ chức của hồ sơ, theo `assertOrgScope`)
**được phép thao tác thay** chủ hồ sơ ở toàn bộ các action vốn chỉ dành cho
chủ hồ sơ: cấp/thu hồi consent, chạy enrichment mock, duyệt/từ chối/điều
chỉnh field proposal, bulk-safe-accept, đặt field visibility, thêm
affiliation/expertise/capability/evidence.

Không đổi nguyên tắc self-declare ở Mục 6.3 tài liệu `VC-NV-011` — admin chỉ
**thay mặt nhập hộ**, không tự sinh ra nội dung. Mọi thao tác admin làm thay
được ghi `actingAsAdmin: true` vào `AuditLog.meta` để truy vết đúng ai thực sự
xác nhận (Mục 3.4, 13.2 của `VC-NV-011`) — không lẫn với dữ liệu chủ hồ sơ tự
khai. `Affiliation.source` ghi `"ADMIN_ON_BEHALF"` khi admin thêm hộ (trường
tự do, không cần migration); `Expertise.source` vẫn ghi `SELF` vì enum
`ExpertiseSource` hiện chưa có giá trị admin — nếu cần phân biệt tại đó, phải
thêm giá trị enum + migration riêng (để backlog).

Không mở rộng cho `ENTERPRISE`/`VIEWER`, và **không** áp dụng cho các hành
động vốn đã admin-only từ đầu (xác minh capability/affiliation, duyệt claim,
identity match, merge) — các hành động đó giữ nguyên logic cũ.

## 6. Danh mục chuẩn Expertise/Capability/AffiliationType

Chưa có danh mục chuẩn hoá được duyệt — dùng free-text do người dùng nhập ở
v1 (giống cách `ExpertProfile.fields`/`skills` hiện tại). `AffiliationType` và
`Role` (vị trí) trong `Affiliation` cũng là free-text. Chuẩn hoá taxonomy để
backlog riêng.

## 7. Chính sách lưu giữ, xoá, ẩn danh

Không xoá cứng dữ liệu định danh ở v1. Trạng thái nghỉ/thu hồi dùng
`ProfileStatus.RETIRED` và `ExternalConnectionStatus.REVOKED`; xoá thật/ẩn
danh hoá theo yêu cầu pháp lý để backlog, cần chính sách riêng trước khi có
dữ liệu cá nhân thật quy mô lớn (đúng Mục 21.1 của `VC-NV-011`).

## 8. Nguồn ngoài được phép crawl, API scope, quota

**Cập nhật 2026-08-18 — đã bật kết nối thật cho phần không cần credential:**

- **OpenAlex, ROR, Crossref**: API mở, không cần key — đã nối thật ở
  `lib/integrations/openalex.ts`, `lib/integrations/ror.ts`,
  `lib/integrations/crossref.ts`. `runMockEnrichmentAction` gọi OpenAlex thật
  theo ORCID của hồ sơ (nếu có) trước, chỉ fallback về đề xuất mock khi chưa
  có ORCID hoặc gọi API thất bại/rỗng — mọi `FieldProposal` ghi đúng
  `extractionMethod` (`API` hoặc `MOCK`), không bao giờ trình bày mock như dữ
  liệu thật (Mục 3.5). `CapabilityEvidence` loại `PUBLICATION` có DOI trong
  `referenceUrl` được xác minh thật qua Crossref.
- **ORCID OAuth**: đã dựng luồng thật (`lib/integrations/orcid.ts`,
  `app/api/integrations/orcid/connect`, `/callback`) nhưng **cần
  `ORCID_CLIENT_ID`/`ORCID_CLIENT_SECRET`** — phải đăng ký ứng dụng tại
  https://orcid.org/developer-tools bằng tài khoản ORCID của tổ chức (chủ
  repo tự đăng ký, ngoài phạm vi AI thực hiện được, xem `.env.production.example`).
  Chưa cấu hình thì nút OAuth tự ẩn, chỉ còn nhập ORCID thủ công (trạng thái
  `ENTERED`, không xác thực) qua `addOrcidIdentifierAction`.
- Chưa xin quyền/đánh giá điều khoản dùng cho nguồn thương mại (Scopus, Web
  of Science) — để backlog, chưa có adapter.
- Rate limit: chưa có cơ chế giới hạn/backoff chủ động khi gọi OpenAlex/ROR/
  Crossref — mỗi request có timeout 8s, lỗi/timeout thì fallback êm, không
  crash trang. Thêm cơ chế backoff/quota theo dõi để backlog nếu lưu lượng
  thật tăng.

## 9. Chu kỳ đồng bộ định kỳ

Chưa dựng job scheduler thật (`SyncJobs`) ở v1 — đồng bộ định kỳ (Mục 7.3,
01.13 của `VC-NV-011`) để backlog. V1 chỉ có "chạy enrichment thủ công" do
người dùng bấm.

## 10. Quyết định kỹ thuật đi kèm (không thuộc Mục 22 nhưng cần ghi lại)

- **`ExpertProfile.userId` chuyển sang nullable** để hỗ trợ candidate profile
  chưa có người nhận (Mục 6.3, `ProfileClaim`). Thêm `ProfileStatus` (
  `UNCLAIMED | CLAIMED | SUSPENDED | RETIRED | MERGED`), mặc định `CLAIMED`
  cho toàn bộ hồ sơ đã tồn tại (luôn có `userId` trước migration này).
- **Không xoá `ExpertProfile.organizationId`.** Giữ làm "affiliation chính"
  denormalized — mã nguồn hiện tại (`matching.ts`, `access-control.ts`) phụ
  thuộc trực tiếp trường này. Thêm model `Affiliation` mới cho multi-org +
  lịch sử; đồng bộ hai chiều ở tầng action: khi một `Affiliation` được đánh
  dấu `isPrimary = true`, cập nhật `ExpertProfile.organizationId` theo đó. Gỡ
  bỏ hẳn `organizationId` khỏi `ExpertProfile` để backlog riêng (rủi ro phá vỡ
  nhiều chỗ, cần một migration + rà soát mã nguồn riêng).
- **Field Visibility lưu dạng `Json` trên `ExpertProfile`** (map
  `fieldPath → FieldVisibility`) thay vì bảng `PrivacySettings` chuẩn hoá đầy
  đủ — đơn giản hơn cho v1, đọc mặc định theo Mục 15.2 của `VC-NV-011` khi
  không có key. Chuẩn hoá thành bảng riêng để backlog nếu nhu cầu truy vấn
  phức tạp hơn xuất hiện.
- **Không thêm mức xác thực mới.** Giữ nguyên `VerificationStatus`
  (`UNVERIFIED|PENDING|VERIFIED|REJECTED`) cho cả `ExpertProfile` và
  `Affiliation`, đúng Mục 14 của `VC-NV-011` ("tiếp tục được tôn trọng cho đến
  khi có migration được phê duyệt").
