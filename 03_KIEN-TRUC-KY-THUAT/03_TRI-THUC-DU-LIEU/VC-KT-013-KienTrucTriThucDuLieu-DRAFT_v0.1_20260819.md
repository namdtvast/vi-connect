# KIẾN TRÚC KỸ THUẬT — CẤU PHẦN 03: TRI THỨC & DỮ LIỆU

**Mã tài liệu:** VC-KT-013
**Phiên bản:** v0.1
**Ngày soạn thảo:** 2026-08-19
**Trạng thái:** DRAFT — tài liệu thiết kế mục tiêu, **chưa phải căn cứ code hoá**;
xem Mục 1 về điều kiện mở
**Nơi lưu chuẩn:** `03_KIEN-TRUC-KY-THUAT/03_TRI-THUC-DU-LIEU/VC-KT-013-KienTrucTriThucDuLieu-DRAFT_v0.1_20260819.md`

## 1. Mục đích, phạm vi và điều kiện áp dụng

Tài liệu này thiết kế kiến trúc kỹ thuật mục tiêu cho **cấu phần 03 — Tri thức &
Dữ liệu** (`VC-NV-013`), sao cho khớp với baseline 11 cấu phần (`VC-NV-001`) và
không phá vỡ những gì 10 cấu phần còn lại đã hoặc sẽ dùng.

**Đây là tài liệu thiết kế, không phải lệnh code hoá.** `README.md` (mục
"Backlog Giai đoạn 2-3") và `docs/SCOPE.md` xếp cấu phần 03 vào phần **chưa xây**
của Giai đoạn 1 — hiện chưa có model/trang (`Publication`, `Patent`, `Dataset`,
`Knowledge`, `Evidence`...), đúng nguyên tắc "không mở rộng chỉ vì hoàn thành
phần mềm" mà chính đề án đặt ra. Tài liệu này chuẩn bị sẵn kiến trúc mục tiêu để
khi đề án phê duyệt mở Giai đoạn kế tiếp, việc code hoá đi thẳng vào PR theo
đúng kế hoạch Mục 12, không phải thiết kế lại từ đầu — cùng tinh thần tách
"thiết kế" khỏi "code hoá" đã áp dụng ở `VC-KT-002`/`VC-KT-003`. Không migration,
không route, không action nào được tạo ra từ tài liệu này.

Phạm vi tài liệu: vị trí cấu phần 03 trong kiến trúc 11 cấu phần (Mục 4), hiện
trạng mã nguồn đã liên quan tới "tri thức/bằng chứng" dù chưa gán đúng cấu phần
(Mục 5), mô hình dữ liệu đề xuất (Mục 6), phân quyền (Mục 7), tích hợp nguồn
ngoài và ranh giới MANLAB-AIOS (Mục 8-9), đối chiếu ISO (Mục 10), khoảng trống
và điều kiện mở (Mục 11), kế hoạch triển khai kỹ thuật nếu được duyệt (Mục 12).

## 2. Căn cứ

- `VC-NV-001` — baseline 11 cấu phần, nhóm DATA và ánh xạ ISO của từng cấu phần.
- `VC-NV-013` — mô tả nghiệp vụ cấu phần 03 (nhóm DATA: `Publication`, `Patent`,
  `Dataset`, `Knowledge`, `Evidence`; ISO 56001:2024 Clause 7, ISO 56006:2021).
- `README.md`, `docs/SCOPE.md` — xác nhận cấu phần 03 thuộc Backlog Giai đoạn 2-3.
- `ARCHITECTURE.md` — ranh giới MANLAB-AIOS, quy tắc `lib/domain`/`lib/actions`/
  `lib/integrations`.
- `docs/MANLAB-AIOS-MAPPING.md` — dòng "Tri thức và taxonomy → M26 Tri thức
  (Taxonomy/API)" và dòng "Tài sản trí tuệ → M27 (Metadata/quyền)".
- `VC-KT-002` (phân quyền), `VC-KT-003` (bảo mật) — mô hình Role/Permission/Scope
  và nguyên tắc bảo mật dùng chung, tài liệu này chỉ **thêm dòng**, không định
  nghĩa lại.
- Mã nguồn thật đã xác minh: `prisma/schema.prisma`, `lib/integrations/crossref.ts`,
  `lib/integrations/openalex.ts`, `lib/integrations/orcid.ts`, `lib/integrations/ror.ts`,
  `lib/domain/identity.ts`, `lib/actions/experts.ts`.

## 3. Nguyên tắc thiết kế

1. Không tạo cấu phần thứ 12. Mọi model/route mới đặt dưới `03_tri-thuc-du-lieu`
   (`VC-NV-001` Mục 4) — AI/Knowledge Graph/Search Engine chỉ là lớp dùng chung,
   không phải cấu phần riêng.
2. **Không nhân bản khái niệm đã tồn tại.** Mục 5 cho thấy Component 01 đã có
   một phần "bằng chứng"/"nguồn ngoài" ở dạng thu hẹp (`CapabilityEvidence`,
   `ExternalConnection`, `lib/integrations/crossref.ts`/`openalex.ts`). Thiết kế
   ở Mục 6 phải **tổng quát hoá và tái sử dụng**, không tạo bảng/adapter song
   song làm hai nguồn sự thật khác nhau cho cùng một dữ liệu.
3. Phân quyền cho resource mới chỉ **thêm dòng** vào ma trận `VC-KT-002` Mục 7,
   dùng đúng Role (Mục 5) và Data Scope (Mục 6) đã có — không phát minh cơ chế
   phân quyền riêng cho cấu phần 03.
4. Đối chiếu hiện trạng thật (đã có gì, ở file/dòng nào) trước khi đề xuất mới —
   cùng nguyên tắc `VC-KT-003` Mục 3, điểm 2.
5. Tương xứng quy mô Giai đoạn 1-2 (152 hội thành viên, 624 tổ chức KH&CN theo
   `docs/SCOPE.md`) — không dựng knowledge graph/search engine chuyên dụng khi
   số bản ghi còn nhỏ; bắt đầu bằng bảng quan hệ + index, đúng tinh thần
   `VC-KT-002` Mục 3, điểm 8 ("không tổng quát hoá quá mức khi số lượng còn nhỏ").
6. Không mở permission `funding.*`/giải ngân/đầu tư qua cấu phần này dưới bất kỳ
   hình thức nào (`AGENTS.md`).

## 4. Vị trí trong kiến trúc 11 cấu phần

Theo `VC-NV-001` Mục 2, cấu phần 03 thuộc nhóm **CONNECT** cùng 01 (Hồ sơ & Định
danh), 02 (Công nghệ & Giải pháp), 04 (Bài toán & Nhu cầu). Vai trò của 03 trong
nhóm này: cung cấp **lớp bằng chứng và tri thức nền** mà 01, 02, 04 tham chiếu
tới thay vì tự lưu lặp lại.

| Cấu phần | Quan hệ với 03 — Tri thức & Dữ liệu |
|---|---|
| 01 — Hồ sơ & Định danh | `ExpertProfile` là **tác giả/nhà sáng chế** của `Publication`/`Patent`; `Capability`/`CapabilityEvidence` hiện là bản thu hẹp của khái niệm Evidence (Mục 5) — cần hợp nhất, không xây song song. |
| 02 — Công nghệ & Giải pháp | `IP` (nhóm DATA của 02) là **tài sản** của tổ chức gắn với một `Technology`/`Solution`; `Patent` (nhóm DATA của 03) là **bản ghi tri thức có thể tra cứu** (ai sáng chế gì, khi nào, tình trạng pháp lý). Khi một patent thuộc sở hữu một tổ chức trên nền tảng, `IP` (02) tham chiếu `Patent.id` (03) thay vì chép lại metadata — xem Mục 6.3. |
| 04 — Bài toán & Nhu cầu | `Need`/`Challenge` có thể đính kèm `Evidence` (VD: dữ liệu hiện trạng, `Publication` mô tả vấn đề) để chuẩn hoá đầu bài trước khi đưa vào ghép nối. |
| 05 — Tìm kiếm & Ghép nối | `Evidence`/`Publication`/`Patent`/`Dataset` là **nguồn dữ liệu bổ sung** cho `lib/matching.ts` (đối chiếu từ khoá/`fields`) và cho phần "lý do" (`Match.reasons`) hiển thị bằng chứng cụ thể thay vì chỉ điểm số — không thay thế thuật toán hiện có, chỉ mở rộng tập tín hiệu đầu vào. |
| 06 — Nguồn lực & Tài trợ | `Knowledge` (báo cáo xu hướng, strategic intelligence) có thể là căn cứ tham khảo khi tổ chức công bố `FundingSource`, nhưng **không** tạo quan hệ ghi (03 không quyết định phê duyệt tài trợ). |
| 07 — Dự án & Giao dịch | `Deliverable` của một `Project` có thể **trở thành** một `Publication`/`Dataset`/`Patent` mới sau khi dự án hoàn thành — quan hệ một chiều, ghi nhận nguồn gốc (`sourceProjectId?` — xem Mục 6.2). |
| 08 — Thẩm định & Đánh giá | `Review`/`Evaluation` (khi cấu phần 08 được xây) dùng `Evidence` làm căn cứ thẩm định — 03 chỉ cung cấp dữ liệu, không tự đánh giá. |
| 09 — Cộng tác & Mạng lưới | Đồng tác giả (`PublicationAuthor` nhiều `ExpertProfile`) là tín hiệu hình thành mạng lưới cộng tác — dữ liệu thô cho 09, không phải chức năng của 03. |
| 10 — Quản trị & Tuân thủ | Bản quyền/quyền khai thác dữ liệu (license của `Dataset`, quyền công bố của `Publication`) phải đối chiếu `06_PHAP-LY-TUAN-THU` trước khi mở public — xem Mục 11, điểm 3. |
| 11 — Phân tích & Tác động | Số lượng `Publication`/`Patent`/`Dataset` đã verify là **input tính KPI** (VD: "sản phẩm tri thức được công bố") cho `KpiSnapshot` — 03 cung cấp số liệu nguồn, 11 tổng hợp hiển thị. |

## 5. Hiện trạng mã nguồn — điểm bắt buộc phải đối chiếu trước khi thiết kế mới

Xác minh trực tiếp từ `prisma/schema.prisma` và `lib/integrations/`: cấu phần 03
**chưa có model riêng**, nhưng một phần khái niệm của nó đã tồn tại dưới dạng
**thu hẹp trong cấu phần 01**. Đây là phát hiện quan trọng nhất của tài liệu —
Mục 6 phải thiết kế sao cho tổng quát hoá được phần này, không tạo hệ thống
song song.

| Khái niệm cấu phần 03 | Đã có gì trong mã nguồn hôm nay (file:dòng) | Giới hạn hiện tại |
|---|---|---|
| `Evidence` | `model CapabilityEvidence` (`prisma/schema.prisma:339-349`) — `type` (`CapabilityEvidenceType`: `PUBLICATION, PROJECT, CERTIFICATE, PATENT, TECHNOLOGY, ORGANIZATION_VERIFICATION`), `description` tự do, `referenceUrl?` | Chỉ gắn được với **một** `Capability` của **một** `ExpertProfile` — không dùng lại được cho `Need`/`Solution`/`Match`; không có bản ghi cấu trúc (chỉ mô tả text + URL rời rạc), không dedup. |
| `Publication` (bằng chứng công bố) | `ExpertProfile.publications Int? @default(0)` (`prisma/schema.prisma:117`) | Chỉ là **bộ đếm** tự khai/nhập tay, không có bản ghi thật đứng sau — không biết công bố nào, DOI nào, đồng tác giả nào. |
| `Patent` (bằng chứng sáng chế) | `ExpertProfile.patents Int? @default(0)` (`prisma/schema.prisma:118`) | Cùng giới hạn như trên — chỉ là số đếm, không có bản ghi patent thật. |
| Nguồn ngoài công bố khoa học | `lib/integrations/crossref.ts` (tra DOI → `CrossrefWork {doi, title, authors, containerTitle, year}`), `lib/integrations/openalex.ts` (tra ORCID → `OpenAlexAuthor {openAlexId, worksCount, citedByCount, hIndex, topics}`) — cả hai đã là **adapter thật**, gọi API mở, không mock. | Hiện chỉ được gọi trong luồng xác minh hồ sơ chuyên gia (`VC-NV-011`, Component 01) để **làm giàu identity**, không ghi lại thành bản ghi `Publication` độc lập tái sử dụng được cho toàn nền tảng. |
| Định danh ngoài dùng chung | `enum IdentifierType {VAST_ID, ORCID, ISNI, ROR, DOI}` + `model Identifier` (`prisma/schema.prisma:155-173`), `enum ExternalSourceType {ORCID, OPENALEX, CROSSREF, ROR, ORG_WEBSITE, INTERNAL, COMMERCIAL}` (`prisma/schema.prisma:205-213`) | Đã có `DOI` sẵn trong `IdentifierType` và `CROSSREF`/`OPENALEX` sẵn trong `ExternalSourceType` — tức schema hiện tại **đã dự phòng chỗ** cho khái niệm Publication mà chưa có model đứng sau. Đây là tín hiệu thiết kế ban đầu đã đi đúng hướng, chỉ chưa hoàn thiện. |
| Cơ chế dedup bản ghi trùng | `model IdentityMatch` + `model MergeHistory` (`prisma/schema.prisma:382-420`) — dùng cho trùng lặp `ExpertProfile` | Là mẫu thiết kế tốt để **tham khảo** (không sao chép nguyên) cho việc chống trùng `Publication`/`Patent` lấy từ nhiều nguồn (Crossref DOI trùng OpenAlex work id) — xem Mục 6.4. |

Kết luận Mục 5: cấu phần 03 không bắt đầu từ số 0. Việc "chưa có model/trang"
(README.md) chỉ đúng ở mức **cấu phần độc lập**; ở mức khái niệm, nền tảng đã
có adapter nguồn ngoài thật, đã có chỗ trống trong enum, và đã có một bản dùng
thử thu hẹp (`CapabilityEvidence`) đang chạy trong Component 01. Thiết kế Mục 6
phải tương thích ngược với các phần này.

## 6. Mô hình dữ liệu đề xuất (DRAFT — chưa code hoá)

Ký hiệu Prisma dùng minh hoạ, giữ đúng quy ước hiện có của repo: `id String
@id @default(cuid())`, `createdAt/updatedAt`, FK tổ chức đặt tên
`organizationId`, mọi model resource-chính có `@@index` theo trường lọc chính
(giống `Need`/`Supply`).

### 6.1 Nhóm bản ghi tri thức cốt lõi

```prisma
enum PublicationType {
  JOURNAL_ARTICLE
  CONFERENCE_PAPER
  BOOK
  BOOK_CHAPTER
  PREPRINT
  TECHNICAL_REPORT
  OTHER
}

model Publication {
  id             String            @id @default(cuid())
  title          String
  abstract       String?
  type           PublicationType   @default(OTHER)
  containerTitle String?           // ten tap chi/ky yeu hoi thao
  year           Int?
  fields         String[]          // linh vuc, cung taxonomy voi Need/Supply.fields

  doi            String?           @unique
  sourceType     ExternalSourceType @default(INTERNAL) // tai su dung enum da co (Muc 5)
  sourceRecordId String?           // id ban ghi tai nguon (VD: OpenAlex work id)

  organizationId String?           // to chuc chu quan cong bo, null = ca nhan/ben ngoai
  organization   Organization?     @relation(fields: [organizationId], references: [id])

  sourceProjectId String?          // Deliverable cua Project (07) tro thanh publication
  sourceProject   Project?         @relation(fields: [sourceProjectId], references: [id])

  verificationStatus VerificationStatus @default(UNVERIFIED) // tai su dung enum da co
  verifiedById       String?
  verifiedAt         DateTime?

  authors PublicationAuthor[]
  evidenceOf Evidence[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([verificationStatus, type])
  @@index([sourceType, sourceRecordId])
}

model PublicationAuthor {
  id              String        @id @default(cuid())
  publicationId   String
  publication     Publication   @relation(fields: [publicationId], references: [id], onDelete: Cascade)
  expertProfileId String?       // null = tac gia chua co ho so tren nen tang
  expertProfile   ExpertProfile? @relation(fields: [expertProfileId], references: [id])
  nameRaw         String        // ten tho tu nguon ngoai, luon luu du du chinh xac chinh ta
  order           Int           @default(0)

  @@index([expertProfileId])
  @@index([publicationId])
}
```

```prisma
enum PatentStatus {
  FILED
  PUBLISHED
  GRANTED
  REJECTED
  EXPIRED
}

model Patent {
  id                String       @id @default(cuid())
  title             String
  patentNumber      String?      // so bang, co the null khi con o trang thai FILED
  applicationNumber String?
  jurisdiction      String       @default("VN")
  status            PatentStatus @default(FILED)
  filingDate        DateTime?
  grantDate         DateTime?

  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])

  verificationStatus VerificationStatus @default(UNVERIFIED)
  verifiedById       String?
  verifiedAt         DateTime?

  inventors PatentInventor[]
  evidenceOf Evidence[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([jurisdiction, patentNumber])
  @@index([status])
}

model PatentInventor {
  id              String        @id @default(cuid())
  patentId        String
  patent          Patent        @relation(fields: [patentId], references: [id], onDelete: Cascade)
  expertProfileId String?
  expertProfile   ExpertProfile? @relation(fields: [expertProfileId], references: [id])
  nameRaw         String

  @@index([expertProfileId])
  @@index([patentId])
}
```

```prisma
enum DatasetStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Dataset {
  id             String        @id @default(cuid())
  title          String
  description    String
  fields         String[]
  format         String[]      // vd ["CSV", "API", "JSON"]
  license        String?       // rieng phap ly xac nhan truoc khi PUBLISHED — Muc 11, diem 3
  repositoryUrl  String?
  sizeBytes      BigInt?
  status         DatasetStatus @default(DRAFT)

  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id])

  evidenceOf Evidence[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
}
```

### 6.2 `Knowledge` — loại mơ hồ nhất, cần Product Owner chốt phạm vi trước khi code hoá

`VC-NV-013` chỉ ghi "quản lý tri thức, dữ liệu và strategic intelligence" —
không đủ cụ thể để thiết kế schema cuối cùng. Đề xuất tạm (tương tự cách
`ADR-0001` "tạm chốt tham số" cho Component 01) để không chặn thiết kế các
model còn lại, **nhưng phải xác nhận nghiệp vụ trước khi lên `v1.0`**:

```prisma
enum KnowledgeType {
  MARKET_INTELLIGENCE   // bao cao thi truong/xu huong cong nghe
  STANDARD_SUMMARY       // tom tat tieu chuan/quy dinh lien quan
  CASE_STUDY
  INTERNAL_NOTE
}

enum KnowledgeStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Knowledge {
  id             String          @id @default(cuid())
  title          String
  summary        String
  body           String?         // markdown, khong luu file nhi phan o day
  type           KnowledgeType
  fields         String[]
  sourceUrl      String?
  status         KnowledgeStatus @default(DRAFT)

  organizationId String?         // null = tri thuc do nen tang (VAST/HTIC) tu bien soan
  organization   Organization?   @relation(fields: [organizationId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, type])
}
```

Câu hỏi cần Product Owner trả lời trước khi hiện thực hoá (ghi nhận, không tự
quyết định vì có thể đổi kiến trúc — đúng nguyên tắc "chỉ hỏi lại khi thiếu
thông tin có thể làm thay đổi kiến trúc"):

1. `Knowledge` có cho phép tổ chức thành viên tự đăng, hay chỉ VAST/HTIC biên
   soạn tập trung (ảnh hưởng Mục 7 — Role nào có `knowledge.create`)?
2. Có cần workflow duyệt trước khi `PUBLISHED` (giống `Solution.review` ở
   Component 05) hay xuất bản tự do sau khi tạo?

### 6.3 `Evidence` — tổng quát hoá `CapabilityEvidence`, không thay thế đột ngột

`Evidence` là **lớp liên kết**, không lưu lại nội dung — nội dung thật nằm ở
`Publication`/`Patent`/`Dataset` (khi đã có bản ghi cấu trúc) hoặc mô tả tự do
(khi chưa/không có bản ghi cấu trúc, ví dụ chứng chỉ nội bộ). Thiết kế theo
đúng tinh thần `VC-KT-002` Mục 3, điểm 8: dùng bảng liên kết tường minh, **chưa**
dựng generic ReBAC/polymorphic engine vì số loại resource còn nhỏ.

```prisma
enum EvidenceType {
  PUBLICATION
  PATENT
  DATASET
  CERTIFICATE   // van giu cho truong hop khong co ban ghi cau truc (VD: chung chi noi bo)
  OTHER
}

enum EvidenceLinkEntityType {
  CAPABILITY   // thay the CapabilityEvidence — Muc 6.4
  NEED
  SOLUTION
  PROJECT
  MATCH
}

model Evidence {
  id            String       @id @default(cuid())
  type          EvidenceType
  title         String
  description   String?
  referenceUrl  String?

  publicationId String?
  publication   Publication? @relation(fields: [publicationId], references: [id])
  patentId      String?
  patent        Patent?      @relation(fields: [patentId], references: [id])
  datasetId     String?
  dataset       Dataset?     @relation(fields: [datasetId], references: [id])

  verificationStatus VerificationStatus @default(UNVERIFIED)
  verifiedById       String?
  verifiedAt         DateTime?

  links EvidenceLink[]

  createdAt DateTime @default(now())

  @@index([type, verificationStatus])
}

model EvidenceLink {
  id         String                  @id @default(cuid())
  evidenceId String
  evidence   Evidence                @relation(fields: [evidenceId], references: [id], onDelete: Cascade)
  entityType EvidenceLinkEntityType
  entityId   String                  // id cua Capability/Need/Solution/Project/Match — khong co FK cung (nhieu bang dich)

  createdAt DateTime @default(now())

  @@index([entityType, entityId])
  @@unique([evidenceId, entityType, entityId])
}
```

**Vì sao `entityId` không có FK cứng:** giống lý do `Identifier` dùng hai FK
nullable riêng cho `ExpertProfile`/`Organization` (`prisma/schema.prisma:163-173`)
thay vì một cột chung — Prisma không hỗ trợ FK trỏ tới nhiều bảng khác nhau từ
một cột. Với 5 loại đích (`EvidenceLinkEntityType`), dùng `entityId` không ràng
buộc + index là đánh đổi hợp lý (đúng tinh thần `VC-KT-002` Mục 3, điểm 8:
không tổng quát hoá quá mức, nhưng cũng không nhân bản 5 cột FK nullable như
`Identifier` vì `EvidenceLink` có thể phát sinh nhiều loại đích hơn theo thời
gian). Ràng buộc toàn vẹn (entity đích tồn tại thật) enforce ở tầng
`lib/domain/`, tương tự cách `VC-NV-011`/`ADR-0001` đã chấp nhận đánh đổi này
cho ràng buộc "1 external identifier AUTHENTICATED" (`prisma/schema.prisma:251-253`).

### 6.4 Kế hoạch hợp nhất `CapabilityEvidence` → `Evidence` (không sửa migration cũ)

Theo đúng `AGENTS.md` ("không sửa hoặc xóa migration đã được chia sẻ") và
`VC-KT-003` Mục 16 (nguyên tắc không âm thầm coi đã xong): **giữ nguyên**
`model CapabilityEvidence` hiện tại, không xoá, không đổi migration đã chạy.
Khi cấu phần 03 được duyệt xây:

1. Migration mới thêm cột nullable `CapabilityEvidence.evidenceId String?` +
   FK tới `Evidence.id`.
2. Script backfill (một lần, không phải action thường trực): với mỗi
   `CapabilityEvidence` hiện có, tạo 1 `Evidence` tương ứng (map
   `CapabilityEvidenceType` → `EvidenceType`, `description`/`referenceUrl` giữ
   nguyên) + 1 `EvidenceLink(entityType: CAPABILITY, entityId: capabilityId)`,
   rồi set `evidenceId` ngược lại.
3. Từ thời điểm đó, luồng "thêm bằng chứng năng lực" (`lib/actions/experts.ts`)
   ghi cả hai: `CapabilityEvidence` (không phá giao diện/API cũ) và `Evidence`
   (nguồn sự thật mới, tái sử dụng được cho `Need`/`Solution`/`Match`).
4. `CapabilityEvidence` không bị xoá ở bước này — chỉ đánh dấu là "view tương
   thích ngược", quyết định deprecate hẳn thuộc một tài liệu riêng sau khi
   Component 03 chạy ổn định.

### 6.5 Cập nhật liên quan tới Component 02 — tránh trùng `IP`/`Patent`

`VC-NV-001` liệt kê `IP` trong nhóm DATA của Component 02 và `Patent` trong
nhóm DATA của Component 03 — đây là **hai khái niệm khác nhau, không phải
trùng lặp cần gộp**:

- `Patent` (03) = bản ghi **tri thức có thể tra cứu**: ai sáng chế gì, ở đâu,
  khi nào, tình trạng pháp lý — phục vụ tra cứu/đối chiếu tiên nghệ (prior art)
  và làm bằng chứng năng lực.
- `IP` (02, chưa có model tại thời điểm viết tài liệu này) = **tài sản của một
  tổ chức** gắn với `Technology`/`Solution` cụ thể: quyền sở hữu, cấp phép,
  chuyển giao.

Khi Component 02 xây `IP`, thiết kế `IP.patentId String? @relation(...)` tham
chiếu `Patent.id` (03) thay vì chép lại `title`/`patentNumber`/`filingDate` —
đúng nguyên tắc "một dữ liệu — một nơi lưu" (`VC-QT-001` Mục 6). Ghi nhận ở đây
để tài liệu thiết kế `IP` sau này (nếu có) không thiết kế độc lập rồi phát
sinh trùng lặp.

## 7. Phân quyền (thêm dòng vào ma trận `VC-KT-002`, không đổi cấu trúc)

Áp dụng đúng khung Role (`VC-KT-002` Mục 5) và Data Scope (`VC-KT-002` Mục 6):
`P` = PLATFORM, `P*` = PLATFORM chỉ-PUBLISHED/VERIFIED, `O` = ORGANIZATION,
`W` = OWN, `—` = không có quyền.

| Permission | SUPERADMIN | ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `publication.view` / `patent.view` / `dataset.view` / `knowledge.view` | P | O + P* | P* | P* | P* |
| `publication.create` / `patent.create` | P | O | W¹ | — | — |
| `dataset.create` | P | O | — | O | — |
| `knowledge.create` | P | O² | — | — | — |
| `evidence.create` (gắn Evidence vào Need/Solution/Project/Match) | P | O | W (Capability của mình) | O | — |
| `publication.verify` / `patent.verify` / `evidence.verify` | P | O³ | — | — | — |
| `dataset.publish` | P | O | — | — | — |

¹ `EXPERT` tạo `Publication`/`Patent` gắn chính mình làm tác giả/sáng chế viên
(`PublicationAuthor`/`PatentInventor.expertProfileId = self`) — cùng tinh thần
`EXPERT` có `supply.*` ở scope `OWN` (`VC-KT-002` Mục 7.2, chú thích ²), vốn
cũng đang là khoảng trống chờ xác nhận nghiệp vụ, không phải đã code hoá.

² Phụ thuộc câu hỏi 1, Mục 6.2 — nếu Product Owner chốt "chỉ VAST/HTIC biên
soạn `Knowledge`", cột `ADMIN` đổi thành `—` và thêm role `SUPERADMIN`-only.

³ Theo mô hình Maker-Checker nhẹ đã dùng cho `expertProfile.verify`
(`VC-KT-002` Mục 7.1): người `verify` phải khác người `create` cùng bản ghi —
enforce ở `lib/domain/access-control.ts`, không phải ràng buộc DB.

Luồng kiểm tra quyền tại server action giữ nguyên 9 bước của `VC-KT-002` Mục 9,
không có bước riêng cho cấu phần 03. `assertOrgScope` áp dụng cho
`organizationId` trên `Publication`/`Patent`/`Dataset`/`Knowledge` giống hệt
cách áp dụng cho `Need`/`Supply` hiện tại.

## 8. Tích hợp nguồn ngoài

| Nguồn | Trạng thái | Việc cần làm khi code hoá |
|---|---|---|
| Crossref (DOI → metadata công bố) | **Đã có adapter thật** — `lib/integrations/crossref.ts` (`fetchCrossrefWorkByDoi`, `parseCrossrefWork`) | Tái sử dụng nguyên trạng để điền `Publication` khi người dùng nhập DOI — không viết adapter mới. |
| OpenAlex (ORCID → tác giả, chỉ số trích dẫn, chủ đề) | **Đã có adapter thật** — `lib/integrations/openalex.ts` (`fetchOpenAlexAuthorByOrcid`) | Dùng để gợi ý `fields`/đồng bộ danh sách `Publication` theo tác giả — hiện chỉ dùng 1 chiều (làm giàu hồ sơ), cần thêm hàm liệt kê works theo tác giả nếu muốn tự động tạo `Publication`. |
| ORCID, ROR | Đã có adapter (`lib/integrations/orcid.ts`, `lib/integrations/ror.ts`) — chưa đọc chi tiết trong tài liệu này, xác nhận lại phạm vi trước khi dùng cho Component 03. | Xác minh danh tính tác giả/tổ chức trước khi tạo `PublicationAuthor.expertProfileId`/`Publication.organizationId` tự động. |
| Techmart Vietnam, đăng ký sáng chế Việt Nam (Cục Sở hữu trí tuệ/NOIP) | **Chưa có adapter** — README liệt kê là backlog ("Tích hợp thật ORCID/OpenAlex/ROR/Techmart Vietnam") | Cần khảo sát API/khả năng truy cập công khai trước khi thiết kế `lib/integrations/noip.ts` hoặc tương đương — không có trong phạm vi tài liệu này. |

Nguyên tắc dùng chung (`VC-KT-002` Mục 12): nếu có AI Assistant truy vấn
`Publication`/`Patent`/`Dataset` thay người dùng, phải qua cùng lớp
`assertOrgScope`/permission như request thường, không dùng service account
quyền cao hơn.

## 9. Ranh giới MANLAB-AIOS

Theo `docs/MANLAB-AIOS-MAPPING.md`: "Tri thức và taxonomy → M26 Tri thức
(Taxonomy/API, trao đổi bằng mã phiên bản hoá)" và "Tài sản trí tuệ → M27 (Metadata/
quyền, quyền khai thác phải được xác nhận)". Áp dụng cho cấu phần 03:

- M26/M27 chỉ là **nguồn tham chiếu taxonomy/API** — không import trực tiếp dữ
  liệu, không sao chép hồ sơ ISO nội bộ của ETV (`ARCHITECTURE.md`).
- Khi cần đồng bộ taxonomy lĩnh vực (`fields`) giữa VI CONNECT và MANLAB-AIOS,
  đi qua adapter tại `lib/integrations/manlab/` (thư mục quy định ở
  `ARCHITECTURE.md`, hiện **chưa tồn tại**) với contract phiên bản hoá — quyết
  định tích hợp phải ghi ADR trong `docs/adr/` trước khi kết nối dữ liệu thật.
- Quyền khai thác `Dataset`/`Publication` lấy nguồn từ MANLAB-AIOS phải xác
  nhận rõ trước khi set `status: PUBLISHED` — liên quan trực tiếp Mục 11,
  điểm 3.

## 10. Đối chiếu ISO

`VC-NV-013`/`VC-NV-001` đã chốt ánh xạ ISO 56001:2024 Clause 7 (Support) và ISO
56006:2021 (Innovation management — Strategic intelligence management) cho cấu
phần 03. Đối chiếu cụ thể với mô hình dữ liệu Mục 6:

| Yêu cầu ISO 56006:2021 (Strategic intelligence) | Thành phần kiến trúc tương ứng |
|---|---|
| Thu thập thông tin từ nhiều nguồn (nội bộ/bên ngoài) | `sourceType`/`sourceRecordId` trên `Publication`, adapter Mục 8 |
| Xác minh độ tin cậy trước khi dùng ra quyết định | `verificationStatus` + luồng verify Mục 7, chú thích ³ |
| Phổ biến tri thức có kiểm soát truy cập | `status`/Data Scope Mục 7 (không mở `PLATFORM*` cho bản ghi `UNVERIFIED`/`DRAFT`) |
| Liên kết tri thức với quyết định đổi mới cụ thể | `EvidenceLink` (Mục 6.3) nối `Evidence` với `Need`/`Solution`/`Project`/`Match` |

Đây là đối chiếu ở mức thiết kế, chưa phải audit tuân thủ ISO chính thức —
tương tự cách `VC-KT-003` Mục 15 đối chiếu OWASP ở mức thiết kế, không phải
chứng nhận.

## 11. Khoảng trống & điều kiện mở (đọc trước khi cấp phép code hoá)

1. **Phê duyệt mở Giai đoạn kế tiếp** — điều kiện tiên quyết, thuộc thẩm quyền
   chủ đề án/Product Owner, không phải quyết định kỹ thuật (`docs/SCOPE.md`).
2. **Phạm vi `Knowledge` chưa chốt** — 2 câu hỏi ở Mục 6.2 phải có câu trả lời
   trước khi lên `v1.0`.
3. **Pháp lý dữ liệu mở chưa rà soát** — `Dataset.license`, quyền công bố lại
   `Publication`/dữ liệu lấy từ MANLAB-AIOS (Mục 9) cần `06_PHAP-LY-TUAN-THU`
   xác nhận trước khi cho phép `status: PUBLISHED` công khai toàn platform.
4. **Adapter Techmart Vietnam/NOIP chưa có** (Mục 8) — nếu nghiệp vụ cần patent
   Việt Nam thật ngay từ bản đầu, cần khảo sát riêng trước khi ước lượng effort.
5. **Câu hỏi nghiệp vụ B6 của `VC-KT-002`** ("`EXPERT` có được tự đăng
   `Supply`/tài sản của mình ở scope `OWN` không") **áp dụng tương tự** cho
   `publication.create`/`patent.create` ở Mục 7, chú thích ¹ — nên xác nhận
   cùng lúc để nhất quán, tránh hai lần hỏi cùng một quyết định nghiệp vụ.
6. **`EvidenceLink.entityId` không có FK cứng** (Mục 6.3) — chấp nhận đánh đổi
   theo tiền lệ `Identifier`, nhưng cần test ràng buộc toàn vẹn ở tầng domain
   trước khi coi là an toàn (tương tự khuyến nghị test tối thiểu `VC-KT-002`
   Mục 15).

## 12. Kế hoạch triển khai kỹ thuật (nếu được duyệt)

| Việc | File | Ghi chú |
|---|---|---|
| Model `Publication`, `PublicationAuthor`, `Patent`, `PatentInventor`, `Dataset`, `Knowledge`, `Evidence`, `EvidenceLink` + enum liên quan | `prisma/schema.prisma` (migration mới, không sửa migration cũ) | Theo Mục 6; chốt Mục 6.2 trước |
| Cột `CapabilityEvidence.evidenceId` + script backfill | `prisma/schema.prisma` (migration mới), script một lần | Theo Mục 6.4 |
| `lib/domain/knowledge.ts` (quy tắc thuần: verify, dedup DOI/patent number) | Mới | Có unit test, theo `ARCHITECTURE.md` |
| `lib/actions/knowledge.ts` (create/update/verify/link, ghi `AuditLog`) | Mới | Theo mẫu `lib/actions/experts.ts` |
| Mở rộng `lib/integrations/crossref.ts`/`openalex.ts` để trả danh sách nhiều work thay vì 1 bản ghi | Sửa file hiện có | Tái sử dụng, không viết adapter song song |
| Thêm dòng permission Mục 7 vào bảng tĩnh khi Component 01 hiện thực hoá `VC-KT-002` Mục 14 | `lib/domain/access-control.ts` | Chỉ thêm dòng, không đổi cấu trúc |
| Trang `/tri-thuc-du-lieu` (namespace API `/api/v1/tri-thuc-du-lieu` theo `VC-NV-001` Mục 3) | `app/` | Sau khi model + action ổn định |

---

*Tài liệu này ở trạng thái `DRAFT`. Trước khi chuyển `APPROVED`/`v1.0`: (1) Product
Owner trả lời 2 câu hỏi Mục 6.2 và câu hỏi Mục 11 điểm 5, (2) xác nhận Mục 11
điểm 1 (phê duyệt mở giai đoạn), (3) `06_PHAP-LY-TUAN-THU` xác nhận Mục 11 điểm
3. Sau khi duyệt, cập nhật
`00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.6_20260819.md` theo đúng quy
trình `VC-QT-001` Mục 8.*
