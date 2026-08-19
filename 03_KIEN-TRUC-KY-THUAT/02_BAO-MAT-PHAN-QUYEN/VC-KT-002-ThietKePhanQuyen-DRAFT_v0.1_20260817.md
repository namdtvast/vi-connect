# KIẾN TRÚC PHÂN QUYỀN VI CONNECT

**Mã tài liệu:** VC-KT-002
**Phiên bản:** v0.1
**Ngày soạn thảo:** 2026-08-17
**Trạng thái:** DRAFT — đang lấy ý kiến, chưa dùng làm căn cứ triển khai chính thức
**Nơi lưu chuẩn:** `03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/VC-KT-002-ThietKePhanQuyen-DRAFT_v0.1_20260817.md`

## 1. Mục đích & phạm vi

Tài liệu này chốt **mô hình phân quyền chung cho toàn bộ nền tảng VI CONNECT** —
không viết riêng cho một giai đoạn triển khai, để khi hệ thống mở rộng (thêm cấu
phần, thêm loại tổ chức, thêm tenant...) **không phải thiết kế lại** Role/
Permission/Scope từ đầu.

Tài liệu tách rõ hai lớp, để không nhầm "mô hình tổng quát" với "những gì đang
được phép chạy":

- **Mô hình kiến trúc** (Mục 3-9): tổng quát, dùng cho toàn bộ vòng đời VI
  CONNECT. Tham khảo hướng tiếp cận multi-tenant/multi-membership ở `VC-TK-004`,
  nhưng chỉ giữ lại phần đã kiểm chứng khớp với đặc thù VI CONNECT — xem Mục 4
  (Tenant/Membership) và Mục 16 (đối chiếu mô hình multi-tenant phổ biến).
- **Ma trận permission đang bật** (Mục 7, Phụ lục B): chỉ liệt kê `resource.action`
  có nghiệp vụ và mã nguồn thật tại thời điểm viết tài liệu. Bật thêm permission
  cho cấu phần mới (VD: Mobilize/Funding Hub) là **thêm dòng vào ma trận**, không
  đổi cấu trúc Role/Permission/Scope — nhưng việc bật permission nào, khi nào, vẫn
  do `AGENTS.md` và quyết định nghiệp vụ của đề án quyết định (Mục 2, Mục 13).

Phạm vi áp dụng: toàn bộ route handler và server action dưới `app/` và
`lib/actions/`, lấy `lib/domain/access-control.ts` và `lib/rbac.ts` làm nơi hiện
thực hoá duy nhất. Không thay đổi `prisma/schema.prisma` trong bản này ngoài các
bổ sung nêu ở Mục 14; đây là tài liệu thiết kế, việc code hoá thực hiện ở các PR
riêng sau khi tài liệu được duyệt (`APPROVED`).

## 2. Căn cứ

- Yêu cầu phân quyền gốc (58 mục) do chủ đề án cung cấp — kiến trúc IAM đầy đủ cho
  nền tảng multi-tenant SaaS.
- `VC-TK-004` (REFERENCE, chưa phê duyệt) — kiến trúc multi-tenant/multi-membership
  đầy đủ do một phiên Codex khác đề xuất; dùng làm nguồn ý tưởng cho Mục 4, 6, 7
  của tài liệu này, nhưng đã bỏ phần mâu thuẫn với `AGENTS.md` (permission liên
  quan giải ngân/đầu tư) và phần chưa đối chiếu được với mã nguồn thật.
- `AGENTS.md`: *"không tự mở rộng sang giải ngân, đầu tư hoặc AI tự quyết định."*
  Đây là giới hạn về **những gì được phép code hoá và bật tại một thời điểm cho
  trước**, độc lập với việc mô hình phân quyền có tổng quát hay không. Tài liệu
  này tuân thủ bằng cách: mô hình đủ tổng quát để thêm permission cho Funding/
  Investment sau này (chỉ thêm dòng vào Mục 7), nhưng **không bật** các permission
  đó trong ma trận hiện hành cho tới khi `AGENTS.md`/đề án cho phép — xem Mục 13.
- `docs/SCOPE.md`: *"ưu tiên giới hạn mà chính tài liệu nguồn (đề án) đặt ra, thay
  vì quy mô lớn nhất mà yêu cầu ban đầu ngụ ý."* Áp dụng cho **thứ tự code hoá và
  permission được bật**, không giới hạn hình dạng của mô hình kiến trúc.
- `ARCHITECTURE.md`: *"Kiểm tra xác thực/phân quyền ở server; giao diện chỉ hỗ trợ
  trải nghiệm người dùng."*
- Mã nguồn hiện có: `prisma/schema.prisma`, `lib/domain/access-control.ts`,
  `lib/rbac.ts`, `lib/auth.ts`, `lib/actions/*.ts`.

## 3. Nguyên tắc thiết kế

1. Backend là nơi duy nhất quyết định `ALLOW/DENY`; ẩn nút trên giao diện chỉ là
   gợi ý UX, không phải kiểm soát.
2. Permission đặt tên dạng `resource.action`, không hard-code theo tên role rải
   rác trong controller/action.
3. Permission và Data Scope là hai trục độc lập: có quyền `need.publish` không có
   nghĩa được publish `Need` của tổ chức khác — scope quyết định phạm vi dữ liệu.
4. Không tin `organizationId`/`tenantId` do client gửi trong body/query/header;
   ngữ cảnh tổ chức/tenant hiện tại luôn lấy từ `session` đã xác thực (JWT).
5. Không hard-delete tài khoản hoặc tổ chức đã có lịch sử nghiệp vụ; dùng cờ
   trạng thái (`Status`, `DeletedAt`).
6. Mọi thay đổi quyền, xác minh, phê duyệt phải ghi `AuditLog`.
7. Chỉ **bật** permission cho nghiệp vụ có mã nguồn thật đang chạy; mô hình phải
   đủ tổng quát để bật thêm mà không tái cấu trúc, nhưng không tự ý bật trước khi
   nghiệp vụ/mã nguồn tương ứng tồn tại.
8. Không dựng "authorization engine" tổng quát hoá quá mức khi số loại resource
   còn nhỏ — dùng hàm scope-check thuần (`assertOrgScope`/`assertPartyScope`),
   chỉ nâng cấp lên bảng cấu hình (`RolePermissions` trong DB) khi số role/
   permission thực tế đủ lớn để việc sửa code mỗi lần đổi quyền trở nên bất tiện.

## 4. Mô hình đối tượng phân quyền

Mô hình chung, không giới hạn theo giai đoạn triển khai (tham khảo cấu trúc ở
`VC-TK-004`, giữ lại phần khớp với đặc thù VI CONNECT):

```text
User
  ↓
Membership   (quan hệ User ↔ Organization, mang Role riêng theo từng nơi)
  ↓
Role
  ↓
Permission ("resource.action")
  ↓
Data Scope (OWN | ORGANIZATION | PARTY | PLATFORM | PLATFORM chỉ-PUBLISHED)
  ↓
Resource (Organization, ExpertProfile, Need, Supply, Challenge, Solution,
          Match, Project, Milestone, Deliverable, Agreement, FundingSource, ...)
```

**Trạng thái hiện tại của tầng Membership:** schema hiện có (`User.organizationId`
1-1) là **trường hợp đơn giản hoá** của mô hình trên — mỗi `User` có đúng 1
Membership ngầm định, không có bảng `Membership` riêng. Khi nghiệp vụ thật sự cần
một người thuộc nhiều tổ chức với vai trò khác nhau, bổ sung bảng `Membership`
(n-n giữa `User` và `Organization`, mang `Role`) — Role/Permission/Scope ở Mục 5-7
**không cần đổi cấu trúc**, chỉ đổi nơi lấy `organizationId`/`role`: từ
`user.organizationId` sang `currentMembership.organizationId`.

**Trạng thái hiện tại của tầng Tenant:** VI CONNECT vận hành như **một tenant duy
nhất** — một nền tảng do VAST/HTIC vận hành cho nhiều tổ chức tham gia — nên tầng
`Tenant` trong mô hình tổng quát hiện **trùng với chính VI CONNECT** và không xuất
hiện như một entity riêng trong schema. `Organization` là thực thể nghiệp vụ bên
trong tenant đó, **không phải một tenant độc lập** — đây là lý do tính năng lõi
(AI Matching) được phép đọc `Need`/`Supply` xuyên `Organization` (xem Mục 8, 16).
Nếu sau này VI CONNECT vận hành nhiều tenant tách biệt thật sự (VD: triển khai
white-label riêng cho một đơn vị khác), thêm 1 tầng `Tenant` phía trên
`Organization` và đổi scope `PLATFORM` thành `TENANT` — không cần đổi cấu trúc
Role/Permission bên dưới.

## 5. Danh mục Role

| Role                                              | Mô tả                                                                              | Gắn với                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- |
| `SUPERADMIN` *(trước đây `VAST_ADMIN`)* | Quản trị toàn nền tảng                                                          | Không giới hạn tổ chức               |
| `ADMIN` *(trước đây `HOI_ADMIN`)*       | Quản trị được ủy quyền (delegated admin) của 1 tổ chức                     | `organizationId` (qua Membership)       |
| `EXPERT`                                        | Chuyên gia — cá nhân có hồ sơ năng lực                                      | `organizationId` (đơn vị chủ quản) |
| `ENTERPRISE`                                    | Đại diện tổ chức cầu (doanh nghiệp/quỹ đầu tư) đăng nhu cầu/bài toán | `organizationId`                        |
| `VIEWER`                                        | Chỉ xem dữ liệu công khai/đã publish                                           | Không bắt buộc                         |

Mã nguồn đã đổi tên khớp bảng trên (`prisma/schema.prisma` `Role` enum,
migration `20260818115702_rename_role_superadmin_admin`, và toàn bộ
`requireRole(...)`/so sánh role trong `lib/`, `app/`) — xem Phụ lục B, mục B11.

Không tách `SecurityAdmin/DataAdmin/Auditor/SupportAdmin` như yêu cầu gốc §3.1
hay `VC-TK-004` Mục 40 — số lượng vai trò nền tảng chỉ nên tăng khi có nhu cầu
vận hành thật (đội ngũ quản trị chuyên trách riêng cho bảo mật/dữ liệu/audit);
Mục 3, điểm 8 đã cho phép thêm role mới bất cứ lúc nào mà không đổi cấu trúc.

## 6. Data Scope

| Scope            | Ý nghĩa                                                                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OWN`          | Chỉ bản ghi user tự tạo/sở hữu (VD:`ExpertProfile` của chính mình)                                                                                                                                                           |
| `ORGANIZATION` | Mọi bản ghi thuộc`organizationId` của user                                                                                                                                                                                        |
| `PARTY`        | Bản ghi thuộc domain EXECUTE (`Project/Milestone/Deliverable/Agreement`) mà tổ chức của user là **một trong các bên** tham gia `Match` gốc (bên `Need` hoặc bên `Supply`/`ExpertProfile`) — xem Mục 7.3 |
| `PLATFORM`     | Toàn hệ thống (chỉ`SUPERADMIN`) — tương đương scope `TENANT` khi VI CONNECT vận hành nhiều tenant (Mục 4)                                                                                                             |
| `PLATFORM*`    | Toàn hệ thống nhưng**chỉ bản ghi ở trạng thái công khai** (`PUBLISHED`) — dùng cho hành vi đọc kiểu marketplace                                                                                                 |

Không dùng `TEAM/DEPARTMENT/UNIT/NETWORK/CUSTOM` như yêu cầu gốc §6 — schema hiện
tại không có đơn vị/phòng ban dưới `Organization`; bổ sung khi nghiệp vụ thật cần
(VD: một tổ chức lớn cần phân quyền tới cấp phòng ban), không cần đổi cấu trúc
scope hiện có, chỉ thêm giá trị mới vào enum này.

Có bổ sung **`PARTY`** — khái niệm không có trong yêu cầu gốc 58 mục, phát sinh
từ đặc thù VI CONNECT: một `Match`/`Project` luôn bắc cầu **giữa 2 tổ chức** (bên
đăng `Need` và bên cung `Supply`/chuyên gia), nên `ORGANIZATION` (so khớp đúng 1
org) không đủ để cấp quyền đúng cho cả hai bên đang hợp tác — xem phân tích chi
tiết ở Mục 7.3.

## 7. Ma trận Role × Permission × Scope

Ký hiệu: `P` = PLATFORM · `P*` = PLATFORM chỉ-PUBLISHED · `O` = ORGANIZATION ·
`W` = OWN · `—` = không có quyền.

Ma trận dưới đây là **những permission đang được bật** vì đã có nghiệp vụ/mã
nguồn tương ứng. Thêm permission mới cho cấu phần chưa xây chỉ là thêm dòng —
xem Mục 13 về điều kiện bật thêm.

### 7.1 CONNECT — tổ chức, tài khoản, hồ sơ chuyên gia

| Permission                                          | SUPERADMIN | ADMIN  | EXPERT | ENTERPRISE | VIEWER |
| --------------------------------------------------- | ---------- | ------ | ------ | ---------- | ------ |
| `organization.view`                               | P          | O + P* | O + P* | O + P*     | P*     |
| `organization.create`                             | P          | —     | —     | —         | —     |
| `organization.update` (hồ sơ tổ chức)         | P          | O      | —     | —         | —     |
| `organization.manage` (kích hoạt/tạm ngưng)   | P          | —     | —     | —         | —     |
| `user.view`                                       | P          | O      | W      | W          | —     |
| `user.create` (thêm thành viên vào tổ chức) | P          | O      | —     | —         | —     |
| `user.update`                                     | P          | O      | W      | W          | —     |
| `user.disable`                                    | P          | O¹    | —     | —         | —     |
| `expertProfile.view`                              | P          | O      | W      | —         | P*     |
| `expertProfile.update`                            | P          | —     | W      | —         | —     |
| `expertProfile.verify`                            | P          | O      | —     | —         | —     |

¹ `ADMIN` chỉ được `user.disable` với tài khoản thuộc chính tổ chức mình — hệ quả
của mô hình 1 user–1 org hiện tại (Mục 4). Khi bổ sung bảng `Membership`, quyền
này tự nhiên tách thành "vô hiệu hoá Membership tại tổ chức mình" (không ảnh
hưởng Membership ở tổ chức khác), khớp §23 của yêu cầu gốc mà không cần đổi Mục
5-7.

### 7.2 DISCOVER & MATCH — cung cầu, bài toán, ghép nối

| Permission                                                     | SUPERADMIN | ADMIN                                 | EXPERT                               | ENTERPRISE                          | VIEWER |
| -------------------------------------------------------------- | ---------- | ------------------------------------- | ------------------------------------ | ----------------------------------- | ------ |
| `need.view`                                                  | P          | O + P*                                | P*                                   | O + P*                              | P*     |
| `need.create` / `.update` / `.publish` / `.close`      | P          | O                                     | —                                   | O                                   | —     |
| `supply.view`                                                | P          | O + P*                                | O + P*                               | P*                                  | P*     |
| `supply.create` / `.update` / `.publish` / `.archive`  | P          | O                                     | W²                                  | —                                  | —     |
| `challenge.view`                                             | P          | O + P*                                | P*                                   | O + P*                              | P*     |
| `challenge.create` / `.update` / `.publish` / `.close` | P          | O                                     | —                                   | O                                   | —     |
| `solution.view`                                              | P          | O (bài toán của tổ chức mình)   | W                                    | O (bài toán của tổ chức mình) | —     |
| `solution.submit`                                            | P          | O                                     | W                                    | O                                   | —     |
| `solution.review`                                            | P          | O                                     | —                                   | O                                   | —     |
| `match.view`                                                 | P          | O (theo`Need` của tổ chức mình) | W (theo`ExpertProfile` của mình) | O                                   | —     |
| `match.generate`                                             | P          | O                                     | —                                   | O                                   | —     |
| `match.updateStage`                                          | P          | O                                     | —                                   | O                                   | —     |
| `match.convertToProject`                                     | P          | O                                     | —                                   | O                                   | —     |

² `EXPERT` có quyền `supply.*` ở scope `OWN` theo **thiết kế mục tiêu** khớp mô tả
README ("01+10 — Hồ sơ & tổ chức... đăng nhu cầu/công nghệ"), nhưng mã hiện tại
(`createSupplyAction` trong `lib/actions/matching.ts:81`) chỉ cho `SUPERADMIN, ADMIN` —
đây là khoảng trống cần xác nhận nghiệp vụ trước khi code hoá, ghi ở Phụ lục B.

### 7.3 EXECUTE — dự án, hợp đồng

`Project` phát sinh từ `Match`, mà `Match` liên kết `Need` (thuộc 1 tổ chức) với
`Supply` hoặc `ExpertProfile` (thuộc 1 tổ chức khác — bên cung). Vì vậy quyền trên
`Project` và các resource con (`Milestone`, `Deliverable`, `Agreement`) dùng scope
`PARTY` thay vì `ORGANIZATION` đơn: tổ chức của user chỉ cần là **một trong hai
bên** liên quan đến `Match` gốc, không nhất thiết là bên tạo `Need`.

| Permission                               | SUPERADMIN | ADMIN   | EXPERT                                      | ENTERPRISE | VIEWER |
| ---------------------------------------- | ---------- | ------- | ------------------------------------------- | ---------- | ------ |
| `project.view`                         | P          | PARTY³ | W (dự án phát sinh từ match của mình) | PARTY³    | —     |
| `project.update`                       | P          | PARTY³ | —                                          | PARTY³    | —     |
| `milestone.create` / `.updateStatus` | P          | PARTY³ | —                                          | PARTY³    | —     |
| `deliverable.view`                     | P          | PARTY³ | W                                           | PARTY³    | —     |
| `deliverable.accept`                   | P          | PARTY³ | —                                          | PARTY³    | —     |
| `agreement.view`                       | P          | PARTY³ | W                                           | PARTY³    | —     |
| `agreement.create` / `.sign`         | P          | PARTY³ | —                                          | PARTY³    | —     |

³ `PARTY` = `user.organizationId` nằm trong tập
`{match.need.organizationId, match.supply?.organizationId, match.expertProfile?.organization.id}` của `Match` gắn với `Project` (qua
`Project.matchId`). Việc này đòi hỏi một hàm mới `assertPartyScope(user, project)`
— load `Project` kèm `match.need`, `match.supply`, `match.expertProfile.organization`
rồi kiểm tra `user.organizationId` có thuộc tập trên không — khác với
`assertOrgScope` hiện tại (chỉ so khớp đúng 1 giá trị `organizationId`). Hàm này
chưa tồn tại trong `lib/domain/access-control.ts`, bổ sung ở Mục 14.

### 7.4 MOBILIZE — chỉ phần stub đã có (không phải Funding Hub thật)

| Permission                                                               | SUPERADMIN | ADMIN | EXPERT | ENTERPRISE | VIEWER |
| ------------------------------------------------------------------------ | ---------- | ----- | ------ | ---------- | ------ |
| `fundingSource.view`                                                   | P          | O     | —     | O          | —     |
| `fundingSource.create` (chỉ ghi chú, không phê duyệt/giải ngân) | P          | O     | —     | O          | —     |

Không bật `funding.review`, `funding.approve`, `investment.decision`,
`due_diligence.view` — không phải vì mô hình không hỗ trợ (mô hình `resource.action`

+ scope ở Mục 5-6 đủ tổng quát để thêm các permission này), mà vì `AGENTS.md`
  hiện cấm mở rộng mã nguồn sang giải ngân/đầu tư (Mục 2, Mục 13, điểm 1). Khi đề
  án phê duyệt xây Funding Hub thật, thêm các dòng này vào bảng trên với scope phù
  hợp (nhiều khả năng `ORGANIZATION` cho review nội bộ + `PARTY`/quy trình
  Maker-Checker riêng cho approve) — không cần đổi cấu trúc Role/Permission/Scope.

### 7.5 IMPACT / GOVERNANCE

| Permission        | SUPERADMIN | ADMIN | EXPERT | ENTERPRISE | VIEWER |
| ----------------- | ---------- | ----- | ------ | ---------- | ------ |
| `kpi.view`      | P          | O⁴   | —     | —         | —     |
| `auditLog.view` | P          | —    | —     | —         | —     |

⁴ KPI theo scope tổ chức (`kpi.view = O` cho `ADMIN`) là **mục tiêu thiết kế**;
cần đối chiếu với dashboard KPI hiện tại (`11 — KPI Dashboard`) xem có đang tính
theo toàn platform hay đã lọc theo tổ chức — nằm ngoài phạm vi tài liệu này, ghi
là việc cần kiểm tra riêng.

## 8. Quy tắc hiển thị theo trạng thái xuất bản (thay cho PUBLIC/INTERNAL/SHARED/RESTRICTED của yêu cầu gốc §21-22)

Thay vì 4 cấp phân loại dữ liệu nhạy cảm đầy đủ, mô hình hiện tại chỉ dùng
**trạng thái đã có sẵn trong schema**:

- `Need/Supply/Challenge.status = PUBLISHED` → xem được ở scope `PLATFORM*` (mọi
  user đã đăng nhập, kể cả `VIEWER`).
- `status = DRAFT` → chỉ `ORGANIZATION` scope của tổ chức sở hữu.
- `ExpertProfile.verificationStatus` không ảnh hưởng quyền xem, chỉ ảnh hưởng việc
  có xuất hiện trong kết quả `match.generate` hay không (đã đúng theo
  `lib/actions/matching.ts:109`, lọc `VERIFIED`/`PENDING`).

Chưa bật cấp `CONFIDENTIAL/RESTRICTED` kèm MFA/IP allowlist — chưa có dữ liệu nào
trong schema hiện tại đạt mức nhạy cảm đó (không có hồ sơ tài chính, PII đầy đủ
hay bí mật công nghệ đóng gói dạng file mã hoá). Bật khi loại dữ liệu đó xuất
hiện thật, bằng cách thêm giá trị `Visibility` mới (tách khỏi `Permission/Scope`,
đúng khuyến nghị ở `VC-TK-004` Mục 10) — không cần đổi cấu trúc Mục 5-7.

## 9. Luồng kiểm tra quyền tại server action / route handler

Rút gọn từ 10 bước ở yêu cầu gốc §55, khớp với mô hình ở Mục 4:

```text
1. requireUser()          → có session hợp lệ? (lib/rbac.ts)
2. User.status === ACTIVE?  → chưa có field, bổ sung ở Mục 14
3. requireRole(...)        → role nằm trong danh sách cho permission này?
4. resolve resource        → load bản ghi theo id từ path/body (KHÔNG tin field
                              organizationId gửi từ client)
5. assertOrgScope / assertPartyScope / assertPermission
                            → so organizationId của resource với session, theo
                              scope ở Mục 7 (OWN so sánh ownerId, ORGANIZATION so
                              sánh đúng 1 organizationId, PARTY so khớp tập
                              organizationId liên quan tới Match — Mục 7.3,
                              PLATFORM bỏ qua)
6. business rule cụ thể    → VD: status hiện tại có cho phép transition không
7. execute (db write)
8. auditLog.create(...)    → bắt buộc cho mọi hành vi ghi (Mục 10)
9. revalidatePath(...)
```

Bước "Tenant Resolution" của mô hình tổng quát (§34 yêu cầu gốc, `VC-TK-004` Mục
28) hiện là no-op vì chỉ có 1 tenant (Mục 4) — khi có nhiều tenant, chèn bước này
giữa bước 1 và 2 mà không đổi các bước còn lại.

Nếu bước 2-6 không đạt → ném `ForbiddenError`/`AuthError` (đã có ở
`lib/domain/access-control.ts`, `lib/rbac.ts`), không âm thầm trả mảng rỗng.

## 10. Audit log — trường bắt buộc

`AuditLog` hiện có `userId, action, entity, entityId, meta, createdAt`. Bổ sung tối
thiểu có giá trị cao (không cần đủ bộ `IPAddress/UserAgent/CorrelationId` như §49
gốc/`VC-TK-004` Mục 32 ngay từ đầu, nhưng `before/after` có giá trị cao cho các
hành vi nhạy):

| Hành vi bắt buộc ghi audit                      | Đã ghi trong mã nguồn?                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `VERIFY_EXPERT_*`                                | Có (`lib/actions/experts.ts:30`)                                                 |
| `REVIEW_SOLUTION_*`                              | Có (`lib/actions/challenges.ts:113`)                                             |
| `CREATE_ORGANIZATION`, `SET_ORG_STATUS_*`      | Có (`lib/actions/organizations.ts`)                                              |
| `CONVERT_MATCH_TO_PROJECT`, `CREATE_AGREEMENT` | Có (`lib/actions/projects.ts`)                                                   |
| `MATCH_STAGE_*`                                  | Có (`lib/actions/matching.ts:142`)                                               |
| Đăng nhập thất bại (`FailedLogin`)          | **Chưa** — `lib/auth.ts` không ghi audit khi `authorize` trả `null` |
| Đổi role/permission của user                    | **Chưa có UI/action** — backlog Mục 14                                    |
| `signAgreementAction`                            | **Chưa** — không có `auditLog.create` (lib/actions/projects.ts:123-130) |

## 11. Trường hợp đặc biệt

- **Tài khoản bị vô hiệu hoá**: hiện `User` chưa có `status`. Bổ sung
  `status: ACTIVE | DISABLED`, chặn ở bước 2 của Mục 9. Vì mô hình hiện tại là
  1 user–1 org (Mục 4), không cần phân biệt "khoá tài khoản toàn hệ thống" và
  "khoá thành viên trong tổ chức" như §23 gốc — hai khái niệm trùng nhau cho tới
  khi bổ sung bảng `Membership`.
- **IDOR**: mọi action nhận `*Id` từ tham số phải load bản ghi rồi `assertOrgScope`
  trước khi ghi — xem khoảng trống cụ thể ở Phụ lục B.
- **Conflict of interest tối thiểu**: `reviewSolutionAction` nên chặn
  `user.id === solution.submittedById` (chưa có trong mã hiện tại — Phụ lục B).
- **Không dùng Explicit Deny**: hệ thống chỉ dùng allow-based authorization (đúng
  tinh thần §29 gốc khi "chưa triển khai Explicit Deny, phải ghi rõ hệ thống chỉ
  dùng allow-based authorization").

## 12. AI Assistant

Nếu module AI matching hoặc trợ lý AI nào truy vấn dữ liệu thay người dùng, phải
gọi qua cùng lớp `assertOrgScope`/permission như request thông thường của
`CurrentUser` đó — không dùng service account có quyền cao hơn user gọi (khớp
`VC-TK-004` Mục 15). Hiện `lib/matching.ts` chạy hoàn toàn nội bộ (không gọi API
AI ngoài), nhưng nguyên tắc này áp dụng ngay khi có AI Assistant tương tác trực
tiếp với người dùng.

## 13. Phần chưa bật trong ma trận hiện hành (và điều kiện bật thêm)

Mô hình ở Mục 3-9 đủ tổng quát để mở rộng bằng cách thêm dòng vào Mục 7 hoặc thêm
giá trị vào các enum ở Mục 5-6 — nhưng các phần dưới đây **chưa bật** vì chưa có
nghiệp vụ/mã nguồn thật tương ứng, hoặc bị `AGENTS.md` giới hạn tại thời điểm này:

1. **Cô lập dữ liệu chéo tổ chức kiểu multi-tenant SaaS thật ("DENY CROSS-TENANT
   mặc định")** — mâu thuẫn với tính năng lõi AI Matching cần đọc chéo tổ chức để
   ghép Need↔Supply (xem Mục 4, Mục 16). Đây là giới hạn của chính đặc thù VI
   CONNECT, không phải giới hạn tạm thời sẽ gỡ bỏ sau.
2. **Permission liên quan Funding/Investment** (`funding.review`, `funding.approve`,
   `investment.decision`, `due_diligence.view`) và giải ngân/đối soát tài chính
   thật — bị `AGENTS.md` cấm mở rộng ở thời điểm hiện tại (Mục 2, Mục 7.4).
   `FundingSource` giữ nguyên dạng stub (ghi chú, không phê duyệt) cho tới khi
   được đề án phê duyệt xây Funding Hub.
3. **Bảng `Membership` (multi-org), Workspace Selector, Personal Workspace** — mô
   hình ở Mục 4 đã dự phòng vị trí cho việc này; chỉ cần bổ sung khi có nghiệp vụ
   thật cần một người thuộc nhiều tổ chức với vai trò khác nhau.
4. **Các role nền tảng chuyên trách khác** (SecurityAdmin/DataAdmin/Auditor/
   SupportAdmin...) — thêm khi có đội ngũ vận hành chuyên trách tương ứng; Mục 5
   đã nêu rõ đây chỉ là thêm giá trị enum, không đổi cấu trúc.
5. **SSO (Entra ID/LDAP/Google Workspace)** — stack hiện chỉ có NextAuth
   Credentials; bật khi tổ chức tham gia yêu cầu SSO thật.
6. **Phân loại dữ liệu `CONFIDENTIAL/RESTRICTED` + MFA/IP allowlist/approval
   workflow** — bật khi loại dữ liệu nhạy cảm tương ứng xuất hiện trong schema
   (Mục 8).
7. **Delegation có hiệu lực thời gian, Support Access tạm thời, Invitation token
   qua email** — chưa có model `Invitation`/`Delegation`; bật khi luồng mời thành
   viên qua email được xây (hiện set trực tiếp qua admin/seed).
8. **ReBAC/ABAC "Authorization Engine" tổng quát, `ResourceAccessGrant`/
   `ResourceDeny` riêng** — với số lượng resource hiện tại, hàm scope-check thuần
   (`assertOrgScope`/`assertPartyScope`) là đủ (Mục 3, điểm 8); nâng cấp lên bảng
   cấu hình khi số lượng role/permission thực tế lớn hơn.
9. **Bộ 56 test §56 của yêu cầu gốc nguyên văn** — nhiều test giả định cơ chế chưa
   tồn tại (cross-tenant thật, cache theo tenant, SSO, background job theo
   tenant). Bộ test tối thiểu thực tế cho hiện trạng nêu ở Mục 15.

## 14. Kế hoạch triển khai kỹ thuật (khi tài liệu này được duyệt)

| Việc                                                                                 | File                                                                        | Ghi chú                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bảng permission tĩnh`Record<Role, string[]>` theo Mục 7                          | `lib/domain/access-control.ts` (mới: `permissions.ts` cùng thư mục) | Thay dần các`role === "..."` rải rác                                                                                                                                                                                                                                      |
| Hàm`assertPermission(user, "resource.action", {organizationId?, ownerId?})`        | `lib/domain/access-control.ts`                                            | Mở rộng`assertOrgScope` hiện có, giữ tương thích ngược                                                                                                                                                                                                              |
| Hàm`assertPartyScope(user, project)` cho domain EXECUTE (Mục 7.3, chú thích ³) | `lib/domain/access-control.ts`                                            | Load`Project.match.{need, supply, expertProfile.organization}`, kiểm tra `user.organizationId` thuộc tập organizationId liên quan; dùng cho `project/milestone/deliverable/agreement.*`                                                                              |
| ~~Đổi tên `Role` enum: `VAST_ADMIN → SUPERADMIN`, `HOI_ADMIN → ADMIN`~~ | `prisma/schema.prisma`, migration `20260818115702_rename_role_superadmin_admin`, `prisma/seed.ts` | **Đã hoàn tất** — `ALTER TYPE "Role" RENAME VALUE`, giữ nguyên dữ liệu; cập nhật toàn bộ `requireRole(...)`/so sánh role trong `lib/`, `app/`; xem Phụ lục B, B11 |
| Thêm`User.status ACTIVE\|DISABLED`                                                  | `prisma/schema.prisma` + migration mới                                   | Không sửa migration cũ, đúng`AGENTS.md`                                                                                                                                                                                                                                  |
| Mở rộng`AuditLog`: `before Json?`, `after Json?`                              | `prisma/schema.prisma` + migration mới                                   | `ipAddress/userAgent/correlationId` khi có middleware phù hợp                                                                                                                                                                                                              |
| Vá các khoảng trống ở Phụ lục B                                                | `lib/actions/projects.ts`, `lib/actions/matching.ts`                    | Ưu tiên trước khi có dữ liệu thật nhiều tổ chức                                                                                                                                                                                                                      |

## 15. Test bắt buộc tối thiểu

1. `ADMIN` tổ chức A không đọc/sửa được `Need`/`Supply`/`Challenge` của tổ chức B.
2. `ENTERPRISE` không `convertMatchToProjectAction` được match của tổ chức khác;
   ngược lại, `ENTERPRISE`/`ADMIN` ở **bên cung** (`Supply`/chuyên gia thuộc tổ
   chức mình) vẫn phải xem/sửa được `Project` dù không phải bên tạo `Need` (kiểm
   tra `assertPartyScope`, không phải `assertOrgScope` — Mục 7.3).
3. `EXPERT`/`VIEWER` không gọi được các action giới hạn `requireRole("SUPERADMIN", "ADMIN", "ENTERPRISE")`.
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
[https://viblo.asia/p/co-ban-ve-multi-tenant-architecture-QyJKzZO74Me](https://viblo.asia/p/co-ban-ve-multi-tenant-architecture-QyJKzZO74Me) (truy cập
2026-08-17). Bài viết trình bày 3 mô hình triển khai multi-tenant phổ biến:

| Mô hình                        | Mô tả                                                                                  | Phù hợp cho (theo bài viết)                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Shared Database, Shared Schema   | 1 database, 1 bộ bảng, phân biệt bằng cột định danh khách thuê (`tenant_id`) | Dự án nhỏ, chi phí thấp                                                                              |
| Shared Database, Separate Schema | 1 database, mỗi khách thuê 1 schema riêng                                            | Cần cô lập logic tốt hơn; đánh đổi bằng độ phức tạp quản trị và rủi ro "Noisy Neighbor" |
| Separate Database per Tenant     | Mỗi khách thuê 1 database/server riêng                                               | Khách hàng Enterprise, ngành tài chính, cần bảo mật/mở rộng độc lập tuyệt đối             |

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
   không phù hợp ở quy mô hiện tại**: cả hai được chính bài viết khuyến nghị cho
   khách hàng Enterprise/tài chính cần cô lập tuyệt đối — VI CONNECT hiện không
   bán license hạ tầng riêng cho từng tổ chức, không có yêu cầu compliance buộc
   tách database, và các tổ chức tham gia là **người dùng trong cùng một nền
   tảng do VAST/HTIC vận hành**, không phải khách thuê hạ tầng độc lập. Áp mô
   hình này sẽ phát sinh đúng nhược điểm bài viết nêu ("chi phí cực cao, khó
   quản lý hàng loạt") mà không giải quyết nhu cầu thật nào hiện nay.
4. **Rủi ro "Noisy Neighbor" và rủi ro bảo mật của Shared Schema mà bài viết nêu
   là có thật và cần phòng ngừa** — nhưng bằng kỷ luật ở tầng ứng dụng (mọi truy
   vấn đi qua `assertOrgScope`/`assertPartyScope`/`assertPermission`, không viết
   raw query bỏ qua lớp này — Mục 3, 9), chứ không phải bằng cách tách database.
   Đây chính là lý do Phụ lục B xếp các chỗ thiếu `assertOrgScope` ở mức rủi ro
   Cao — rủi ro nằm ở thiếu enforcement tầng ứng dụng, không phải ở thiếu tách
   hạ tầng.

### 16.2 Kết luận

Giữ nguyên hướng thiết kế ở Mục 4 và Mục 13, điểm 1: **không áp dụng mô hình
multi-tenant cô lập** (dạng schema riêng hay database riêng) cho VI CONNECT ở
quy mô/nhu cầu hiện tại. Tài liệu tham khảo xác nhận thêm rằng cả 3 mô hình phổ
biến đều giả định "khách thuê không cần thấy dữ liệu nhau" — tiền đề không đúng
với nền tảng này. Nếu về sau VI CONNECT mở rộng sang mô hình thương mại hoá, bán
license riêng cho từng tổ chức có yêu cầu compliance cao hơn, có thể xem xét lại
"Shared Database, Separate Schema" cho nhóm khách đó — đây là điều kiện mở rộng
trong tương lai (Mục 4 đã dự phòng vị trí cho tầng `Tenant`), không phải nhu cầu
hiện tại.

## Phụ lục A — Đối chiếu với yêu cầu 58 mục gốc

| Nhóm mục gốc                                                                                                    | Trạng thái                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| §1, §29 (nguyên tắc chung, allow-based)                                                                        | Áp dụng, rút gọn — Mục 3, 11                                                                                             |
| §2-§6 (Membership/Tenant/Unit/resource.action/scope)                                                             | Rút gọn còn mô hình Mục 4, scope Mục 6, permission Mục 7                                                               |
| §7-§9 (Workspace Selector, Personal Workspace)                                                                   | Chưa bật — Mục 13, điểm 3                                                                                                |
| §10-§14 (nhiều đơn vị, nhiều role, kế thừa role, lãnh đạo/trưởng phòng)                             | Không áp dụng hiện tại — không có Unit/Department dưới Organization; enum scope có thể mở rộng khi cần (Mục 6) |
| §15-§19 (chuyên gia, reviewer, funder, guest, người ngoài tổ chức)                                         | Áp dụng phần chuyên gia/reviewer/guest (Mục 7); Funder chưa bật (Mục 13, điểm 2)                                     |
| §20-§22 (cross-tenant, public/private, phân loại dữ liệu)                                                    | Thay bằng quy tắc PUBLISHED — Mục 8                                                                                        |
| §23-§28 (disable, rời tổ chức, đổi role, quyền tạm thời, ủy quyền)                                     | Áp dụng tối thiểu (disable) — Mục 11; còn lại chưa bật — Mục 13, điểm 7                                          |
| §31 (Maker-Checker)                                                                                               | Chưa bật — gắn với Funding module chưa xây (Mục 13, điểm 2)                                                          |
| §32-§33 (SuperAdmin/TenantAdmin)                                                                                 | Rút gọn còn`SUPERADMIN`/`ADMIN` — Mục 5                                                                               |
| §34-§39 (API flow, IDOR, tenant giả, export, download, search)                                                  | Áp dụng — Mục 9; export/search chưa có tính năng, ghi nhận là việc cần làm khi tính năng xuất hiện            |
| §40-§41 (AI Assistant, background job)                                                                           | AI Assistant áp dụng nguyên tắc — Mục 12; background job: chưa có job nào cần TenantContext                          |
| §42-§44 (cache, notification, session)                                                                           | Chưa có cache/notification theo tenant; session đã đúng cấu trúc tối thiểu qua JWT                                   |
| §45 (SSO)                                                                                                         | Chưa bật — Mục 13, điểm 5                                                                                                |
| §46-§48 (chưa có membership, invitation, xoá user)                                                            | Invitation chưa bật — Mục 13, điểm 7; xoá user: đã dùng soft-status — Mục 11                                       |
| §49 (audit)                                                                                                       | Áp dụng tối thiểu — Mục 10                                                                                               |
| §50-§55 (UI convenience, màn hình quản trị, ma trận quyền, entity, authorize function, thứ tự ưu tiên) | Áp dụng — Mục 7, 9; màn hình quản trị quyền là việc UI cần làm riêng                                             |
| §56 (56 test)                                                                                                     | Rút gọn còn 8 test cốt lõi — Mục 15                                                                                     |
| §57-§58 (kiến trúc chính thức, yêu cầu coder)                                                              | Rút gọn theo Mục 3-4; các cấm chỉ (không hard-code role, không tin TenantId client...) giữ nguyên                    |

## Phụ lục B — Khoảng trống đã phát hiện trong mã nguồn hiện tại

Phát hiện khi đối chiếu yêu cầu với `lib/actions/*.ts`; **chưa sửa trong tài liệu
này**, cần PR riêng sau khi thiết kế được duyệt.

| #   | Vị trí                                                                                                                                                                                                                          | Vấn đề                                                                                                                                                                                                                                                                                                                                                                         | Mức độ                                              | Trạng thái                                                                                                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | `lib/actions/projects.ts` `addMilestoneAction`, `setMilestoneStatusAction`                                                                                                                                                  | Chỉ`requireUser()`, không `assertOrgScope`/`assertPartyScope` theo tổ chức liên quan `Project` → user bất kỳ tổ chức nào cũng sửa được milestone của project bất kỳ                                                                                                                                                                                    | Cao (IDOR)                                             | **Đã vá** — thêm `requireRole` + `assertPartyScope`; `setMilestoneStatusAction` còn kiểm tra thêm `milestone.projectId === projectId` (chặn milestoneId thuộc project khác bị dùng lẫn) |
| B2  | `lib/actions/matching.ts` `generateMatchesAction`                                                                                                                                                                             | Chỉ`requireUser()`, không kiểm tra `need.organizationId` thuộc phạm vi user                                                                                                                                                                                                                                                                                              | Trung bình                                            | **Đã vá** — thêm `requireRole` + `assertOrgScope(need.organizationId)`                                                                                                                               |
| B3  | `lib/actions/matching.ts` `updateMatchStageAction`                                                                                                                                                                            | Chỉ`requireUser()`, không `assertOrgScope` → đổi được stage của match bất kỳ tổ chức nào                                                                                                                                                                                                                                                                        | Cao (IDOR)                                             | **Đã vá** — thêm `requireRole` + `assertOrgScope(match.need.organizationId)`                                                                                                                         |
| B4  | `lib/actions/projects.ts` `convertMatchToProjectAction`, `createAgreementAction`, `signAgreementAction`                                                                                                                   | Có`requireRole` nhưng thiếu `assertPartyScope` theo các tổ chức liên quan `Match` gốc → `ADMIN`/`ENTERPRISE` tổ chức A thao tác được trên project của tổ chức B dù không liên quan                                                                                                                                                                | Cao (IDOR)                                             | **Đã vá** — thêm `assertPartyScope` cho cả 3 action; `signAgreementAction` được bổ sung thêm `auditLog.create` (trước đây thiếu, xem Mục 10)                                           |
| B5  | `lib/actions/challenges.ts:77` `submitSolutionAction`                                                                                                                                                                         | Chỉ`requireUser()` — cần quyết định nghiệp vụ: `VIEWER` có được nộp giải pháp không                                                                                                                                                                                                                                                                           | Thấp (cần quyết định, không phải lỗi)          | Chưa xử lý — chờ quyết định nghiệp vụ                                                                                                                                                                     |
| B6  | `lib/actions/matching.ts:81` `createSupplyAction` | `requireRole("SUPERADMIN", "ADMIN")` — không có `EXPERT`, trong khi README mô tả chuyên gia đăng công nghệ/dịch vụ của mình | Cần xác nhận nghiệp vụ (Mục 7.2, chú thích ²) | Chưa xử lý — chờ quyết định nghiệp vụ |
| B7  | `lib/auth.ts` (hàm `authorize`)                                                                                                                                                                                              | Không ghi`AuditLog` khi đăng nhập thất bại                                                                                                                                                                                                                                                                                                                                | Thấp                                                  | **Đã vá** — ghi `LOGIN_FAILED` (không lưu password) cho cả 2 trường hợp: email không tồn tại và sai mật khẩu                                                                                |
| B8  | `lib/actions/matching.ts` (`createNeedAction`, `createSupplyAction`)                                                                                                                                                        | Không có action`update`/`publish`/`close` cho `Need`, không có `update`/`archive` cho `Supply` — Mục 7.2 liệt kê các quyền này như đã có nhưng chưa code hoá; mọi `Need`/`Supply` được set thẳng `status: PUBLISHED` khi tạo, không có bước `DRAFT` nào trong luồng thật (Mục 8 hiện không áp dụng cho dữ liệu thật) | Tài liệu vượt trước mã nguồn                   | Chưa xử lý — là tính năng mới, không phải lỗ hổng                                                                                                                                                       |
| B9  | `lib/actions/` (toàn bộ)                                                                                                                                                                                                      | Không có action nào tạo/mời thành viên vào tổ chức (`user.create`, Mục 7.1) — tài khoản hiện chỉ tạo qua `prisma/seed.ts`                                                                                                                                                                                                                                    | Tài liệu vượt trước mã nguồn                   | Chưa xử lý — là tính năng mới, không phải lỗ hổng                                                                                                                                                       |
| B10 | `prisma/schema.prisma` (`User.organizationId` và `ExpertProfile.organizationId`)                                                                                                                                           | Hai trường độc lập, không có ràng buộc đảm bảo luôn khớp nhau — các scope check trong Mục 9 dựa trên`session.user.organizationId`, có thể sai với `ExpertProfile` thật nếu 2 giá trị lệch nhau                                                                                                                                                     | Rủi ro dữ liệu                                      | Chưa xử lý — cần ràng buộc ở tầng action tạo/sửa`ExpertProfile`                                                                                                                                        |
| B11 | `prisma/schema.prisma` (`Role` enum), toàn bộ `requireRole(...)`/so sánh role trong `lib/rbac.ts`, `lib/domain/access-control.ts`, `lib/actions/*.ts`, `lib/auth.ts`, `app/`, `components/`, `prisma/seed.ts` | Đổi tên role (`VAST_ADMIN → SUPERADMIN`, `HOI_ADMIN → ADMIN`) ở Mục 5 | Breaking change (schema) | **Đã vá** — migration `20260818115702_rename_role_superadmin_admin` dùng `ALTER TYPE ... RENAME VALUE` (không mất dữ liệu, xác nhận qua `SELECT role, count(*) FROM "User" GROUP BY role`); 31 file code/tài liệu cập nhật đồng loạt; `npm run check` qua |
| B12 | `lib/domain/access-control.ts` `assertOrgScope` (phát hiện khi vá B4) | Trước khi vá: hàm chỉ cho qua `VAST_ADMIN` hoặc `HOI_ADMIN` khớp tổ chức — **`ENTERPRISE` luôn bị `ForbiddenError` dù đúng tổ chức mình**, dù `requireRole` ở nhiều action đã cho phép `ENTERPRISE` (VD: `setChallengeStatusAction`). Đây là lỗi làm mất chức năng (over-restrictive), không phải IDOR | Cao (chức năng ENTERPRISE bị chặn nhầm) | **Đã vá** — `assertOrgScope` dùng `ORG_SCOPED_ROLES = {ADMIN, ENTERPRISE}`; `assertPartyScope` dùng chung tập role này |

Đã vá B1-B4, B7, B11, B12. B11 (đổi tên role) áp dụng trên toàn hệ thống trong
một lần — schema, migration, mọi server action, route handler, trang dashboard,
component, seed và tài liệu liên quan (31 file) — không chia theo giai đoạn.
`npm run check` (lint, typecheck, test, prisma validate, build) đã chạy qua sau
khi vá. B5, B6, B8-B10 còn treo — cần quyết định nghiệp vụ, không phải lỗ hổng
bảo mật hay việc kỹ thuật đơn thuần.

---

*Tài liệu này ở trạng thái DRAFT. Sau khi rà soát nghiệp vụ (đặc biệt B5, B6, B8-B10
và chú thích ⁴ ở Mục 7.5), cập nhật thành `v1.0` với trạng thái `APPROVED`, đồng
thời cập nhật
`00_QUAN-TRI/VC-QT-003-DanhMucTaiLieu-APPROVED_v1.6_20260819.md`.*
