# QUY ƯỚC ĐẶT TÊN VÀ LƯU TRỮ FILE VI CONNECT

**Mã tài liệu:** VC-QT-001  
**Phiên bản:** v1.3  
**Ngày ban hành:** 2026-08-19  
**Trạng thái:** Áp dụng  
**Nơi lưu chuẩn:** `00_QUAN-TRI/VC-QT-001-QuyUocDatTenVaLuuTruFile-APPROVED_v1.3_20260819.md`

## 1. Mục đích

Quy định thống nhất cách đặt tên, lưu trữ, cập nhật, thay thế và ngừng sử dụng file trong hệ thống VI CONNECT, bảo đảm dễ tìm kiếm, không trùng lặp dữ liệu và không làm ảnh hưởng đến cấu trúc nền tảng khi thêm mới, điều chỉnh hoặc loại bỏ tài liệu.

## 2. Nguyên tắc bắt buộc

1. Mỗi dữ liệu hoặc tài liệu chỉ có **một nơi lưu chuẩn duy nhất**.
2. Không sao chép cùng một file sang nhiều thư mục để phục vụ các mục đích khác nhau.
3. Các thư mục hoặc tài liệu khác phải tham chiếu đến file chuẩn bằng mã tài liệu, đường dẫn tương đối hoặc liên kết do hệ thống quản lý.
4. Không chỉnh sửa trực tiếp file đã được phê duyệt hoặc phát hành. Khi cần thay đổi, tạo phiên bản mới tại chính thư mục lưu chuẩn.
5. Không dùng tên thư mục như `Linh tinh`, `Khác`, `Mới`, `Final`, `Backup` hoặc tên không thể hiện nội dung quản lý.
6. Không lưu file tạm, file render, cache, dữ liệu tải xuống hoặc kết quả sinh tự động chung với tài liệu nguồn.
7. Việc di chuyển file chuẩn phải đồng thời cập nhật danh mục tài liệu và toàn bộ liên kết tham chiếu.

## 3. Cấu trúc tên file

Tên file sử dụng mẫu:

```text
VC-[NHOM]-[MA]-[TenNganPascalCase]-[TRANG-THAI]_v[MAJOR.MINOR]_[YYYYMMDD].[ext]
```

Trong đó:

| Thành phần | Quy định | Ví dụ |
|---|---|---|
| `VC-` | Tiền tố bắt buộc của VI CONNECT, viết hoa, giữ nguyên | `VC-` |
| `[NHOM]` | Mã nhóm tài liệu, viết hoa, giữ nguyên như Mục 4 | `QT`, `DA`, `KT`, `DL`, `PL`, `TH`, `BC` |
| `[MA]` | Số định danh duy nhất, gồm 3 chữ số | `001` |
| `[TenNganPascalCase]` | Tên ngắn gọn, không dấu, không khoảng trắng, viết liền theo kiểu PascalCase — chữ cái đầu mỗi từ viết hoa, không dùng gạch ngang/gạch dưới giữa các từ | `ThuyetMinhDeAn` |
| `[TRANG-THAI]` | Trạng thái quản lý, viết hoa, đứng riêng sau dấu gạch ngang | `DRAFT`, `REVIEW`, `APPROVED`, `REFERENCE`, `SUPERSEDED`, `WITHDRAWN` |
| `v[MAJOR.MINOR]` | Phiên bản tài liệu | `v1.0` |
| `[YYYYMMDD]` | Ngày tạo hoặc ban hành phiên bản | `20260817` |
| `[ext]` | Định dạng file | `docx`, `pdf`, `xlsx`, `md`, `svg` |

**Quy tắc chữ hoa/thường:** `VC-`, mã nhóm `[NHOM]` và trạng thái `[TRANG-THAI]` luôn viết hoa, giữ nguyên như bảng ở Mục 4 và 4.1 — không hạ chữ thường. Tên thư mục cũng viết hoa-gạch ngang như quy ước sẵn có (ví dụ `00_QUAN-TRI/`, `11-CAU-PHAN/`). Riêng đoạn tên ngắn gọn `[TenNganPascalCase]` viết liền theo PascalCase, không dấu gạch ngang giữa các từ, để vừa ngắn gọn vừa dễ đọc. Ngoại lệ duy nhất là nhóm file theo thông lệ GitHub tại Mục 4.2, giữ nguyên cách viết hoa/thường quen thuộc của cộng đồng (`README.md`, `LICENSE`...).

Ví dụ:

```text
VC-DA-001-ThuyetMinhDeAn-DRAFT_v0.6_20260817.docx
VC-DA-001-ThuyetMinhDeAn-APPROVED_v1.0_20260910.pdf
VC-KT-003-KienTrucDuLieu-APPROVED_v1.1_20261002.pdf
VC-TH-002-LogoPrimary-APPROVED_v3.1_20260817.svg
VC-PL-004-ToKhaiNhanHieu-REVIEW_v0.9_20260817.docx
```

## 4. Mã nhóm tài liệu

| Mã | Nhóm tài liệu |
|---|---|
| `QT` | Quản trị, quy định và quyết định |
| `DA` | Chiến lược, đề án và kế hoạch |
| `NV` | Kiến trúc và quy trình nghiệp vụ |
| `KT` | Kiến trúc và tài liệu kỹ thuật |
| `DL` | Dữ liệu, danh mục và schema |
| `PM` | Quản lý dự án và phát triển phần mềm |
| `PL` | Pháp lý, tuân thủ và sở hữu trí tuệ |
| `TH` | Thương hiệu, thiết kế và truyền thông |
| `BC` | Báo cáo, KPI và đánh giá tác động |
| `TK` | Tài liệu nghiên cứu, tiêu chuẩn và tham khảo |

Mã tài liệu như `VC-DA-001` được giữ nguyên trong toàn bộ vòng đời, kể cả khi tên, định dạng, trạng thái hoặc phiên bản của file thay đổi.

### 4.1. Trạng thái tài liệu

| Trạng thái | Ý nghĩa |
|---|---|
| `DRAFT` | Đang soạn thảo, chưa dùng làm căn cứ chính thức |
| `REVIEW` | Đang lấy ý kiến, thẩm định hoặc chờ phê duyệt |
| `APPROVED` | Đã được phê duyệt hoặc ban hành để áp dụng |
| `REFERENCE` | Nguồn bên ngoài hoặc tài liệu chỉ dùng để đối chiếu; không phải văn bản điều hành của VI CONNECT |
| `SUPERSEDED` | Đã được phiên bản khác thay thế nhưng phải giữ lịch sử |
| `WITHDRAWN` | Đã thu hồi hoặc ngừng sử dụng và không có bản thay thế trực tiếp |

### 4.2. Ngoại lệ tên file của repo

Các file điều hướng hoặc cấu hình theo thông lệ GitHub được miễn mã `VC-`, trạng thái và phiên bản: `README.md`, `CHANGELOG.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `package.json`, các file cấu hình công cụ và `repo-manifest.yaml`. Các file này được quản lý bằng lịch sử Git.

### 4.3. Quy tắc cấp và dành số

- `001–009`: tài liệu tổng thể, baseline hoặc quy định cấp nhóm.
- `010–099`: tài liệu hoặc cấu phần chi tiết; với kiến trúc nghiệp vụ (`NV`), `011–021` được dành cho cấu phần 01–11.
- `100–899`: tài liệu phát sinh theo nghiệp vụ hoặc dự án.
- `900–999`: chỉ dùng cho biểu mẫu đặc biệt hoặc mã tạm khi có phê duyệt của quản trị repo.
- Phải kiểm tra `VC-QT-003` trước khi cấp mã mới; không suy đoán rằng số trống là số chưa được sử dụng.

**Quy tắc riêng cho nhóm kiến trúc kỹ thuật (`KT`) — tương ứng số với `NV`:**
để tránh nhầm lẫn giữa kiến trúc nghiệp vụ (cái gì/vì sao) và kiến trúc kỹ thuật
(bằng cách nào) của cùng một cấu phần, nhóm `KT` áp dụng riêng dải số sau, không
theo quy tắc `010–099` chung ở trên:

- `001–010`: tài liệu kỹ thuật **dùng chung/xuyên suốt**, không gắn riêng một
  cấu phần nào (hạ tầng, phân quyền nền tảng, bảo mật kỹ thuật, giám sát...).
- `011–021`: tài liệu kỹ thuật **của riêng một cấu phần cụ thể**, đánh số
  **trùng đúng số cấu phần tương ứng bên `NV`** (VD: kiến trúc nghiệp vụ cấu
  phần 03 là `VC-NV-013` thì kiến trúc kỹ thuật cấu phần 03 là `VC-KT-013`,
  không phải số kế tiếp theo thứ tự tạo file).
- Không bắt buộc mọi cấu phần phải có tài liệu `KT` riêng ngay từ đầu — chỉ tạo
  khi cấu phần đó chuẩn bị được code hoá hoặc cần thiết kế trước một cách có
  chủ đích, đúng nguyên tắc từng-giai-đoạn của đề án (`docs/SCOPE.md`); không
  viết trước `KT` cho cả 11 cấu phần chỉ để cho đủ bộ.

## 5. Quy tắc phiên bản

- `v0.x`: bản đang soạn thảo hoặc lấy ý kiến.
- `v1.0`: bản được phê duyệt hoặc phát hành lần đầu.
- Tăng số sau dấu chấm, ví dụ `v1.1`, khi chỉnh sửa nhỏ nhưng không thay đổi mục tiêu hoặc cấu trúc chính.
- Tăng số trước dấu chấm, ví dụ `v2.0`, khi thay đổi lớn về phạm vi, mô hình, cấu trúc hoặc căn cứ áp dụng.
- Có thể dùng thêm số bản sửa, ví dụ `v0.3.1`, để phân biệt các bản trung gian có cùng phiên bản nội dung; không dùng cách này cho bản phê duyệt chính thức.
- Không dùng các hậu tố `final`, `final2`, `new`, `moi`, `backup`, `copy` hoặc tên người chỉnh sửa để thay cho số phiên bản.

## 6. Quy tắc một dữ liệu – một nơi lưu

### 6.1. File nguồn

File nguồn chỉ được lưu trong thư mục phụ trách loại tài liệu đó. Ví dụ:

- Quản trị, quy định và danh mục trung tâm: `00_QUAN-TRI/`
- Thuyết minh đề án: `01_CHIEN-LUOC-DE-AN/`
- Kiến trúc nghiệp vụ: `02_KIEN-TRUC-NGHIEP-VU/`
- Kiến trúc kỹ thuật: `03_KIEN-TRUC-KY-THUAT/`
- Bộ nhận diện: `04_SAN-PHAM-THUONG-HIEU/`
- Quản lý dự án: `05_QUAN-LY-DU-AN/`
- Hồ sơ pháp lý: `06_PHAP-LY-TUAN-THU/`
- Dữ liệu và danh mục chuẩn: `07_DU-LIEU-VA-DANH-MUC/`
- Nghiên cứu và tài liệu tham khảo: `08_NGHIEN-CUU-THAM-KHAO/`
- Hồ sơ phát hành: `09_PHAT-HANH/`
- Phiên bản lịch sử hết hiệu lực: `90_LUU-TRU/`; đây không phải nơi lưu phiên bản hiện hành.
- File tạm có thể tái tạo: `99_TAM/`; đây không phải nơi lưu dữ liệu chuẩn và nội dung bên trong không được commit.
- Mã nguồn ứng dụng: các thư mục kỹ thuật ở gốc repo như `app/`, `components/`, `lib/`, `prisma/`, `public/`, `tests/` và `deploy/`.

### 6.2. Tham chiếu file

Khi một file liên quan đến nhiều nhóm công việc:

- Chọn một thư mục làm nơi lưu chuẩn theo đơn vị chịu trách nhiệm chính.
- Tại nơi sử dụng khác, chỉ ghi mã tài liệu và đường dẫn tương đối đến file chuẩn.
- Không tạo thêm bản sao để “tiện sử dụng”.

Ví dụ tham chiếu:

```text
Tài liệu áp dụng: VC-KT-003 — đường dẫn tương đối tới file chuẩn được đăng ký trong danh mục tài liệu.
```

### 6.3. File xuất bản và file sinh tự động

- DOCX, SVG, mã nguồn hoặc file dữ liệu có thể chỉnh sửa là file nguồn.
- PDF, PNG, ảnh xem trước, file render và gói ZIP là sản phẩm dẫn xuất.
- Sản phẩm dẫn xuất phải có khả năng tạo lại từ file nguồn và không được coi là một nguồn dữ liệu độc lập.
- Nếu cần giữ sản phẩm phát hành, lưu nó cùng hồ sơ phát hành và ghi rõ file nguồn, phiên bản nguồn và mã kiểm tra toàn vẹn.
- Không sửa trực tiếp sản phẩm dẫn xuất; mọi thay đổi phải bắt đầu từ file nguồn.

## 7. Quy trình thêm mới file

1. Xác định nhóm tài liệu và nơi lưu chuẩn.
2. Kiểm tra tài liệu tương tự đã tồn tại hay chưa.
3. Cấp mã tài liệu duy nhất.
4. Đặt tên theo đúng cấu trúc tại Mục 3.
5. Ghi file vào danh mục tài liệu trung tâm.
6. Tạo liên kết tham chiếu nếu tài liệu được sử dụng tại nhóm khác.
7. Không tạo bản sao ngoài nơi lưu chuẩn.

## 8. Quy trình điều chỉnh file

1. Không đổi mã tài liệu.
2. Tăng số phiên bản phù hợp với mức độ thay đổi.
3. Giữ phiên bản trước tại cùng hồ sơ tài liệu và đổi trạng thái thành `SUPERSEDED` khi cần bảo toàn lịch sử.
4. Cập nhật danh mục tài liệu: phiên bản hiện hành, ngày hiệu lực và phiên bản bị thay thế.
5. Kiểm tra các liên kết tham chiếu trước khi công bố phiên bản mới.

Việc giữ phiên bản cũ để bảo toàn lịch sử không được xem là lưu trùng dữ liệu, vì đó là các phiên bản khác nhau của cùng một tài liệu và phải được quản lý dưới cùng một mã tài liệu.

## 9. Quy trình ngừng sử dụng hoặc xoá file

1. Không xoá ngay file đã được phê duyệt, phát hành, viện dẫn hoặc sử dụng làm căn cứ.
2. Chuyển trạng thái thành `SUPERSEDED` nếu đã có phiên bản thay thế.
3. Chuyển trạng thái thành `WITHDRAWN` nếu tài liệu bị thu hồi và không có bản thay thế.
4. Cập nhật tài liệu thay thế, lý do, người phê duyệt và ngày ngừng hiệu lực trong danh mục tài liệu.
5. Chỉ xoá vật lý khi hết thời hạn lưu trữ, không còn liên kết tham chiếu và đã có phê duyệt của người có thẩm quyền.
6. File tạm và file có thể tái tạo được phép xoá theo lịch dọn dẹp mà không ảnh hưởng đến file nguồn.

## 10. Các điều cấm

- Lưu cùng một dữ liệu nguồn tại nhiều thư mục.
- Gửi file qua lại rồi lưu mỗi bản nhận được thành một “bản chính”.
- Ghi đè lên phiên bản đã phê duyệt.
- Đặt tên file chỉ bằng nội dung chung như `Bao cao.docx`, `De an moi.docx` hoặc `Final.pdf`.
- Đặt đường dẫn tuyệt đối gắn với máy cá nhân trong mã nguồn hoặc tài liệu dùng chung.
- Lưu mật khẩu, khóa API, dữ liệu cá nhân hoặc dữ liệu sản xuất trong Git.
- Lưu `node_modules`, `.next`, cache, file tạm hoặc kết quả render vào kho tài liệu chính thức.

## 11. Trách nhiệm duy trì

- Người tạo file chịu trách nhiệm đặt tên, chọn đúng nơi lưu và đăng ký tài liệu.
- Người phụ trách nhóm tài liệu xác nhận nguồn chuẩn và trạng thái áp dụng.
- Quản trị VI CONNECT duy trì danh mục tài liệu, mã định danh và quy tắc lưu trữ.
- Mọi ngoại lệ phải được ghi nhận bằng văn bản trong `00_QUAN-TRI/`.
