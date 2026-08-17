# THIẾT KẾ PHÂN QUYỀN VI CONNECT — GIAI ĐOẠN 1

**Mã tài liệu:** VC-KT-002
**Phiên bản:** v0.1
**Ngày soạn thảo:** 2026-08-17
**Trạng thái:** DRAFT — đang lấy ý kiến, chưa dùng làm căn cứ triển khai chính thức
**Nơi lưu chuẩn:** `03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/VC-KT-002-ThietKePhanQuyen-DRAFT_v0.1_20260817.md`

## 1. Mục đích & phạm vi

Tài liệu này chốt **mô hình phân quyền chính thức** cho VI CONNECT Giai đoạn 1: danh
mục Role, Permission (`resource.action`), Data Scope, ma trận Role × Permission ×
Scope, luồng kiểm tra quyền tại server, và ranh giới rõ ràng với các cấu phần chưa
được xây (giải ngân, đầu tư, multi-tenant SaaS thật...).

Phạm vi áp dụng: toàn bộ route handler và server action dưới `app/` và `lib/actions/`,
lấy `lib/domain/access-control.ts` và `lib/rbac.ts` làm nơi hiện thực hoá duy nhất.
Không thay đổi `prisma/schema.prisma` ở phiên bản v0.1 này ngoài các bổ sung nêu ở
Mục 14; đây là tài liệu thiết kế, việc code hoá thực hiện ở các PR riêng sau khi
tài liệu được duyệt (`APPROVED`).

## 2. Căn cứ

- Yêu cầu phân quyền gốc (58 mục) do chủ đề án cung cấp — kiến trúc IAM đầy đủ cho nền
  tảng multi-tenant SaaS 5 năm.
- `AGENTS.md`: *"MVP Giai đoạn 1; không tự mở rộng sang giải ngân, đầu tư hoặc AI tự
  quyết định."*
- `docs/SCOPE.md`: *"ưu tiên giới hạn mà chính tài liệu nguồn (đề án) đặt ra, thay vì
  quy mô lớn nhất mà yêu cầu ban đầu ngụ ý."*
- `ARCHITECTURE.md`: *"Kiểm tra xác thực/phân quyền ở server; giao diện chỉ hỗ trợ
  trải nghiệm người dùng."*
- Mã nguồn hiện có: `prisma/schema.prisma`, `lib/domain/access-control.ts`,
  `lib/rbac.ts`, `lib/auth.ts`, `lib/actions/*.ts`.

## 3. Nguyên tắc thiết kế

1. Backend là nơi duy nhất quyết định `ALLOW/DENY`; ẩn nút trên giao diện chỉ là gợi ý
   UX, không phải kiểm soát.
2. Permission đặt tên dạng `resource.action`, không hard-code theo tên role rải rác
   trong controller/action.
3. Permission và Data Scope là hai trục độc lập: có quyền `need.publish` không có
   nghĩa được publish `Need` của tổ chức khác — scope quyết định phạm vi dữ liệu.
4. Không tin `organizationId` do client gửi trong body/query/header; tổ chức hiện tại
   luôn lấy từ `session.user.organizationId` (JWT đã xác thực).
5. Không hard-delete tài khoản đã có lịch sử nghiệp vụ; dùng cờ trạng thái.
6. Mọi thay đổi quyền, xác minh, phê duyệt phải ghi `AuditLog`.
7. Chỉ xây phần có nghiệp vụ thật đang chạy trong Giai đoạn 1 (5 domain A-E rút gọn);
   không dựng khung ("engine") tổng quát cho các trường hợp chưa có dữ liệu thật.

## 4. Mô hình đối tượng phân quyền

Mô hình gốc 8 tầng (`User → Membership → Tenant → Org/Unit → Role → Permission →
Scope → Resource`) được **rút gọn còn 5 tầng**, khớp với schema hiện tại (`User` có
đúng 1 `organizationId`, không có bảng `Membership`/`Tenant` riêng):

```text
User (role toàn cục, organizationId 1-1, status)
  ↓
Role  (VAST_ADMIN | HOI_ADMIN | EXPERT | ENTERPRISE | VIEWER)
  ↓
Permission ("resource.action")
  ↓
Data Scope (OWN | ORGANIZATION | PLATFORM | PLATFORM chỉ-PUBLISHED)
  ↓
Resource (Organization, ExpertProfile, Need, Supply, Challenge, Solution,
          Match, Project, Milestone, Deliverable, Agreement, FundingSource)
```

`Organization` giữ vai trò tương đương "tenant nghiệp vụ" nhưng **không cô lập dữ
liệu chéo tổ chức** — vì tính năng lõi (AI Matching) buộc phải đọc `Need` của tổ chức
A khớp với `Supply` của tổ chức B. Đây là khác biệt chủ đích so với mô hình
"DENY CROSS-TENANT mặc định" trong yêu cầu gốc (xem Mục 13, điểm 1).

## 5. Danh mục Role (giữ nguyên enum `Role` hiện có, không thêm role mới)

| Role | Mô tả | Gắn với |
|---|---|---|
| `VAST_ADMIN` | Quản trị toàn nền tảng | Không giới hạn tổ chức |
| `HOI_ADMIN` | Quản trị được ủy quyền (delegated admin) của 1 tổ chức | `organizationId` |
| `EXPERT` | Chuyên gia — cá nhân có hồ sơ năng lực | `organizationId` (đơn vị chủ quản) |
| `ENTERPRISE` | Đại diện tổ chức cầu (doanh nghiệp/quỹ đầu tư) đăng nhu cầu/bài toán | `organizationId` |
| `VIEWER` | Chỉ xem dữ liệu công khai/đã publish | Không bắt buộc |

Không tách `SuperAdmin/SecurityAdmin/DataAdmin/Auditor/SupportAdmin` như yêu cầu gốc
§3.1 — vượt nhu cầu vận hành pilot 1 năm (xem Mục 13, điểm 4).

## 6. Data Scope

| Scope | Ý nghĩa |
|---|---|
| `OWN` | Chỉ bản ghi user tự tạo/sở hữu (VD: `ExpertProfile` của chính mình) |
| `ORGANIZATION` | Mọi bản ghi thuộc `organizationId` của user |
| `PLATFORM` | Toàn hệ thống (chỉ `VAST_ADMIN`) |
| `PLATFORM*` | Toàn hệ thống nhưng **chỉ bản ghi ở trạng thái công khai** (`PUBLISHED`) — dùng cho hành vi đọc kiểu marketplace |

Không dùng `TEAM/DEPARTMENT/UNIT/PROJECT/NETWORK/CUSTOM` như yêu cầu gốc §6 — schema
hiện tại không có đơn vị/phòng ban dưới `Organization`, và quyền theo dự án cụ thể
chưa có nhu cầu nghiệp vụ (mọi thành viên tổ chức chủ quản của một `Match` đều được
xem `Project` phát sinh từ `Match` đó — xem Mục 9).

## 7. Ma trận Role × Permission × Scope

Ký hiệu: `P` = PLATFORM · `P*` = PLATFORM chỉ-PUBLISHED · `O` = ORGANIZATION ·
`W` = OWN · `—` = không có quyền.

### 7.1 CONNECT — tổ chức, tài khoản, hồ sơ chuyên gia

| Permission | VAST_ADMIN | HOI_ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `organization.view` | P | O | O | O | P* |
| `organization.create` | P | — | — | — | — |
| `organization.update` (hồ sơ tổ chức) | P | O | — | — | — |
| `organization.manage` (kích hoạt/tạm ngưng) | P | — | — | — | — |
| `user.view` | P | O | W | W | — |
| `user.create` (thêm thành viên vào tổ chức) | P | O | — | — | — |
| `user.update` | P | O | W | W | — |
| `user.disable` | P | O¹ | — | — | — |
| `expertProfile.view` | P | O | W | — | P* |
| `expertProfile.update` | P | — | W | — | — |
| `expertProfile.verify` | P | O | — | — | — |

¹ `HOI_ADMIN` chỉ được `user.disable` với tài khoản thuộc chính tổ chức mình — hệ quả
của mô hình 1 user–1 org hiện tại (xem giới hạn ở Mục 13, điểm 3).

### 7.2 DISCOVER & MATCH — cung cầu, bài toán, ghép nối

| Permission | VAST_ADMIN | HOI_ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `need.view` | P | O + P* | P* | O + P* | P* |
| `need.create` / `.update` / `.publish` / `.close` | P | O | — | O | — |
| `supply.view` | P | O + P* | O + P* | P* | P* |
| `supply.create` / `.update` / `.publish` / `.archive` | P | O | W² | — | — |
| `challenge.view` | P | O + P* | P* | O + P* | P* |
| `challenge.create` / `.update` / `.publish` / `.close` | P | O | — | O | — |
| `solution.view` | P | O (bài toán của tổ chức mình) | W | O (bài toán của tổ chức mình) | — |
| `solution.submit` | P | O | W | O | — |
| `solution.review` | P | O | — | O | — |
| `match.view` | P | O (theo `Need` của tổ chức mình) | W (theo `ExpertProfile` của mình) | O | — |
| `match.generate` | P | O | — | O | — |
| `match.updateStage` | P | O | — | O | — |
| `match.convertToProject` | P | O | — | O | — |

² `EXPERT` có quyền `supply.*` ở scope `OWN` theo **thiết kế mục tiêu** khớp mô tả
README ("01+10 — Hồ sơ & tổ chức... đăng nhu cầu/công nghệ"), nhưng mã hiện tại
(`createSupplyAction` trong `lib/actions/matching.ts:65`) chỉ cho `VAST_ADMIN,
HOI_ADMIN` — đây là khoảng trống cần xác nhận nghiệp vụ trước khi code hoá, ghi ở
Phụ lục B.

### 7.3 EXECUTE — dự án, hợp đồng

| Permission | VAST_ADMIN | HOI_ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `project.view` | P | O | W (dự án phát sinh từ match của mình) | O | — |
| `project.update` | P | O | — | O | — |
| `milestone.create` / `.updateStatus` | P | O | — | O | — |
| `deliverable.view` | P | O | W | O | — |
| `deliverable.accept` | P | O | — | O | — |
| `agreement.view` | P | O | W | O | — |
| `agreement.create` / `.sign` | P | O | — | O | — |

### 7.4 MOBILIZE — chỉ phần stub đã có (không phải Funding Hub thật)

| Permission | VAST_ADMIN | HOI_ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `fundingSource.view` | P | O | — | O | — |
| `fundingSource.create` (chỉ ghi chú, không phê duyệt/giải ngân) | P | O | — | O | — |

Không có `funding.review`, `funding.approve`, `investment.decision`,
`due_diligence.view` — bị loại theo Mục 13, điểm 2.

### 7.5 IMPACT / GOVERNANCE

| Permission | VAST_ADMIN | HOI_ADMIN | EXPERT | ENTERPRISE | VIEWER |
|---|---|---|---|---|---|
| `kpi.view` | P | O³ | — | — | — |
| `auditLog.view` | P | — | — | — | — |

³ KPI theo scope tổ chức (`kpi.view = O` cho `HOI_ADMIN`) là **mục tiêu thiết kế**;
cần đối chiếu với dashboard KPI hiện tại (`11 — KPI Dashboard`) xem có đang tính
theo toàn platform hay đã lọc theo tổ chức — nằm ngoài phạm vi tài liệu này, ghi
backlog kiểm tra riêng.

## 8. Quy tắc hiển thị theo trạng thái xuất bản (thay cho PUBLIC/INTERNAL/SHARED/RESTRICTED của yêu cầu gốc §21-22)

Thay vì 4 cấp phân loại dữ liệu nhạy cảm đầy đủ, Giai đoạn 1 chỉ dùng **trạng thái đã
có sẵn trong schema**:

- `Need/Supply/Challenge.status = PUBLISHED` → xem được ở scope `PLATFORM*` (mọi
  user đã đăng nhập, kể cả `VIEWER`).
- `status = DRAFT` → chỉ `ORGANIZATION` scope của tổ chức sở hữu.
- `ExpertProfile.verificationStatus` không ảnh hưởng quyền xem, chỉ ảnh hưởng việc có
  xuất hiện trong kết quả `match.generate` hay không (đã đúng theo
  `lib/actions/matching.ts:109`, lọc `VERIFIED`/`PENDING`).

Không dựng cấp `CONFIDENTIAL/RESTRICTED` kèm MFA/IP allowlist — chưa có dữ liệu nào
trong schema Giai đoạn 1 đạt mức nhạy cảm đó (không có hồ sơ tài chính, PII đầy đủ
hay bí mật công nghệ đóng gói dạng file mã hoá).

## 9. Luồng kiểm tra quyền tại server action / route handler

Rút gọn từ 10 bước ở yêu cầu gốc §55, khớp với mô hình 5 tầng ở Mục 4:

```text
1. requireUser()          → có session hợp lệ? (lib/rbac.ts)
2. User.status === ACTIVE?  → chưa có field, bổ sung ở Mục 14
3. requireRole(...)        → role nằm trong danh sách cho permission này?
4. resolve resource        → load bản ghi theo id từ path/body (KHÔNG tin field
                              organizationId gửi từ client)
5. assertOrgScope / assertPermission
                            → so organizationId của resource với session, theo
                              scope ở Mục 7 (OWN so sánh ownerId, ORGANIZATION so
                              sánh organizationId, PLATFORM bỏ qua)
6. business rule cụ thể    → VD: status hiện tại có cho phép transition không
7. execute (db write)
8. auditLog.create(...)    → bắt buộc cho mọi hành vi ghi (Mục 10)
9. revalidatePath(...)
```

Nếu bước 2-6 không đạt → ném `ForbiddenError`/`AuthError` (đã có ở
`lib/domain/access-control.ts`, `lib/rbac.ts`), không âm thầm trả mảng rỗng.

## 10. Audit log — trường bắt buộc

`AuditLog` hiện có `userId, action, entity, entityId, meta, createdAt`. Bổ sung tối
thiểu cho Giai đoạn 1 (không cần đủ bộ `IPAddress/UserAgent/CorrelationId` như §49
gốc ngay từ đầu, nhưng `before/after` có giá trị cao cho các hành vi nhạy):

| Hành vi bắt buộc ghi audit | Đã ghi trong mã nguồn? |
|---|---|
| `VERIFY_EXPERT_*` | Có (`lib/actions/experts.ts:30`) |
| `REVIEW_SOLUTION_*` | Có (`lib/actions/challenges.ts:113`) |
| `CREATE_ORGANIZATION`, `SET_ORG_STATUS_*` | Có (`lib/actions/organizations.ts`) |
| `CONVERT_MATCH_TO_PROJECT`, `CREATE_AGREEMENT` | Có (`lib/actions/projects.ts`) |
| `MATCH_STAGE_*` | Có (`lib/actions/matching.ts:142`) |
| Đăng nhập thất bại (`FailedLogin`) | **Chưa** — `lib/auth.ts` không ghi audit khi `authorize` trả `null` |
| Đổi role/permission của user | **Chưa có UI/action** — backlog Mục 14 |
| `signAgreementAction` | **Chưa** — không có `auditLog.create` (lib/actions/projects.ts:123-130) |

## 11. Trường hợp đặc biệt

- **Tài khoản bị vô hiệu hoá**: hiện `User` chưa có `status`. Bổ sung
  `status: ACTIVE | DISABLED`, chặn ở bước 2 của Mục 9. Vì Giai đoạn 1 là mô hình
  1 user–1 org, không cần phân biệt "khoá tài khoản toàn hệ thống" và "khoá thành
  viên trong tổ chức" như §23 gốc — hai khái niệm trùng nhau ở đây.
- **IDOR**: mọi action nhận `*Id` từ tham số phải load bản ghi rồi `assertOrgScope`
  trước khi ghi — xem khoảng trống cụ thể ở Phụ lục B.
- **Conflict of interest tối thiểu**: `reviewSolutionAction` nên chặn
  `user.id === solution.submittedById` (chưa có trong mã hiện tại — Phụ lục B).
- **Không dùng Explicit Deny**: hệ thống chỉ dùng allow-based authorization (đúng
  tinh thần §29 gốc khi "chưa triển khai Explicit Deny ở giai đoạn đầu, phải ghi rõ
  hệ thống chỉ dùng allow-based authorization").

## 12. AI Assistant (nếu có ở Giai đoạn 1)

Nếu module AI matching hoặc trợ lý AI nào truy vấn dữ liệu thay người dùng, phải
gọi qua cùng lớp `assertOrgScope`/permission như request thông thường của
`CurrentUser` đó — không dùng service account có quyền cao hơn user gọi. Hiện
`lib/matching.ts` chạy hoàn toàn nội bộ (không gọi API AI ngoài), nhưng nguyên tắc
này áp dụng ngay khi có AI Assistant tương tác trực tiếp với người dùng.

## 13. Loại trừ khỏi Giai đoạn 1 (và lý do)

1. **Multi-tenant cô lập dữ liệu chéo tổ chức / "DENY CROSS-TENANT mặc định"** — mâu
   thuẫn với tính năng lõi AI Matching cần đọc chéo tổ chức để ghép Need↔Supply.
2. **Funder/Investor role, `funding.review`, `investment.decision`,
   `due_diligence.view`, giải ngân/đối soát tài chính thật** — vi phạm trực tiếp
   `AGENTS.md`. `FundingSource` giữ nguyên dạng stub (ghi chú, không phê duyệt).
3. **Multi-membership (1 người nhiều tổ chức), Workspace Selector, Personal
   Workspace** — đòi hỏi đổi `User.organizationId` (1-1) sang bảng `Membership`
   (n-n); không nằm trong 5 domain A-E mà đề án chốt cho Năm 1.
4. **6 role nền tảng riêng biệt (SecurityAdmin/DataAdmin/Auditor/SupportAdmin...)**
   — vượt nhu cầu vận hành pilot; giữ 1 `VAST_ADMIN`.
5. **SSO (Entra ID/LDAP/Google Workspace)** — stack hiện chỉ có NextAuth Credentials.
6. **Phân loại dữ liệu CONFIDENTIAL/RESTRICTED + MFA/IP allowlist/approval workflow**
   — chưa có dữ liệu nhạy cảm ở mức đó trong schema Giai đoạn 1.
7. **Delegation có hiệu lực thời gian, Support Access tạm thời, Invitation token
   qua email** — chưa có model `Invitation`/`Delegation`; membership hiện set trực
   tiếp qua admin/seed.
8. **ReBAC/ABAC "Authorization Engine" tổng quát, `ResourceAccessGrant`/
   `ResourceDeny` riêng** — với ~12 domain model hiện tại, hàm scope-check thuần
   (`assertOrgScope`/`assertPermission`) là đủ; không dựng engine tổng quát.
9. **Bộ 56 test §56 của yêu cầu gốc nguyên văn** — nhiều test giả định cơ chế chưa
   tồn tại (cross-tenant, cache theo tenant, SSO, background job theo tenant). Bộ
   test tối thiểu thực tế cho Giai đoạn 1 nêu ở Mục 15.

Các mục 1-8 giữ nguyên làm backlog Giai đoạn 2-3, gắn đúng module tương ứng (Mobilize
= mục 2; multi-org membership = mục 3), theo đúng nguyên tắc `docs/SCOPE.md`.

## 14. Kế hoạch triển khai kỹ thuật (khi tài liệu này được duyệt)

| Việc | File | Ghi chú |
|---|---|---|
| Bảng permission tĩnh `Record<Role, string[]>` theo Mục 7 | `lib/domain/access-control.ts` (mới: `permissions.ts` cùng thư mục) | Thay dần các `role === "..."` rải rác |
| Hàm `assertPermission(user, "resource.action", {organizationId?, ownerId?})` | `lib/domain/access-control.ts` | Mở rộng `assertOrgScope` hiện có, giữ tương thích ngược |
| Thêm `User.status ACTIVE\|DISABLED` | `prisma/schema.prisma` + migration mới | Không sửa migration cũ, đúng `AGENTS.md` |
| Mở rộng `AuditLog`: `before Json?`, `after Json?` | `prisma/schema.prisma` + migration mới | `ipAddress/userAgent/correlationId` để Giai đoạn sau khi có middleware phù hợp |
| Vá các khoảng trống ở Phụ lục B | `lib/actions/projects.ts`, `lib/actions/matching.ts` | Ưu tiên trước khi có dữ liệu thật nhiều tổ chức |

## 15. Test bắt buộc tối thiểu cho Giai đoạn 1

1. `HOI_ADMIN` tổ chức A không đọc/sửa được `Need`/`Supply`/`Challenge` của tổ chức B.
2. `ENTERPRISE` không `convertMatchToProjectAction` được match của tổ chức khác.
3. `EXPERT`/`VIEWER` không gọi được các action giới hạn `requireRole("VAST_ADMIN",
   "HOI_ADMIN", "ENTERPRISE")`.
4. `VIEWER` chỉ thấy `Need`/`Supply`/`Challenge` có `status = PUBLISHED`.
5. `reviewSolutionAction` chặn người review chính là người nộp giải pháp.
6. `User.status = DISABLED` không đăng nhập được (`authorize()` trả `null`).
7. Sửa `organizationId` giả trong body request không đổi được phạm vi quyền
   (giá trị luôn lấy từ session, không từ input).
8. `addMilestoneAction`/`setMilestoneStatusAction`/`generateMatchesAction`/
   `updateMatchStageAction` chặn user không thuộc tổ chức sở hữu `Project`/`Need`
   liên quan (sau khi vá Phụ lục B).

## 16. Đối chiếu với mô hình Multi-Tenant Architecture phổ biến (tham khảo ngoài)

Tham khảo: "Cơ bản về Multi-Tenant Architecture" — Viblo,
<https://viblo.asia/p/co-ban-ve-multi-tenant-architecture-QyJKzZO74Me> (truy cập
2026-08-17). Bài viết trình bày 3 mô hình triển khai multi-tenant phổ biến:

| Mô hình | Mô tả | Phù hợp cho (theo bài viết) |
|---|---|---|
| Shared Database, Shared Schema | 1 database, 1 bộ bảng, phân biệt bằng cột định danh khách thuê (`tenant_id`) | Dự án nhỏ, chi phí thấp |
| Shared Database, Separate Schema | 1 database, mỗi khách thuê 1 schema riêng | Cần cô lập logic tốt hơn; đánh đổi bằng độ phức tạp quản trị và rủi ro "Noisy Neighbor" |
| Separate Database per Tenant | Mỗi khách thuê 1 database/server riêng | Khách hàng Enterprise, ngành tài chính, cần bảo mật/mở rộng độc lập tuyệt đối |

### 16.1 Đối chiếu với VI CONNECT

1. **VI CONNECT không phải multi-tenant SaaS theo đúng tiền đề của bài viết.**
   Định nghĩa gốc coi tenant là nhóm người dùng có "vùng dữ liệu riêng biệt" — ngầm
   định các khách thuê **không cần thấy dữ liệu của nhau**. VI CONNECT thì ngược
   lại: tính năng lõi (Discover & Match) *bắt buộc* `Need` của tổ chức A phải nhìn
   thấy và khớp được với `Supply` của tổ chức B. Coi mỗi `Organization` là một
   tenant theo nghĩa cô lập sẽ triệt tiêu chính giá trị cốt lõi của nền tảng —
   khớp với nhận định đã nêu ở Mục 4 và Mục 13, điểm 1.
2. **Mô hình đang dùng gần với "Shared Database, Shared Schema"**, nhưng có một
   khác biệt quan trọng: cột định danh (`organizationId`) không dùng để **cô lập
   tuyệt đối** như multi-tenant SaaS thật, mà dùng để **phân biệt quyền ghi/sửa**
   (chỉ tổ chức sở hữu mới sửa được — scope `ORGANIZATION`), trong khi **quyền
   đọc** với dữ liệu `PUBLISHED` vẫn mở toàn platform (scope `PLATFORM*`, xem
   Mục 7-8). Đây là lý do gọi `Organization` là "tenant nghiệp vụ" chứ không phải
   tenant hạ tầng.
3. **"Shared Database, Separate Schema" và "Separate Database per Tenant" đều
   không phù hợp** cho Giai đoạn 1: cả hai được chính bài viết khuyến nghị cho
   khách hàng Enterprise/tài chính cần cô lập tuyệt đối — VI CONNECT hiện không
   bán license hạ tầng riêng cho từng tổ chức, không có yêu cầu compliance buộc
   tách database, và 152 hội + 624 tổ chức là **người tham gia trong cùng một nền
   tảng do VAST/HTIC vận hành**, không phải khách thuê hạ tầng độc lập. Áp mô hình
   này sẽ phát sinh đúng nhược điểm bài viết nêu ("chi phí cực cao, khó quản lý
   hàng loạt") mà không giải quyết nhu cầu thật nào ở Giai đoạn 1.
4. **Rủi ro "Noisy Neighbor" và rủi ro bảo mật của Shared Schema mà bài viết nêu
   là có thật và cần phòng ngừa** — nhưng bằng kỷ luật ở tầng ứng dụng (mọi truy
   vấn đi qua `assertOrgScope`/`assertPermission`, không viết raw query bỏ qua lớp
   này — Mục 3, 9), chứ không phải bằng cách tách database. Đây chính là lý do
   Phụ lục B xếp các chỗ thiếu `assertOrgScope` ở mức rủi ro Cao — rủi ro nằm ở
   thiếu enforcement tầng ứng dụng, không phải ở thiếu tách hạ tầng.

### 16.2 Kết luận

Giữ nguyên hướng thiết kế ở Mục 4 và Mục 13, điểm 1: **không áp dụng mô hình
multi-tenant cô lập** (dạng schema riêng hay database riêng) cho VI CONNECT Giai
đoạn 1. Tài liệu tham khảo xác nhận thêm rằng cả 3 mô hình phổ biến đều giả định
"khách thuê không cần thấy dữ liệu nhau" — tiền đề không đúng với nền tảng này.
Nếu về sau VI CONNECT mở rộng sang mô hình thương mại hoá, bán license riêng cho
từng tổ chức có yêu cầu compliance cao hơn (ngoài phạm vi đề án hiện tại), có thể
xem xét lại "Shared Database, Separate Schema" cho nhóm khách đó — ghi backlog
Giai đoạn 2-3, không phải Giai đoạn 1.

## Phụ lục A — Đối chiếu với yêu cầu 58 mục gốc

| Nhóm mục gốc | Trạng thái |
|---|---|
| §1, §29 (nguyên tắc chung, allow-based) | Áp dụng, rút gọn — Mục 3, 11 |
| §2-§6 (Membership/Tenant/Unit/resource.action/scope) | Rút gọn còn 5 tầng, 3 scope — Mục 4, 6, 7 |
| §7-§9 (Workspace Selector, Personal Workspace) | Loại trừ Giai đoạn 1 — Mục 13.3 |
| §10-§14 (nhiều đơn vị, nhiều role, kế thừa role, lãnh đạo/trưởng phòng) | Không áp dụng — không có Unit/Department dưới Organization |
| §15-§19 (chuyên gia, reviewer, funder, guest, người ngoài tổ chức) | Áp dụng phần chuyên gia/reviewer/guest (Mục 7); Funder loại trừ (Mục 13.2) |
| §20-§22 (cross-tenant, public/private, phân loại dữ liệu) | Thay bằng quy tắc PUBLISHED — Mục 8 |
| §23-§28 (disable, rời tổ chức, đổi role, quyền tạm thời, ủy quyền) | Áp dụng tối thiểu (disable) — Mục 11; còn lại loại trừ — Mục 13.7 |
| §31 (Maker-Checker) | Loại trừ — gắn với Funding module chưa xây |
| §32-§33 (SuperAdmin/TenantAdmin) | Rút gọn còn `VAST_ADMIN`/`HOI_ADMIN` — Mục 5 |
| §34-§39 (API flow, IDOR, tenant giả, export, download, search) | Áp dụng — Mục 9; export/search chưa có tính năng, ghi backlog |
| §40-§41 (AI Assistant, background job) | AI Assistant áp dụng nguyên tắc — Mục 12; background job: chưa có job nào cần TenantContext |
| §42-§44 (cache, notification, session) | Chưa có cache/notification theo tenant; session đã đúng cấu trúc tối thiểu qua JWT |
| §45 (SSO) | Loại trừ — Mục 13.5 |
| §46-§48 (chưa có membership, invitation, xoá user) | Invitation loại trừ — Mục 13.7; xoá user: đã dùng soft-status — Mục 11 |
| §49 (audit) | Áp dụng tối thiểu — Mục 10 |
| §50-§55 (UI convenience, màn hình quản trị, ma trận quyền, entity, authorize function, thứ tự ưu tiên) | Áp dụng — Mục 7, 9; màn hình quản trị quyền là backlog UI riêng |
| §56 (56 test) | Rút gọn còn 8 test cốt lõi — Mục 15 |
| §57-§58 (kiến trúc chính thức, yêu cầu coder) | Rút gọn theo Mục 3-4; các cấm chỉ (không hard-code role, không tin TenantId client...) giữ nguyên |

## Phụ lục B — Khoảng trống đã phát hiện trong mã nguồn hiện tại

Phát hiện khi đối chiếu yêu cầu với `lib/actions/*.ts`; **chưa sửa trong tài liệu
này**, cần PR riêng sau khi thiết kế được duyệt.

| # | Vị trí | Vấn đề | Mức độ |
|---|---|---|---|
| B1 | `lib/actions/projects.ts:65` `addMilestoneAction`, `:93` `setMilestoneStatusAction` | Chỉ `requireUser()`, không `assertOrgScope` theo tổ chức sở hữu `Project` → user bất kỳ tổ chức nào cũng sửa được milestone của project bất kỳ | Cao (IDOR) |
| B2 | `lib/actions/matching.ts:99` `generateMatchesAction` | Chỉ `requireUser()`, không kiểm tra `need.organizationId` thuộc phạm vi user | Trung bình |
| B3 | `lib/actions/matching.ts:138` `updateMatchStageAction` | Chỉ `requireUser()`, không `assertOrgScope` → đổi được stage của match bất kỳ tổ chức nào | Cao (IDOR) |
| B4 | `lib/actions/projects.ts:11` `convertMatchToProjectAction`, `:98` `createAgreementAction`, `:123` `signAgreementAction` | Có `requireRole` nhưng thiếu `assertOrgScope` theo tổ chức sở hữu `Need`/`Match` gốc → `HOI_ADMIN`/`ENTERPRISE` tổ chức A thao tác được trên project của tổ chức B | Cao (IDOR) |
| B5 | `lib/actions/challenges.ts:77` `submitSolutionAction` | Chỉ `requireUser()` — cần quyết định nghiệp vụ: `VIEWER` có được nộp giải pháp không | Thấp (cần quyết định, không phải lỗi) |
| B6 | `lib/actions/matching.ts:65` `createSupplyAction` | `requireRole("VAST_ADMIN", "HOI_ADMIN")` — không có `EXPERT`, trong khi README mô tả chuyên gia đăng công nghệ/dịch vụ của mình | Cần xác nhận nghiệp vụ (Mục 7.2, chú thích ²) |
| B7 | `lib/auth.ts` (hàm `authorize`) | Không ghi `AuditLog` khi đăng nhập thất bại | Thấp |

---

*Tài liệu này ở trạng thái DRAFT. Sau khi rà soát nghiệp vụ (đặc biệt B5, B6 và chú
thích ³ ở Mục 7.5), cập nhật thành `v1.0` với trạng thái `APPROVED`, đồng thời cập
nhật `00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.2_20260817.md`.*
