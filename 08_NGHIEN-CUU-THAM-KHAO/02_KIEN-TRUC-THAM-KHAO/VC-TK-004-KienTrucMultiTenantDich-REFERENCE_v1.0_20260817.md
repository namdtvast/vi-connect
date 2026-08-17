# THIẾT KẾ MULTI-TENANT — TÀI LIỆU THAM KHẢO (NGUỒN: CODEX)

**Mã tài liệu:** VC-TK-004
**Phiên bản:** v1.0
**Ngày lưu:** 2026-08-17
**Trạng thái:** REFERENCE — tài liệu tham khảo bên ngoài, KHÔNG phải văn bản điều hành của VI CONNECT, KHÔNG thay thế `VC-KT-002`
**Nơi lưu chuẩn:** `08_NGHIEN-CUU-THAM-KHAO/02_KIEN-TRUC-THAM-KHAO/VC-TK-004-KienTrucMultiTenantDich-REFERENCE_v1.0_20260817.md`

## Ghi chú biên tập (đọc trước khi dùng)

Nội dung bên dưới do một phiên làm việc Codex/ChatGPT khác tạo ra (nguồn:
`~/.codex/.chatgpt-projects/g-p-6a7de47f6dc881918cc4943e620710ed/VI_CONNECT_VC-KT-002_THIET_KE_PHAN_QUYEN_MULTI_TENANT_v1.0.md`),
tự đặt mã `VC-KT-002` và tự nhận trạng thái `APPROVED FOR IMPLEMENTATION`.

Theo `VC-QT-001` Mục 4 (mỗi mã tài liệu chỉ dùng cho **một dòng nội dung tiếp
nối**) và Mục 11 (phê duyệt tài liệu thuộc thẩm quyền Quản trị VI CONNECT), nội
dung này **không được kế thừa mã `VC-KT-002`** — nó là một tài liệu khác hẳn về
mục tiêu và kết luận, không phải phiên bản mới của cùng thiết kế. Vì vậy được lưu
lại dưới mã mới `VC-TK-004`, trạng thái `REFERENCE`, và **không có hiệu lực áp
dụng** cho tới khi được rà soát và phê duyệt riêng.

`VC-KT-002` hiện hành (thiết kế phân quyền Giai đoạn 1, đã đối chiếu từng dòng với
mã nguồn thật) vẫn giữ nguyên tại
[`03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/VC-KT-002-ThietKePhanQuyen-DRAFT_v0.1_20260817.md`](../../03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/VC-KT-002-ThietKePhanQuyen-DRAFT_v0.1_20260817.md)
và là **căn cứ triển khai hiện hành duy nhất**.

### Vì sao không dùng trực tiếp làm căn cứ triển khai

- Đề xuất xây multi-tenant SaaS đầy đủ (Tenant, Membership, hybrid database
  isolation, hỗ trợ 10–10.000 tenant) ngay từ đầu — trái nguyên tắc "không mở
  rộng chỉ vì hoàn thành phần mềm" mà `docs/SCOPE.md` đã tự đặt ra cho đề án.
- Liệt kê `funding.approve` (Mục 6) và xếp "Vốn & Đầu tư" vào 11 cấu phần phải
  dùng chung kiến trúc phân quyền ngay (Mục 16) — vi phạm trực tiếp `AGENTS.md`:
  *"MVP Giai đoạn 1; không tự mở rộng sang giải ngân, đầu tư."*
- Không đối chiếu với `prisma/schema.prisma` hay `lib/actions/*.ts` thật của
  repo — là kiến trúc tổng quát cho một nền tảng multi-tenant giả định, chưa gắn
  với hiện trạng mã nguồn VI CONNECT tại thời điểm này.
- Tự gắn nhãn "APPROVED FOR IMPLEMENTATION" nhưng chưa qua bất kỳ quy trình phê
  duyệt nào của VI CONNECT; các câu hỏi nghiệp vụ còn treo ở `VC-KT-002` (B5, B6,
  phạm vi KPI) cũng không được nội dung này giải quyết.

### Giá trị tham khảo

Có thể dùng làm gợi ý định hướng dài hạn khi VI CONNECT thật sự cần mở rộng sang
multi-tenant/multi-organization membership ở Giai đoạn 2-3 (đặc biệt các khái
niệm `PARTY` scope, Shared Exchange Layer cho matching liên tổ chức, và
`TenantAwareRepository`) — nhưng phải đối chiếu lại với hiện trạng mã nguồn tại
thời điểm đó, và phải tách riêng phần liên quan tới giải ngân/đầu tư ra khỏi mọi
lần áp dụng trước khi cấu phần Mobilize/Funding Hub thật được đề án phê duyệt xây.

---

## Nội dung nguồn (giữ nguyên như file gốc)

# THIẾT KẾ PHÂN QUYỀN VÀ MULTI-TENANT VI-CONNECT

**Mã tài liệu:** `VC-KT-002` *(mã gốc do file nguồn tự đặt — xem ghi chú biên tập ở trên, tài liệu này lưu dưới mã `VC-TK-004`)*
**Phiên bản:** `v1.0`
**Ngày:** 2026-08-17
**Trạng thái:** `APPROVED FOR IMPLEMENTATION` *(nhãn tự gắn của file nguồn — chưa qua phê duyệt của VI CONNECT, xem ghi chú biên tập ở trên)*
**Phạm vi:** Kiến trúc đích về tài khoản, đăng nhập, multi-tenant, membership, vai trò, quyền, phạm vi dữ liệu, khả năng hiển thị, chia sẻ liên tổ chức, AI/Matching và audit cho toàn bộ nền tảng VI-CONNECT.

---

# 1. MỤC TIÊU THIẾT KẾ PHÂN QUYỀN VI-CONNECT

## 1.1. Mục tiêu tổng quát

Hệ thống phân quyền của VI-CONNECT được xây dựng **cho toàn bộ nền tảng**, không chỉ cho một giai đoạn, một module hoặc một nhóm người dùng cụ thể.

Mục tiêu là xây dựng một kiến trúc tài khoản và phân quyền thống nhất để VI-CONNECT phục vụ đồng thời cá nhân, chuyên gia, nhà khoa học, doanh nghiệp, viện nghiên cứu, trường đại học, hội và tổ chức khoa học công nghệ, cơ quan quản lý, tổ chức tài trợ, nhà đầu tư, hội đồng chuyên gia, các đơn vị trực thuộc và các dự án, chương trình, mạng lưới hợp tác liên tổ chức.

Kiến trúc phải sử dụng lâu dài khi VI-CONNECT mở rộng từ một số tổ chức ban đầu lên hàng trăm hoặc hàng nghìn tổ chức mà **không phải thiết kế lại hệ thống tài khoản, tenant và phân quyền từ đầu**.

## 1.2. Nguyên tắc dễ hiểu nhất

> **Một người có một tài khoản VI-CONNECT, nhưng có thể tham gia nhiều tổ chức và có quyền khác nhau ở từng nơi.**

```text
Nguyễn Văn A
├── VAST: Nhà khoa học
├── HTIC: Chuyên gia
└── Dự án P001: Reviewer
```

Không thiết kế:

```text
User
├── organizationId duy nhất
└── role duy nhất
```

Mô hình nền tảng:

```text
User → Membership → Tenant/Organization → Role → Permission
     → Data Scope → Resource/Project/Relationship
```

---

# 2. MỤC TIÊU VỀ MULTI-TENANT

VI-CONNECT phải được xây dựng theo kiến trúc **SaaS Multi-Tenant**: một nền tảng dùng chung, nhưng mỗi tenant có không gian làm việc, người dùng, cấu hình, quyền và dữ liệu riêng.

Mỗi tenant có thể có Users, Organizations, Organization Units, Roles, Permissions, Projects, Workflows, Settings, Data và Audit riêng.

---

# 3. PHÂN BIỆT TENANT VÀ ORGANIZATION

- **Tenant** là ranh giới vận hành và bảo mật: xác định dữ liệu, quản trị, cấu hình, module, chính sách bảo mật, domain, workflow và phương án lưu trữ.
- **Organization** là thực thể tổ chức nghiệp vụ. Một tenant có thể có nhiều organization và đơn vị trực thuộc.

> **Không được coi `Organization = Tenant`.**

---

# 4. MỤC TIÊU VỀ TÀI KHOẢN

Một người chỉ cần một `User` trên toàn VI-CONNECT. Quan hệ của người dùng với từng tenant/tổ chức được quản lý bằng `Membership`.

```text
User
├── Membership 01: Tenant VAST / Organization Viện A / Role EXPERT
└── Membership 02: Tenant HTIC / Organization HTIC / Role REVIEWER
```

Khi người dùng rời tổ chức, chuyển `Membership = INACTIVE`, không xóa User toàn hệ thống.

---

# 5. MỤC TIÊU VỀ VAI TRÒ VÀ QUYỀN

Quyền thực tế được xác định theo:

```text
User + Membership + Tenant + Role + Permission
+ Data Scope + Resource Relationship + Context
```

Role không được gắn cứng toàn cục vào User.

---

# 6. PERMISSION PHẢI ĐƯỢC CHUẨN HÓA

Permission dùng thống nhất dạng `resource.action`, ví dụ:

```text
user.view                  organization.manage
expertProfile.verify       need.publish
supply.publish             match.generate
project.update             funding.approve
report.export
```

Không hard-code kiểu `if role == "ADMIN"` trong từng API hoặc action.

---

# 7. DATA SCOPE — PHẠM VI DỮ LIỆU

Permission trả lời **được làm gì**; Data Scope trả lời **được làm với dữ liệu nào**.

```text
OWN | TEAM | UNIT | ORGANIZATION | TENANT
PROJECT | PARTY | NETWORK | PLATFORM | CUSTOM
```

`PARTY` dùng cho dữ liệu mà người dùng/tổ chức là một bên tham gia, đặc biệt quan trọng với Match, Agreement, Project và Collaboration liên tổ chức.

---

# 8. TENANT ISOLATION — DỮ LIỆU RIÊNG PHẢI ĐƯỢC CÔ LẬP

```text
PRIVATE TENANT DATA → DENY CROSS-TENANT
```

Tenant A không được đọc hoặc sửa dữ liệu riêng của Tenant B chỉ vì biết ID hoặc URL. Backend phải kiểm tra; việc frontend ẩn nút không phải cơ chế bảo mật.

---

# 9. MULTI-TENANT KHÔNG ĐƯỢC CẢN CONNECT VÀ MATCHING

Tenant Isolation và kết nối liên tổ chức được giải quyết bằng lớp chia sẻ có chủ đích:

```text
Tenant A Private Data
        │ Publish/Share
        ▼
Shared Exchange Layer → Search/Discover/Recommendation/Matching
        ▲
        │ Publish/Share
Tenant B Private Data
```

Matching Engine chỉ đọc dữ liệu `PUBLIC`, `SHARED` hoặc `MATCHABLE`, không đọc toàn bộ dữ liệu riêng của tenant.

---

# 10. PHÂN LOẠI KHẢ NĂNG HIỂN THỊ DỮ LIỆU

Tách `Permission/Data Scope` khỏi `Visibility`.

```text
PRIVATE | TENANT | SHARED | PUBLIC
```

`DRAFT/PUBLISHED` là trạng thái vòng đời, không phải Data Scope. Có thể ánh xạ ban đầu `DRAFT → PRIVATE/TENANT`, `PUBLISHED → PUBLIC` nhưng phải giữ hai khái niệm độc lập.

---

# 11. PHÂN QUYỀN DỰ ÁN VÀ HỢP TÁC LIÊN TỔ CHỨC

Không chỉ kiểm tra `project.organizationId == user.organizationId`. Phải hỗ trợ `ProjectMembership`, `Party`, `ResourceAccessGrant` hoặc cơ chế tương đương để xác định người/bên tham gia và quyền được chia sẻ.

---

# 12. CÁ NHÂN HÓA SAU ĐĂNG NHẬP

Sau đăng nhập, hệ thống phải xác định:

```text
CurrentUser
CurrentTenant
CurrentMembership
CurrentOrganization
CurrentRole
CurrentPermissions
CurrentDataScopes
```

Sau đó mới sinh menu, dashboard, chức năng, dữ liệu, thông báo và AI context.

---

# 13. NGƯỜI DÙNG THUỘC NHIỀU TỔ CHỨC

- Một tenant: tự động chọn workspace và mở dashboard.
- Nhiều tenant: hiển thị Workspace Selector.
- Khi đổi tenant: thay Tenant Context, nạp lại permission, scope, dashboard và xóa dữ liệu/cache của tenant cũ khỏi context.

Không cần đăng nhập lại khi chuyển workspace hợp lệ.

---

# 14. PERSONAL WORKSPACE

VI-CONNECT hỗ trợ Personal Workspace gồm hồ sơ chuyên gia, năng lực, công bố, bằng sáng chế, dự án, kết nối, thông báo, nhiệm vụ và AI Assistant. Personal Workspace thuộc User, không thuộc duy nhất một Organization.

---

# 15. AI ASSISTANT VÀ MATCHING ENGINE PHẢI TÁCH QUYỀN

- **AI Assistant:** quyền bằng quyền của CurrentUser trong context hiện tại; không thấy dữ liệu ngoài quyền của người dùng.
- **Matching Engine:** dùng Service Identity riêng với quyền tối thiểu như `matchableResource.read`, `matchResult.create`; không cấp `tenantPrivateData.readAll`.

---

# 16. PHÂN QUYỀN PHẢI ÁP DỤNG CHO TOÀN BỘ VI-CONNECT

Thiết kế áp dụng cho toàn bộ 11 cấu phần hiện tại và tương lai:

1. Hồ sơ & Định danh
2. Công nghệ & Giải pháp
3. Tri thức & Dữ liệu khoa học
4. Bài toán & Nhu cầu
5. Cơ hội & Đề xuất
6. Kết nối & Matching
7. Huy động & Hợp đồng
8. Vốn & Đầu tư
9. Hệ sinh thái & Mạng lưới
10. Quản trị tổ chức
11. Điều hành & Báo cáo

Không xây hệ phân quyền riêng cho từng module.

---

# 17. BACKEND LÀ NƠI QUYẾT ĐỊNH QUYỀN

```text
Authentication → Resolve User → Resolve Membership → Resolve Tenant
→ Check Membership Status → Check Permission → Load Resource
→ Check Tenant → Check Data Scope → Check Visibility
→ Check Relationship/Party/Grant → Check Business Rule
→ ALLOW/DENY → Audit
```

Frontend chỉ dùng permission để Show/Hide hoặc Enable/Disable.

---

# 18. QUY TẮC CHỐNG IDOR

Mọi API nhận `resourceId` phải load resource rồi kiểm tra Tenant, Membership, Permission, Scope, Party/Relationship/Grant trước khi thao tác. Không được chỉ `requireUser()` rồi cập nhật bằng ID do client gửi.

Các lỗi IDOR đã xác định trong code hiện tại là hạng mục bắt buộc xử lý.

---

# 19. AUDIT

Các thao tác đăng nhập, đổi tenant, quản lý user/membership/role/permission, publish, review, approve, matching, project, agreement, share, export và tải dữ liệu nhạy cảm phải ghi AuditLog.

Audit tối thiểu xác định được:

```text
Who | When | Tenant | Action | Resource | Before | After
```

---

# 20. NGUYÊN TẮC DEFAULT DENY

> **Không chứng minh được quyền → DENY.**

Nếu thiếu User, Membership, Tenant, Permission, Scope, Relationship hoặc Grant bắt buộc thì backend phải từ chối truy cập.

---

# 21. KIẾN TRÚC MULTI-TENANT DATABASE

VI-CONNECT hỗ trợ kiến trúc Hybrid:

- **Mức 1:** Shared Application + Shared Database + TenantId.
- **Mức 2:** Shared Application + Database riêng cho tenant.
- **Mức 3:** Application, Database, Storage và AI services riêng.

Business API không được phải viết lại khi tenant chuyển mức cô lập.

---

# 22. MỤC TIÊU CUỐI CÙNG CỦA PHÂN QUYỀN

> **1. Một User có thể thuộc nhiều Tenant.**
> **2. Role thuộc Membership/context, không gắn cứng vào User.**
> **3. Tenant giữ dữ liệu riêng; dữ liệu liên tổ chức chỉ chia sẻ có chủ đích.**
> **4. Permission cho biết được làm gì; Scope cho biết được làm với dữ liệu nào.**
> **5. Matching chỉ dùng dữ liệu PUBLIC/SHARED/MATCHABLE.**
> **6. Tất cả 11 cấu phần dùng chung một Authorization Architecture.**

---

# 23. KIẾN TRÚC CHÍNH THỨC

```text
VI-CONNECT
└── Identity
    └── User
        └── Membership
            ├── Tenant
            └── Organization
                └── Role
                    └── Permission
                        └── Scope
                            └── Resource
                                ├── Private Data
                                └── Shared/Public
                                    └── Shared Exchange
                                        └── Search/Matching
                                            └── Collaboration/Project/Impact
```

---

# 24. YÊU CẦU ĐỐI VỚI CODER

Kiến trúc này là **kiến trúc đích cho toàn bộ VI-CONNECT**. Có thể chia triển khai thành Sprint hoặc Phase, nhưng không xây kiến trúc tạm thời trái với mô hình đích. Code và migration mới phải tiến dần về mô hình này; `Tenant`, `Membership`, `TenantContext`, Permission và Authorization là hạ tầng lõi.

> **Thiết kế một lần cho toàn VI-CONNECT — triển khai từng bước theo ưu tiên.**

---

# 25. PROJECT AUTHORIZATION

Project có thể có `ownerTenantId`, `ownerOrganizationId`, nhiều `ProjectMembership` và nhiều Party. Quyền phải dựa trên permission, scope và quan hệ tham gia, không chỉ dựa trên tổ chức sở hữu.

---

# 26. QUY TẮC AUTHORIZATION SERVER

Mọi Server Action/Route Handler phải: xác thực User; kiểm tra trạng thái User và Membership; resolve TenantContext; kiểm tra Permission; load Resource; kiểm tra Tenant, Data Scope, Visibility, Relationship/Grant và business rule; thực thi; ghi Audit; invalidation cache khi cần.

---

# 27. HÀM AUTHORIZATION CHUẨN

Xây API nội bộ thống nhất:

```ts
authorize({ user, membership, tenant, permission, resource, context })
```

Kết quả chỉ là `ALLOW` hoặc `DENY`. Không viết logic authorization phân tán theo từng action.

---

# 28. TENANT RESOLVER

Tenant Context được xác định từ Authenticated Session + Membership + Trusted Server Context; có thể kết hợp subdomain, custom domain hoặc JWT claim. Không tin trực tiếp `tenantId`, `organizationId` hoặc `X-Tenant-ID` do client gửi nếu server chưa xác minh membership.

---

# 29. QUERY FILTER

Mọi entity private thuộc tenant phải có `tenantId`. Truy vấn mặc định phải giới hạn theo `CurrentTenantId` thông qua repository/service tập trung như `TenantAwareRepository` hoặc `TenantQueryService`, tránh phụ thuộc vào việc developer nhớ thêm filter thủ công.

---

# 30. IDOR — YÊU CẦU BẮT BUỘC

Biết `resourceId` không đồng nghĩa có quyền. Mọi thao tác phải load resource, kiểm tra tenant, permission, scope và relationship trước khi đọc, sửa hoặc tạo resource con.

---

# 31. CÁC LỖI HIỆN TẠI PHẢI SỬA

- **B1:** `addMilestoneAction`, `setMilestoneStatusAction` thiếu ownership/scope.
- **B2:** `generateMatchesAction` phải xác minh quyền trên Need và chỉ dùng Shared Exchange.
- **B3:** `updateMatchStageAction` phải kiểm tra quyền trên Match.
- **B4:** `convertMatchToProjectAction`, `createAgreementAction`, `signAgreementAction` phải kiểm tra tenant, organization, relationship và permission.
- **B5:** `submitSolutionAction`: EXPERT/ENTERPRISE được submit khi Challenge PUBLIC hoặc được share; VIEWER không được submit.
- **B6:** `createSupplyAction`: bổ sung EXPERT với `scope = OWN`.
- **B7:** Failed Login phải có Audit/Security log; không ghi password/credential.

---

# 32. CẤU TRÚC AUDIT LOG

```text
AuditLog
Id | TenantId? | MembershipId? | UserId | Action
Entity | EntityId | Before? | After? | Meta? | CreatedAt
```

Khuyến nghị bổ sung `IPAddress`, `UserAgent`, `CorrelationId`.

---

# 33. CÁC HÀNH ĐỘNG BẮT BUỘC AUDIT

Bao gồm: LOGIN_SUCCESS/FAILED, LOGOUT, SWITCH_TENANT, USER/MEMBERSHIP/ROLE thay đổi, ORGANIZATION thay đổi, EXPERT_VERIFY, NEED/SUPPLY/CHALLENGE publish, SOLUTION submit/review, MATCH generate/stage/convert, PROJECT/MILESTONE cập nhật, AGREEMENT create/sign và RESOURCE share/unshare.

---

# 34. KHÔNG HARD-DELETE

Không hard-delete User, Membership, Tenant, Organization, Project, Agreement khi đã có giao dịch hoặc lịch sử audit. Dùng `Status`, `DeletedAt`, `ArchivedAt` tùy loại entity.

---

# 35. TRIỂN KHAI DATABASE BAN ĐẦU

Có thể bắt đầu bằng **Shared Application + Shared Database + TenantId**, nhưng đây là lựa chọn triển khai, không phải giới hạn của kiến trúc đích.

---

# 36. KHẢ NĂNG NÂNG CẤP DATABASE

Service không phụ thuộc cứng vào Shared DB. Phải hỗ trợ nâng cấp từ Shared DB + TenantId sang Database per Tenant hoặc Dedicated Deployment mà không thay đổi Business API.

---

# 37. TENANT DATA ISOLATION MODE

Tenant có thể có:

```text
DataIsolationMode = SHARED_DATABASE
                  | DEDICATED_DATABASE
                  | DEDICATED_DEPLOYMENT
```

---

# 38. CACHE

Mọi cache phụ thuộc tenant phải chứa TenantId trong key.

```text
Đúng: tenant:{tenantId}:user:{userId}:permissions
Sai:  user:{userId}:permissions
```

Khi switch tenant phải vô hiệu hóa context/cache cũ phù hợp.

---

# 39. SEARCH

- **Tenant Search:** chỉ dữ liệu current tenant mà người dùng có quyền.
- **VI-CONNECT Network Search:** chỉ dữ liệu PUBLIC/SHARED được phép lập chỉ mục.

Không để search index hoặc kết quả gợi ý làm rò rỉ dữ liệu tenant.

---

# 40. PLATFORM ADMIN VÀ TENANT ADMIN

Platform Admin quản trị hạ tầng nền tảng, tenant, cấu hình chung, bảo mật và audit theo quyền được cấp; không mặc định được đọc toàn bộ dữ liệu nghiệp vụ private của tenant. Support access phải có yêu cầu, thời hạn, lý do và audit.

Tenant Admin chỉ quản lý Users, Units, Roles, Permissions, Workflow, Modules, Branding, Integrations, Dashboard, Data Sharing và Security Policy trong tenant của mình.

---

# 41. UI ADMINISTRATION

Menu đề xuất:

```text
Administration
├── Organization
├── Users & Memberships
├── Groups & Units
├── Roles & Permissions
├── Data Scope & Sharing
├── Workflows & Modules
├── Branding & Domain
├── Integrations & Security
└── Audit Logs
```

---

# 42. CẤU TRÚC DATABASE TỐI THIỂU

```text
Tenants | TenantSettings | TenantFeatures
Users | UserPreferences
Organizations | OrganizationUnits | Memberships
Roles | Permissions | RolePermissions | MembershipRoles | PermissionScopes
Projects | ProjectMemberships | ResourceAccessGrants
WorkflowDefinitions | WorkflowSteps | WorkflowTransitions | WorkflowInstances
Invitations | AuditLogs | Sessions | RefreshTokens | Notifications
```

---

# 43. QUY TẮC CODING BẮT BUỘC

1. Entity thuộc tenant phải có `TenantId` và tuân thủ contract tương đương `ITenantEntity`.
2. Mọi request tenant phải có `TenantContext` đã xác minh.
3. Không query tenant data khi chưa xác định tenant.
4. Không tin TenantId trực tiếp từ request body.
5. Authorization thực hiện tại backend.
6. Frontend chỉ điều khiển trải nghiệm, không thay thế bảo mật.
7. Không hard-code role name trong business logic.
8. Thao tác nhạy cảm phải có audit.
9. Cache tenant data phải có TenantId trong key.
10. Background job phải chạy trong TenantContext rõ ràng.

---

# 44. KIỂM THỬ BẮT BUỘC

Automated test tối thiểu phải chứng minh:

- User/Tenant Admin A không đọc hoặc sửa dữ liệu Tenant B;
- người thuộc A và B switch tenant đúng quyền;
- thay đổi role có hiệu lực;
- scope OWN/UNIT/ORGANIZATION/PROJECT/PARTY hoạt động đúng;
- project member ngoài tenant chỉ thấy resource được share;
- tenant claim không hợp lệ bị từ chối;
- IDOR cross-tenant bị chặn;
- cache, export, search và background job không rò hoặc xử lý nhầm tenant;
- AI Assistant và Matching Engine tuân thủ đúng nguồn dữ liệu được phép.

---

# 45. YÊU CẦU MỞ RỘNG

Kiến trúc phải hỗ trợ từ 10 đến 10.000 tenant mà không sửa lại mô hình User/Role/Tenant; hỗ trợ Shared DB → Dedicated DB → Dedicated Deployment mà không thay đổi API nghiệp vụ.

---

# 46. KIẾN TRÚC TỔNG THỂ CUỐI CÙNG

```text
Identity & SSO
      ↓
Tenant Resolver
      ↓
User Membership
      ↓
Authorization Engine (RBAC + ABAC + ReBAC)
      ↓
Data Scope + Visibility + Relationship/Grant
      ↓
Tenant Workspaces ↔ Shared Exchange ↔ Collaboration
      ↓
Personalized Workspace + Audit
```

---

# 47. KIẾN TRÚC CẦN CHỐT CHO VI-CONNECT

> **SaaS Multi-Tenant + Hybrid Data Isolation + Multi-Organization Membership + RBAC + ABAC + ReBAC + Organization Workspace + Personal Workspace + Project Context + Configurable Workflow + Feature Flags + Audit-by-Design.**

Không xây VI-CONNECT theo mô hình mỗi tổ chức là một bản phần mềm riêng. Không xây quyền theo mô hình đơn giản `User → Role`.

Mô hình chính thức:

```text
User → Membership → Tenant → Organization Unit → Role → Permission
     → Data Scope → Resource Relationship → Context
     → Personalized Workspace
```

Đây là kiến trúc nền tảng cho toàn bộ VI-CONNECT. Việc triển khai có thể chia giai đoạn, nhưng mọi giai đoạn phải tiến về cùng mô hình đích này.
