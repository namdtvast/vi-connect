# VC-NV-011 — Hồ sơ & Định danh

| Thuộc tính | Giá trị |
|---|---|
| Sản phẩm | VI CONNECT |
| Mã tài liệu | VC-NV-011 |
| Phiên bản | v2.0 |
| Ngày cập nhật | 18/08/2026 |
| Trạng thái | DRAFT — dự thảo để review, chưa phê duyệt triển khai |
| Cấu phần | 01. Hồ sơ & Định danh |
| Nhóm kiến trúc | CONNECT |
| Namespace API | `/api/v1/ho-so-dinh-danh` |
| Đối tượng sử dụng | Product Owner, Business Analyst, Solution Architect, Data/AI Engineer, Developer, QA/QC, cán bộ quản trị dữ liệu |
| Thay đổi chính | Thiết kế lại theo nguyên tắc AI tự thu thập và đề xuất; người dùng chỉ đồng ý, không đồng ý hoặc điều chỉnh |

## 1. Căn cứ và quan hệ tài liệu

Tài liệu này mở rộng baseline cấu phần 01 đã được phê duyệt tại `VC-NV-011 v1.0`, đồng thời phải được đọc cùng:

1. `VC-NV-001` — baseline 11 cấu phần, DATA và ISO của VI CONNECT.
2. `VC-QT-001` — quy ước đặt tên và lưu trữ tài liệu.
3. `VC-KT-002` — nguồn chuẩn về tài khoản, tenant, role, permission, data scope và visibility.
4. `VC-KT-003` — kiến trúc bảo mật và bảo vệ dữ liệu.
5. `ARCHITECTURE.md` — ranh giới ứng dụng, domain và tích hợp.
6. `prisma/schema.prisma` — mô hình dữ liệu hiện hành cần được chuyển đổi bằng migration có kiểm soát.
7. Các ADR được phê duyệt cho từng nguồn dữ liệu ngoài, thay đổi schema hoặc quyết định tích hợp.

Khi có xung đột, ưu tiên tài liệu đã phê duyệt, quy định pháp luật, chính sách bảo vệ dữ liệu, ADR và hợp đồng API hiện hành. Bản DRAFT này không tự xác nhận rằng chức năng đã được triển khai hoặc sẵn sàng production.

### 1.1. Vị trí trong kiến trúc VI CONNECT

- Thuộc miền **CONNECT** và cung cấp dữ liệu nền cho tìm kiếm, ghép nối, cộng tác và đánh giá tác động.
- Không định nghĩa lại thuật toán matching hoặc quyền quyết định của cán bộ/hội đồng.
- AI chỉ thu thập, đối sánh, trích xuất, chuẩn hóa và đề xuất có giải thích.
- Người dùng hoặc chủ thể được ủy quyền quyết định dữ liệu nào trở thành dữ liệu chính thức.

### 1.2. Ranh giới với MANLAB-AIOS

VI CONNECT là sản phẩm độc lập. MANLAB-AIOS và các hệ thống khác chỉ được kết nối qua API/schema/event contract có version trong `lib/integrations/`. Không sao chép toàn bộ module, schema nội bộ hoặc đường dẫn nghiệp vụ của hệ thống ngoài vào VI CONNECT.

## 2. Mục tiêu

Xây dựng lớp định danh và hồ sơ tin cậy để VI CONNECT xác định được:

> Ai là ai — thuộc tổ chức nào — có chuyên môn và năng lực gì — đã tạo ra kết quả gì — có thể cung cấp gì — đang cần gì — thông tin đó đến từ đâu và ai đã xác nhận.

Mục tiêu trải nghiệm là **không yêu cầu chuyên gia nhập lại một CV dài**. Sau khi đăng nhập và chấp thuận phạm vi xử lý dữ liệu, hệ thống chủ động tìm kiếm, đối sánh và tổng hợp thông tin từ các nguồn được phép. Người dùng chủ yếu thực hiện ba hành động:

```text
ĐỒNG Ý | KHÔNG ĐỒNG Ý | ĐIỀU CHỈNH
```

Hồ sơ không chỉ là danh bạ hoặc CV điện tử. Hồ sơ phải tạo dữ liệu có cấu trúc, có nguồn gốc và có khả năng sử dụng trực tiếp cho Search, Knowledge Graph, AI Matching, Recommendation và các giao dịch hợp tác tiếp theo.

## 3. Nguyên tắc bắt buộc

### 3.1. AI-first, human-controlled

- AI chủ động tìm, trích xuất, chuẩn hóa, đối sánh và đề xuất.
- AI không tự công bố thông tin, tự xác nhận danh tính, tự công nhận năng lực hoặc tự hợp nhất hồ sơ có rủi ro cao.
- Người dùng phải xem được giá trị, nguồn, bằng chứng, thời điểm thu thập và mức tin cậy trước khi quyết định.
- Mọi quyết định tự động được phép phải giới hạn ở thao tác kỹ thuật có thể đảo ngược và không làm thay đổi dữ liệu chính thức.

### 3.2. Consent trước khi thu thập và sử dụng

Trước khi chạy thu thập, hệ thống phải thông báo rõ:

- Nguồn nào sẽ được truy vấn.
- Nhóm dữ liệu nào sẽ được thu thập.
- Mục đích thu thập, đối sánh, gợi ý và chia sẻ.
- Dữ liệu nào có thể được dùng cho tìm kiếm hoặc matching.
- Cách từ chối một nguồn, ngắt liên kết, thu hồi đồng ý, ẩn, sửa hoặc yêu cầu xóa.

Sự im lặng hoặc tiếp tục sử dụng giao diện không được xem là đồng ý. Consent phải có phạm vi, phiên bản nội dung, dấu thời gian và khả năng thu hồi.

### 3.3. Không ghi đè dữ liệu đã xác nhận

Dữ liệu từ nguồn ngoài chỉ tạo **giá trị đề xuất**. Không ghi trực tiếp lên giá trị đã được người dùng hoặc tổ chức xác nhận. Khi có thay đổi từ nguồn, hệ thống tạo đề xuất mới và giữ nguyên lịch sử.

### 3.4. Provenance ở cấp trường

Mỗi giá trị hoặc assertion phải truy được tối thiểu: nguồn, bản ghi nguồn, URL hoặc định danh truy xuất, thời điểm thu thập, phương pháp trích xuất, độ tin cậy, bằng chứng và quyết định của người dùng.

### 3.5. Tách sự thật, suy luận và xác nhận

- **Sự thật có nguồn:** ví dụ một bài báo có DOI và tên tác giả.
- **Suy luận AI:** ví dụ suy ra chuyên môn từ công bố và dự án.
- **Tự khai:** thông tin do người dùng bổ sung.
- **Đã xác nhận:** thông tin được người dùng, tổ chức hoặc nguồn xác thực xác nhận.

Giao diện và API không được trình bày suy luận AI như dữ liệu đã được xác minh.

### 3.6. Privacy và authorization thuộc data model

Quyền hiển thị phải được kiểm tra tại dữ liệu, API và server theo hai trục độc
lập của `VC-KT-002`: Data Scope (Mục 6-7 — ai được đọc bản ghi nào) và Field
Visibility bổ sung ở Mục 15 tài liệu này (trường nào trong bản ghi đó thực sự
được trả về) — không chỉ ẩn trên giao diện. Dữ liệu ở mức `PRIVATE` không được
đưa vào search index, log, prompt hoặc AI context khi chủ thể xử lý không đủ
quyền theo cả hai trục.

## 4. Đối tượng và quan hệ nghiệp vụ

### 4.1. Các đối tượng lõi

```text
User Account ≠ Person/Expert Profile ≠ Organization Membership
```

- `User`: tài khoản đăng nhập và chủ thể thực hiện hành động.
- `ExpertProfile`: hồ sơ chuyên gia/nhà khoa học trên VI CONNECT.
- `Organization`: tổ chức, đơn vị, phòng thí nghiệm, doanh nghiệp hoặc cơ quan.
- `Membership/Affiliation`: quan hệ có thời gian, vai trò và trạng thái xác minh giữa chuyên gia và tổ chức.

Một người có thể thuộc nhiều tổ chức hoặc tenant nhưng không tạo một danh tính mới cho từng tổ chức.

### 4.2. Đồ thị quan hệ chính

```text
ExpertProfile
 ├── AFFILIATED_WITH ──► Organization
 ├── MEMBER_OF ────────► Organization/Laboratory
 ├── HAS_EXPERTISE ────► Expertise
 ├── HAS_CAPABILITY ───► Capability
 ├── AUTHOR_OF ────────► Publication
 ├── PARTICIPATED_IN ──► Project
 ├── DEVELOPS ─────────► Technology
 ├── USES ─────────────► Equipment
 └── COLLABORATES_WITH ► ExpertProfile/Organization
```

## 5. Phân rã chức năng

| Mã | Chức năng | Kết quả chính |
|---|---|---|
| 01.1 | Định danh chuyên gia | Một hồ sơ gắn đúng người, có định danh trong/ngoài hệ thống |
| 01.2 | Hồ sơ chuyên gia | Hồ sơ có cấu trúc, tối thiểu nhập thủ công |
| 01.3 | Consent và kết nối nguồn | Phạm vi thu thập minh bạch, có thể thu hồi |
| 01.4 | Tự động tìm và làm giàu | Candidate profile và field proposals có nguồn |
| 01.5 | Review và xác nhận nhanh | Đồng ý, không đồng ý hoặc điều chỉnh từng đề xuất |
| 01.6 | Xác thực chuyên gia | Phân biệt tài khoản, tổ chức và định danh ngoài đã xác thực |
| 01.7 | Hồ sơ và định danh tổ chức | Hồ sơ tổ chức có nguồn, cấu trúc và định danh tin cậy |
| 01.8 | Quan hệ chuyên gia–tổ chức | Nhiều affiliation, lịch sử và bằng chứng |
| 01.9 | Chuyên môn và năng lực | Expertise, Capability và bằng chứng tách biệt |
| 01.10 | Claim, chống trùng và hợp nhất | Một người–một hồ sơ đích, có rollback và audit |
| 01.11 | Quyền riêng tư và chia sẻ | Kiểm soát field-level visibility |
| 01.12 | Hồ sơ máy đọc được | Dữ liệu an toàn cho Search, Graph, Match và AI |
| 01.13 | Đồng bộ và cập nhật định kỳ | Phát hiện thay đổi nhưng không tự ghi đè |

## 6. Nguồn dữ liệu và chính sách sử dụng

### 6.1. Nhóm nguồn ưu tiên

| Nhóm nguồn | Ví dụ | Mục đích | Điều kiện |
|---|---|---|---|
| Nguồn người dùng xác thực | ORCID OAuth, email tổ chức | Xác nhận định danh và lấy dữ liệu được cấp quyền | Consent và OAuth scope phù hợp |
| Nguồn học thuật mở | OpenAlex, Crossref/DOI | Công bố, chủ đề, đồng tác giả, affiliation | Lưu provenance, tuân thủ giấy phép và rate limit |
| Nguồn định danh tổ chức | ROR | Đối sánh tổ chức nghiên cứu | Không tự liên kết chỉ vì tên gần giống |
| Nguồn chính thức của tổ chức | Website viện/trường/tổ chức | Chức danh, đơn vị, hồ sơ công khai | Kiểm tra điều khoản sử dụng và độ tin cậy |
| Nguồn nội bộ được phép | Nhân sự, đề tài, dự án, hội viên | Affiliation, vai trò, kết quả | Contract versioned, authorization và mục đích hợp lệ |
| Nguồn thương mại | Scopus, Web of Science | Bổ sung công bố và chỉ số | Chỉ sử dụng khi có giấy phép/quyền API phù hợp |

Không thu thập chỉ vì dữ liệu xuất hiện công khai. Mỗi connector phải được đánh giá mục đích, quyền sử dụng, điều khoản dịch vụ, dữ liệu cá nhân, lưu giữ và cơ chế xóa trước khi hoạt động.

### 6.2. Thứ tự tin cậy tham khảo

```text
Nguồn được xác thực bởi người dùng/tổ chức
→ Nguồn định danh hoặc xuất bản chính thức
→ Nguồn cơ quan có thẩm quyền
→ Nguồn mở có cấu trúc
→ Nguồn website công khai
→ Suy luận AI
```

Thứ tự trên không thay thế quyết định của người dùng và không được dùng làm quy tắc tuyệt đối. Mỗi loại trường cần chính sách nguồn riêng.

## 7. Luồng nghiệp vụ trung tâm

### 7.1. Khởi tạo và làm giàu hồ sơ

```text
NGƯỜI DÙNG ĐĂNG NHẬP
        ↓
Hiển thị thông báo và lấy CONSENT theo nguồn/mục đích
        ↓
Nhập tối thiểu một hoặc nhiều tín hiệu:
Tên | email tổ chức | ORCID | tổ chức
        ↓
Tìm candidate trong VI CONNECT và các nguồn được phép
        ↓
Identity Resolution trả danh sách ứng viên + lý do + độ tin cậy
        ↓
Người dùng chọn “Đây là tôi” hoặc “Không phải tôi”
        ↓
Hệ thống thu thập và chuẩn hóa dữ liệu
        ↓
Tạo Candidate Profile + Field Proposals
        ↓
Người dùng review:
ĐỒNG Ý | KHÔNG ĐỒNG Ý | ĐIỀU CHỈNH
        ↓
Ghi dữ liệu chính thức + provenance + audit
        ↓
Chọn visibility và dữ liệu được dùng cho Search/Match
```

### 7.2. Xác nhận nhanh

Giao diện phải hỗ trợ:

- `Đồng ý tất cả đề xuất an toàn` đối với đề xuất độ tin cậy cao, không nhạy cảm và không xung đột.
- `Xem thông tin có xung đột`.
- `Không phải thông tin của tôi`.
- `Chỉnh sửa trước khi chấp nhận`.
- `Không sử dụng nguồn này nữa`.
- `Để xem sau` mà không coi là đồng ý.

Không cho phép chấp nhận hàng loạt mặc định đối với dữ liệu nhạy cảm, định danh có tranh chấp, affiliation quan trọng, đề xuất độ tin cậy thấp hoặc thông tin làm thay đổi quyền truy cập.

### 7.3. Cập nhật định kỳ

```text
Lịch đồng bộ hoặc sự kiện từ connector
        ↓
Phát hiện dữ liệu mới/thay đổi
        ↓
So sánh với dữ liệu đã xác nhận
        ↓
Tạo đề xuất mới, không ghi đè
        ↓
Thông báo người dùng
        ↓
Đồng ý | Không đồng ý | Điều chỉnh
```

Người dùng có thể tạm dừng đồng bộ, thu hồi consent hoặc ngắt từng nguồn.

## 8. Hồ sơ chuyên gia

### 8.1. Nhóm dữ liệu

| Nhóm | Trường tiêu biểu |
|---|---|
| Identity | Họ tên, tên ưu tiên, ảnh, học hàm/học vị, quốc gia, ngôn ngữ |
| Contact | Email cơ quan, email thay thế, điện thoại, website, liên kết nghề nghiệp |
| Affiliation | Tổ chức, đơn vị, phòng thí nghiệm, chức vụ, vai trò, thời gian |
| Education | Bằng cấp, lĩnh vực, cơ sở đào tạo, quốc gia, thời gian |
| Research | Lĩnh vực, chủ đề, từ khóa, chuyên môn, mối quan tâm |
| Output | Công bố, bằng sáng chế, phần mềm, dữ liệu, tiêu chuẩn, công nghệ, kết quả nghiên cứu |
| Project | Đề tài/dự án, vai trò, cơ quan tài trợ, thời gian, kết quả |
| Collaboration | Có thể cung cấp, đang tìm kiếm, sẵn sàng tư vấn/đánh giá/tham gia dự án, khu vực ưu tiên |

Giới tính, email cá nhân, điện thoại và dữ liệu nhạy cảm khác là tùy chọn, mặc định riêng tư và không cần thiết để hồ sơ đạt trạng thái hoàn thiện cơ bản.

### 8.2. Giá trị riêng của VI CONNECT

Các trường `CanProvide`, `LookingFor`, `CollaborationInterest`, `Availability`, `TechnologyAvailable`, `FundingNeed`, `IndustryInterest` và `PreferredRegion` tạo khả năng kết nối thực tế. AI có thể đề xuất từ bằng chứng, nhưng người dùng phải xác nhận trước khi sử dụng cho matching.

## 9. Định danh và identity resolution

### 9.1. Định danh

Hệ thống sử dụng ID nội bộ ổn định và liên kết các định danh ngoài, gồm ORCID, OpenAlex Author ID, ISNI, ROR, DOI và các ID nội bộ hợp lệ. Định danh ngoài không thay thế khóa nội bộ.

Phải phân biệt:

```text
ENTERED        // người dùng hoặc hệ thống nhập
MATCHED        // đối sánh được nhưng chưa xác thực quyền sở hữu
AUTHENTICATED  // xác thực qua cơ chế chính thức như OAuth
DISPUTED       // đang tranh chấp hoặc có tín hiệu mâu thuẫn
REVOKED        // liên kết đã bị thu hồi
```

### 9.2. Tín hiệu đối sánh người

Identity Resolution phải kết hợp nhiều tín hiệu:

```text
ORCID | email tổ chức | họ tên | affiliation | đồng tác giả
DOI/công bố | lĩnh vực | lịch sử công tác | nguồn nội bộ được phép
```

Không xác định cùng một người chỉ dựa vào tên gần giống. Kết quả phải trả về điểm, các tín hiệu đồng thuận/mâu thuẫn, phiên bản thuật toán và lời giải thích dễ hiểu.

### 9.3. Trạng thái xử lý trùng

```text
POTENTIAL_DUPLICATE | LIKELY_SAME | CONFIRMED_SAME
DIFFERENT_PERSON | MERGED
```

Hợp nhất hồ sơ phải giữ `MergeHistory`, bản ghi nguồn, ánh xạ ID cũ, người phê duyệt, lý do và khả năng rollback. Không xóa cứng dữ liệu nguồn sau merge.

## 10. Hồ sơ và định danh tổ chức

Hồ sơ tổ chức gồm:

- Tên chính thức, tên ngắn, tên tiếng Anh, tên cũ.
- Loại hình, cơ quan chủ quản, đơn vị trực thuộc và quan hệ tổ chức.
- ROR, mã số thuế, giấy đăng ký, giấy phép KH&CN, tên miền và website.
- Địa chỉ, tỉnh/thành, quốc gia và thông tin liên hệ.
- Lĩnh vực, chuyên môn, công nghệ, phòng thí nghiệm, thiết bị và dịch vụ.
- Quan hệ cha–con, thành viên, trực thuộc, vận hành, đồng sáng lập và đối tác.

Đối sánh tổ chức phải xét tối thiểu tên, tên viết tắt, domain, địa chỉ, tổ chức cha, ROR và email domain. Kết quả phải có bằng chứng; không tự hợp nhất chỉ dựa vào tên.

## 11. Affiliation và quan hệ tổ chức

Một chuyên gia có thể có nhiều affiliation đồng thời và trong lịch sử. Mỗi quan hệ cần:

```text
ExpertProfileId | OrganizationId | Department/Laboratory
Position | Role | StartDate | EndDate | IsPrimary
AffiliationType | VerificationStatus
Source | Evidence | VerifiedBy | VerifiedAt
```

Ví dụ một người có thể đồng thời là nhân sự của viện, chuyên gia VI CONNECT, tư vấn cho doanh nghiệp và thành viên của một hội. Các quan hệ này không được thu gọn thành một `organizationId` duy nhất trong mô hình đích.

## 12. Expertise, Capability và bằng chứng

- `Expertise`: người này có kiến thức trong lĩnh vực gì.
- `Capability`: người này có thể thực hiện công việc gì.
- `Evidence`: căn cứ cho expertise hoặc capability.

```text
Capability
 ├── Publication
 ├── Project
 ├── Certificate
 ├── Patent
 ├── Technology
 ├── Standard/Assessment record
 └── Organization verification
```

AI được phép suy luận và xếp hạng đề xuất nhưng phải lưu phiên bản model/thuật toán, các yếu tố chính và bằng chứng. Capability quan trọng không được chuyển thành trạng thái được công nhận chỉ bằng suy luận AI.

## 13. Candidate value và provenance

### 13.1. Mô hình đề xuất ở cấp trường

```text
FieldProposal
  id
  profileId
  fieldPath
  proposedValue
  normalizedValue
  currentValueSnapshot
  sourceId
  sourceRecordId
  sourceUrl
  collectedAt
  extractionMethod
  modelOrRuleVersion
  confidence
  evidence
  conflictFlags
  decision: PENDING | ACCEPTED | REJECTED | EDITED | SUPERSEDED
  decidedValue
  decidedBy
  decidedAt
```

### 13.2. Quy tắc xung đột

1. Không ghi đè giá trị đã xác nhận.
2. Hiển thị song song giá trị hiện tại và các giá trị đề xuất.
3. Nêu rõ điểm giống, điểm khác, nguồn và độ mới.
4. Người dùng chọn giá trị chính thức hoặc tự điều chỉnh.
5. Quyết định từ chối được lưu để tránh đề xuất lặp lại không cần thiết.
6. Thay đổi chính thức phải có audit và khả năng truy ngược.

### 13.3. Dữ liệu AI tạo sinh

Tóm tắt tiểu sử, headline hoặc mô tả năng lực do AI soạn phải được gắn nhãn `AI-generated draft`, dẫn tới các bằng chứng đã dùng và chỉ công bố sau khi người dùng đồng ý hoặc chỉnh sửa.

## 14. Xác thực và mức tin cậy

Các trạng thái xác thực hiện hành `UNVERIFIED | PENDING | VERIFIED | REJECTED` tiếp tục được tôn trọng cho đến khi có migration được phê duyệt. Giao diện phải hiển thị riêng các khía cạnh:

```text
Tài khoản đã xác minh
ORCID đã xác thực
Affiliation đã được tổ chức xác nhận
Hồ sơ đã được VI CONNECT xác minh
```

Không suy ra “VI CONNECT Verified” chỉ từ ORCID OAuth, số lượng công bố hoặc điểm AI.

## 15. Quyền riêng tư và chia sẻ

Không định nghĩa lại Data Scope. `VC-KT-002` Mục 6-7 đã chốt trục kiểm soát
**bản ghi nào được đọc** (`OWN | ORGANIZATION | PARTY | PLATFORM | PLATFORM*`)
và Mục 8 dự trù một giá trị `Visibility` **tách khỏi Scope** cho đúng lúc xuất
hiện dữ liệu nhạy cảm cấp trường — Cấu phần 01 là cấu phần đầu tiên thực sự cần
trục đó (email cá nhân, điện thoại, funding need... không thể kiểm soát chỉ
bằng trạng thái publish của cả bản ghi). Mục này đề xuất kích hoạt giá trị đó.

### 15.1. Field Visibility — đề xuất, chưa khoá

```text
PRIVATE | ORGANIZATION | VI_CONNECT | PUBLIC
```

- `PRIVATE`: chỉ chủ hồ sơ và role có quyền quản trị dữ liệu (`PLATFORM` theo
  Data Scope, tức `SUPERADMIN`).
- `ORGANIZATION`: user cùng `organizationId` — khớp thẳng giá trị
  `ORGANIZATION` đã có ở Data Scope.
- `VI_CONNECT`: mọi user đã đăng nhập trên nền tảng. **Cố ý không đặt tên là
  `PLATFORM`** để tránh trùng chữ nhưng ngược nghĩa với Data Scope `PLATFORM`
  (ở đó `PLATFORM` nghĩa là "chỉ `SUPERADMIN`", không phải "toàn nền tảng").
- `PUBLIC`: không cần đăng nhập — khớp hành vi `PLATFORM*`/trạng thái
  `PUBLISHED` đã có ở `VC-KT-002` Mục 8.

Field Visibility và Data Scope cộng gộp khi trả API: bản ghi phải qua được
Data Scope trước (server có cho request này đọc bản ghi không), sau đó mỗi
trường chỉ trả về nếu người gọi cũng đạt Field Visibility của trường đó.

Đây là **đề xuất mở rộng `VC-KT-002`**, không phải nội dung đã có sẵn trong đó —
phải được xác nhận/nhập vào `VC-KT-002` (cập nhật tài liệu hoặc ADR riêng)
trước khi code hoá, xem Mục 22.

### 15.2. Mặc định đề xuất theo trường

| Dữ liệu | Mặc định đề xuất |
|---|---|
| Họ tên, tổ chức, chuyên môn | Theo trạng thái publish (`VC-KT-002` Mục 8) và lựa chọn chủ hồ sơ; mặc định `PUBLIC` khi hồ sơ đã publish |
| ORCID và công bố | Theo lựa chọn liên kết/chia sẻ của chủ hồ sơ; mặc định `PUBLIC` |
| Email cá nhân, điện thoại | `PRIVATE` |
| Funding need, availability | `VI_CONNECT` mặc định, có thể hạ xuống `ORGANIZATION` theo lựa chọn |
| Field proposal chưa quyết định | `PRIVATE` |
| Tín hiệu identity resolution, conflict và merge | Chỉ chủ thể và role có permission liên quan theo `VC-KT-002` Mục 7 (`expertProfile.verify` và tương đương) |

Consent xử lý dữ liệu và Field Visibility công bố là hai quyết định khác nhau. Đồng ý cho hệ thống đọc một nguồn không đồng nghĩa đồng ý công khai dữ liệu từ nguồn đó.

## 16. Hồ sơ máy đọc được

Đầu ra cho Search, Knowledge Graph, Match và AI phải có schema version và chỉ chứa dữ liệu mà người gọi được phép sử dụng:

```yaml
schema_version: "1.0"
profile:
  identity: {}
  affiliations: []
  expertise: []
  capabilities: []
  outputs: []
  collaboration:
    provides: []
    seeks: []
  provenance_summary: []
  visibility_scope: "requester-specific"
```

Không đưa dữ liệu riêng tư, field proposals chưa quyết định hoặc tín hiệu chống trùng nhạy cảm vào hồ sơ AI thông thường.

## 17. Mô hình dữ liệu nghiệp vụ

### 17.1. Thực thể chính

```text
Users
ExpertProfiles
Organizations
Memberships / ExpertAffiliations
Identifiers
Consents
ExternalSources
ExternalConnections
ExternalRecords
FieldProposals
FieldProvenances
Expertise
Capabilities
CapabilityEvidence
ProfileClaims
IdentityMatches
MergeHistories
PrivacySettings
SyncJobs
AuditLogs
```

### 17.2. Nguyên tắc ánh xạ code

- Không tạo song song `Researcher` nếu `ExpertProfile` vẫn là model chuẩn.
- Mở rộng schema hiện hành bằng ADR và migration mới; không sửa/xóa migration đã chia sẻ.
- DTO của nguồn ngoài không được dùng trực tiếp làm model domain hoặc Prisma.
- Quy tắc nghiệp vụ thuần đặt tại `lib/domain/` và có unit test.
- Connector đặt tại `lib/integrations/` và dùng contract có version.
- Authorization được kiểm tra ở server theo VC-KT-002.

### 17.3. Ràng buộc tối thiểu

- Một external identifier đã xác thực chỉ liên kết với một golden profile cùng loại, trừ khi đang tranh chấp.
- Consent và token kết nối phải tách khỏi hồ sơ công khai.
- Mọi xác thực lưu chủ thể, phương thức, thời gian và bằng chứng.
- Mọi merge lưu nguồn, đích, lý do, người phê duyệt và dữ liệu rollback.
- Soft delete/retire được ưu tiên cho hồ sơ định danh và dữ liệu có audit.
- Dữ liệu nhạy cảm không xuất hiện trong search index, log hoặc AI context trái quyền.

## 18. Dịch vụ và API nghiệp vụ

API chính thức sử dụng namespace có version `/api/v1/ho-so-dinh-danh`. Danh sách capability tối thiểu:

```text
Profile: đọc, cập nhật, publish, retire
Consent: cấp, xem, thay đổi, thu hồi
External connection: connect, refresh, disconnect
Discovery: tìm candidate profile
Identity resolution: đối sánh và giải thích
Enrichment: tạo job, xem tiến trình, retry có kiểm soát
Proposal review: accept, reject, edit, bulk-safe-accept
Claim: yêu cầu nhận hồ sơ và xử lý tranh chấp
Verification: xác minh tài khoản, affiliation, identifier và hồ sơ
Merge: đề xuất, phê duyệt, rollback
Organization: đọc, cập nhật, đối sánh và cấu trúc
Privacy: thiết lập visibility theo trường/nhóm trường
```

Yêu cầu chung:

- Endpoint có version, idempotency khi phù hợp và audit log.
- Enrichment, crawling và identity resolution chạy bất đồng bộ, trả job ID.
- Có timeout, retry/backoff, rate limit handling, circuit breaker và chống tạo trùng.
- Search và candidate lookup phải chống enumeration.
- Không trả email/điện thoại riêng tư hoặc token qua API công khai.
- Kết quả AI trả kèm lý do, bằng chứng và phiên bản model/rule.

## 19. User stories trọng tâm

### US-01 — Khởi tạo hồ sơ tối thiểu

Là một chuyên gia, tôi muốn đăng nhập và chỉ cung cấp tín hiệu nhận diện tối thiểu để hệ thống tự tìm hồ sơ phù hợp thay vì nhập lại CV.

### US-02 — Kiểm soát nguồn

Là chủ thể dữ liệu, tôi muốn biết hệ thống lấy dữ liệu từ đâu và có thể đồng ý, từ chối hoặc ngắt từng nguồn.

### US-03 — Xác nhận đề xuất

Là chủ hồ sơ, tôi muốn xem giá trị hiện tại, giá trị AI đề xuất, nguồn và độ tin cậy để chọn đồng ý, không đồng ý hoặc điều chỉnh.

### US-04 — Xác nhận nhanh an toàn

Là chủ hồ sơ, tôi muốn chấp nhận hàng loạt các đề xuất an toàn, không xung đột để giảm tối đa thao tác cập nhật.

### US-05 — Báo nhầm người

Là người dùng, tôi muốn chọn “Không phải tôi” khi kết quả đối sánh sai để ngăn dữ liệu của người khác vào hồ sơ.

### US-06 — Bảo vệ dữ liệu đã xác nhận

Là chủ hồ sơ, tôi muốn dữ liệu mới từ nguồn ngoài chỉ trở thành đề xuất và không ghi đè quyết định trước đây của tôi.

### US-07 — Chia sẻ có kiểm soát

Là chủ hồ sơ, tôi muốn chọn dữ liệu nào được dùng cho Search và Match mà không phải công khai email hoặc dữ liệu riêng tư.

### US-08 — Đồng bộ định kỳ

Là chủ hồ sơ, tôi muốn hệ thống phát hiện công bố, affiliation hoặc kết quả mới và gửi đề xuất để tôi duyệt.

### US-09 — Hồ sơ tổ chức

Là quản trị viên tổ chức được ủy quyền, tôi muốn xác nhận affiliation và thông tin tổ chức trong đúng data scope của mình.

### US-10 — Truy vết

Là cán bộ kiểm tra, tôi muốn truy được nguồn, bằng chứng, model/rule và người ra quyết định cho mỗi thay đổi quan trọng.

## 20. Tiêu chí nghiệm thu

1. Người dùng có thể hoàn thiện hồ sơ mà không phải nhập lại một CV dài.
2. Trước khi thu thập, hệ thống lấy consent theo nguồn và mục đích; người dùng có thể thu hồi.
3. Mọi dữ liệu từ bên ngoài được lưu trước dưới dạng candidate/field proposal, không ghi thẳng vào hồ sơ chính thức.
4. Mỗi đề xuất hiển thị giá trị, nguồn, bằng chứng, thời điểm và độ tin cậy.
5. Người dùng thực hiện được ba hành động `Đồng ý | Không đồng ý | Điều chỉnh` cho từng đề xuất.
6. Chấp nhận hàng loạt chỉ áp dụng cho đề xuất an toàn, không nhạy cảm và không xung đột.
7. Dữ liệu đã xác nhận không bị đồng bộ ngoài ghi đè.
8. Người dùng có thể báo “Không phải tôi”; hệ thống ngăn gắn dữ liệu sai người.
9. Identity resolution sử dụng nhiều tín hiệu và trả lời giải thích, không chỉ một điểm số.
10. Suy luận AI được phân biệt rõ với dữ liệu nguồn và dữ liệu đã xác minh.
11. Capability quan trọng có bằng chứng; AI không tự công nhận năng lực.
12. Consent, visibility và trạng thái xác thực được quản lý riêng biệt.
13. Trường `PRIVATE`, proposal chưa quyết định và token không rò rỉ qua API, search, log hoặc AI context.
14. Người dùng có thể tạm dừng đồng bộ, ngắt nguồn và từ chối đề xuất lặp lại.
15. Merge/dedup giữ đầy đủ lịch sử, người phê duyệt và khả năng rollback.
16. Connector nằm trong `lib/integrations/`, dùng contract versioned và có test.
17. Quy tắc nghiệp vụ nằm trong `lib/domain/` và có unit test.
18. Thay đổi schema có ADR, migration mới, kiểm thử tương thích và phương án rollback.
19. Có test cho nhầm người, hồ sơ trùng, nguồn mâu thuẫn, consent bị thu hồi, tenant isolation và rò rỉ dữ liệu.
20. Product Owner nghiệm thu luồng người dùng trên dữ liệu kiểm thử; dữ liệu demo không được dùng làm bằng chứng về VAST/HTIC.

## 21. Yêu cầu phi chức năng

### 21.1. Bảo mật và dữ liệu cá nhân

- Áp dụng least privilege, tenant-aware authorization và field-level visibility.
- Mã hóa dữ liệu nhạy cảm khi truyền và khi lưu phù hợp kiến trúc hệ thống.
- Token OAuth được mã hóa, tách khỏi hồ sơ và không xuất hiện trong log.
- Có cơ chế thu hồi kết nối, xóa/ẩn danh theo chính sách và xử lý tranh chấp.
- Thực hiện đánh giá tác động bảo vệ dữ liệu trước khi kết nối nguồn có dữ liệu cá nhân quy mô lớn.

### 21.2. Khả năng truy vết và giải thích

- Mọi proposal có provenance.
- Mọi score có phiên bản model/rule và các tín hiệu chính.
- Mọi verify, accept, reject, edit, merge và rollback có audit.
- Có thể tái dựng vì sao một giá trị được đưa vào hồ sơ tại một thời điểm.

### 21.3. Hiệu năng và độ tin cậy

- Job enrichment có queue, retry/backoff, idempotency và dead-letter handling.
- Connector có quota/rate-limit monitoring và cơ chế ngắt khi nguồn lỗi.
- Cache không làm mất khả năng truy vết nguồn hoặc hiển thị dữ liệu đã bị thu hồi.
- Mỗi lần đồng bộ có trạng thái, thống kê và lỗi theo nguồn.

### 21.4. Khả năng tiếp cận và sử dụng

- Người dùng hiểu được đề xuất mà không cần kiến thức AI.
- Badge có nhãn chữ và không chỉ phụ thuộc màu.
- So sánh giá trị hiện tại–đề xuất–nguồn phải dùng được bằng bàn phím và thiết bị di động.
- Giao diện ưu tiên xử lý ngoại lệ/xung đột, không bắt người dùng duyệt lại dữ liệu không đổi.

## 22. Các quyết định cần được khóa bằng ADR hoặc chính sách

Tài liệu đã xác định đầy đủ capability, nhưng các tham số sau không được tự suy diễn khi code:

- Bảng giá trị Field Visibility (`PRIVATE | ORGANIZATION | VI_CONNECT | PUBLIC`, Mục 15.1) và cách cộng gộp với Data Scope khi trả API — cần `VC-KT-002` xác nhận/cập nhật chính thức trước khi code hoá.
- Cấu trúc và định dạng ID công khai của chuyên gia/tổ chức nếu có.
- Ngưỡng confidence cho từng loại trường và điều kiện `bulk-safe-accept`.
- Trọng số Identity Match và Organization Match.
- Bằng chứng bắt buộc để xác nhận từng loại capability.
- Vai trò được phép xác nhận affiliation, verify và merge.
- Danh mục chuẩn cho OrganizationType, Expertise, Capability và AffiliationType.
- Chính sách lưu giữ, xóa, ẩn danh và giải quyết tranh chấp.
- Nguồn được phép crawl, API scope, giấy phép, quota và thời hạn lưu dữ liệu.
- Chu kỳ đồng bộ và chính sách thông báo theo loại nguồn.

## 23. Definition of Done

Chức năng chỉ được coi là hoàn thành khi:

- Luồng consent → discovery → identity resolution → enrichment → review → publish hoạt động end-to-end.
- Người dùng thực sự hoàn thiện được hồ sơ chủ yếu bằng đồng ý, không đồng ý hoặc điều chỉnh.
- Migration, rollback và seed/reference data đã được thử trên database thực.
- API contract và schema version được lưu trong repository.
- Unit, integration, authorization, privacy và connector tests vượt qua.
- Không có lỗ hổng làm lộ trường riêng tư, token hoặc proposal chưa quyết định.
- Mọi tích hợp dữ liệu thật có ADR và đánh giá quyền sử dụng nguồn.
- Product Owner đã nghiệm thu bằng dữ liệu kiểm thử phù hợp.
- `npm run check` và CI của repository đạt tại commit triển khai.

---

**Kết luận:** Cấu phần 01 là Identity & Profile Core của VI CONNECT. Hệ thống chủ động thu thập và chuẩn hóa thông tin từ các nguồn được phép, nhưng con người giữ quyền kiểm soát. Đầu ra là hồ sơ có cấu trúc, có provenance, có bằng chứng và có thể sử dụng an toàn cho Search, Knowledge Graph, AI Matching và giao dịch hợp tác.
