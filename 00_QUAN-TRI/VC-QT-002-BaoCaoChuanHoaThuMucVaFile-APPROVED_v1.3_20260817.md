# BÁO CÁO CHUẨN HOÁ THƯ MỤC VÀ FILE VI CONNECT

**Mã tài liệu:** VC-QT-002  
**Phiên bản:** v1.3  
**Ngày thực hiện:** 2026-08-17  
**Trạng thái:** Hoàn thành

## 1. Phạm vi thực hiện

Chuẩn hoá và hợp nhất tài liệu vào kho Git `vi-connect/` theo quy định tại `VC-QT-001`. Cấu trúc kỹ thuật của ứng dụng được giữ nguyên để không làm hỏng đường dẫn import, quy trình build, cấu hình triển khai và lịch sử Git.

Không xoá tài liệu nghiệp vụ. File khoá Word hết giá trị và hai file `.DS_Store` từng bị cấp mã tạm đã được xoá theo phê duyệt ngày 2026-08-17. Vùng làm việc bên ngoài repo không phải nguồn dữ liệu chính thức.

## 2. Kết quả tổ chức

| Nhóm | Nơi lưu chuẩn |
|---|---|
| Quy định và báo cáo quản trị | `00_QUAN-TRI/` |
| Thuyết minh đề án hiện hành | `01_CHIEN-LUOC-DE-AN/02_DANG-SOAN-THAO/` |
| Phiên bản thuyết minh cũ | `01_CHIEN-LUOC-DE-AN/90_LUU-TRU-PHIEN-BAN-CU/` |
| Kiến trúc 11 cấu phần | `02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN/` |
| Sơ đồ hạ tầng CNTT | `03_KIEN-TRUC-KY-THUAT/01_SO-DO-HA-TANG/` |
| Hình VUSTA dùng làm tham khảo | `04_SAN-PHAM-THUONG-HIEU/05_INFOGRAPHIC/THAM-KHAO-VUSTA/` |
| Hồ sơ đăng ký nhãn hiệu | `06_PHAP-LY-TUAN-THU/04_SO-HUU-TRI-TUE/01_HO-SO-DANG-KY/` |
| Biểu mẫu sở hữu trí tuệ tham khảo | `06_PHAP-LY-TUAN-THU/04_SO-HUU-TRI-TUE/02_BIEU-MAU-THAM-KHAO/` |
| Tiêu chuẩn và quy định tham khảo | `08_NGHIEN-CUU-THAM-KHAO/03_TIEU-CHUAN-QUY-DINH/` |
| File làm việc có thể tái tạo | `99_TAM/` — không commit nội dung tạm |
| Mã nguồn ứng dụng | Các thư mục kỹ thuật tại gốc repo |

## 3. Ánh xạ tài liệu đề án

Tất cả phiên bản thuyết minh sử dụng chung mã tài liệu `VC-DA-001`.

| Tên cũ | Tên mới |
|---|---|
| `VI_CONNECT_TM_V6.docx` | `VC-DA-001-ThuyetMinhDeAn-DRAFT_v0.6_20260817.docx` |
| `Linh tinh/VI_CONNECT_TM_V0.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.0_20260813.docx` |
| `Linh tinh/VI_CONNECT_TM_V1.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.1_20260815.docx` |
| `Linh tinh/VI_CONNECT_TM_V3_backup_truoc_cap_nhat_20260816.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.3.0_20260816.docx` |
| `Linh tinh/VI_CONNECT_TM_V3_backup_truoc_execute_kpi_20260816_150629.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.3.1_20260816.docx` |
| `Linh tinh/VI_CONNECT_TM_V3.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.3.2_20260816.docx` |
| `Linh tinh/VI_CONNECT_TM_V4.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.4_20260816.docx` |
| `Linh tinh/VI_CONNECT_TM_V5.docx` | `VC-DA-001-ThuyetMinhDeAn-SUPERSEDED_v0.5_20260816.docx` |

## 4. Ánh xạ tài liệu khác

| Nguồn cũ | Nơi lưu mới hoặc xử lý |
|---|---|
| `01_Architecture/` | Đổi thành `02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN/`; 13 file Markdown được cấp mã `VC-NV-*` và cập nhật liên kết nội bộ. |
| `Infographic/So do ha tang CNTT.png` | Chuyển vào kiến trúc kỹ thuật và đổi thành `VC-KT-001-SoDoHaTangCntt-DRAFT_v0.1_20260817.png`. |
| Hai hình `VUSTA_CONNECT_*` | Cấp mã `VC-TK-001` và `VC-TK-002`; lưu riêng tại `THAM-KHAO-VUSTA/`, không coi là sản phẩm VI CONNECT hiện hành. |
| `output/docx/TO_KHAI_DANG_KY_NHAN_HIEU_VI_CONNECT.docx` | Đổi thành `VC-PL-001-ToKhaiDangKyNhanHieu-REVIEW_v0.9_20260816.docx`. |
| `tmp/pdfs/PL1.4_To_khai_nhan_hieu.docx` | Đổi thành `VC-PL-002-BieuMauToKhaiNhanHieu-REFERENCE_v1.0_20260816.docx`. |
| `tmp/pdfs/NICE_2026_final.pdf` | Đổi thành `VC-TK-003-Nice2026-REFERENCE_v1.0_20260816.pdf`. |
| `revise_vi_connect_v4.py` | Chuyển thành file làm việc `99_TAM/VC-TMP-001-ChinhSuaThuyetMinhV4_20260816.py`. |
| `tmp/` | Chuyển thành `99_TAM/WORKING/`. |
| `output/` còn lại | Chuyển thành `99_TAM/OUTPUT-CU/`. |
| `Linh tinh/`, `Infographic/` | Đã rỗng sau phân loại và đã loại khỏi cấu trúc. |

## 5. Kiểm soát một dữ liệu – một nơi lưu

- Bản thuyết minh đang làm việc chỉ nằm tại `01_CHIEN-LUOC-DE-AN/02_DANG-SOAN-THAO/`.
- Các bản trước là lịch sử phiên bản của cùng mã `VC-DA-001`, không phải các nguồn chuẩn song song.
- Tài liệu kiến trúc chỉ nằm tại `02_KIEN-TRUC-NGHIEP-VU/11-CAU-PHAN/`.
- Hồ sơ nhãn hiệu chính chỉ nằm tại `06_PHAP-LY-TUAN-THU/04_SO-HUU-TRI-TUE/01_HO-SO-DANG-KY/`.
- File render, nội dung trích xuất và script dùng một lần chỉ nằm tại vùng làm việc tạm, không thuộc dữ liệu chuẩn của repo.
- Các file trong `brand/` là tài nguyên của ứng dụng và không được sao chép sang kho tài liệu khác. Khi cần sử dụng, phải tham chiếu đến nơi lưu này.

## 6. Lưu ý vận hành

1. Không chỉnh sửa các bản `SUPERSEDED`; mọi cập nhật tiếp theo phải tạo từ bản `DRAFT_v0.6` và tăng phiên bản.
2. Không đưa file từ `99_TAM/` trở lại thư mục chính nếu chưa xác định mã tài liệu và nơi lưu chuẩn.
3. Không đổi tên hoặc di chuyển thư mục kỹ thuật của ứng dụng nếu chưa cập nhật và kiểm thử mã nguồn.
4. File `.DS_Store` là metadata do macOS/Dropbox tự sinh, không phải dữ liệu VI CONNECT và có thể xuất hiện lại sau khi mở thư mục.

## 7. Hiệu chỉnh v1.1

- Hợp nhất tài liệu và mã nguồn vào một repo Git duy nhất.
- Bổ sung README điều hướng, danh mục trung tâm, `CHANGELOG.md` và manifest repo.
- Chuyển sơ đồ hạ tầng từ nhóm thương hiệu sang kiến trúc kỹ thuật, đổi mã `VC-TH-001` thành `VC-KT-001`.
- Đưa `VC-NV-000` trở lại vai trò `README.md` không phiên bản hoá.
- Bổ sung trạng thái `REFERENCE`, quy tắc dành số và ngoại lệ tên file GitHub.
- Xoá file khoá Word hết giá trị và hai file `.DS_Store` đã bị cấp mã tạm.

## 8. Hiệu chỉnh v1.2 — thử chuyển toàn bộ tên file và thư mục sang chữ thường (đã bị thay thế bởi Mục 9)

Bản v1.2 đã đổi toàn bộ tên thư mục cấp 1 (`00`–`09`, `90`, `99`), thư mục con và mọi file mang mã `VC-` sang chữ thường-gạch ngang toàn bộ (ví dụ `vc-da-001-thuyet-minh-de-an-draft_v0.6_20260817.docx`). Cách làm này **không đúng ý định ban đầu** — xem lý do và cách sửa tại Mục 9. Bảng dưới đây giữ lại để ghi nhận lịch sử, không phải trạng thái hiện hành.

Đã dọn một thư mục rỗng còn sót lại ở bước này: `04_SAN-PHAM-THUONG-HIEU/05_INFOGRAPHIC/VI-CONNECT/` (không có nội dung, phát sinh từ lần chuyển `VC-KT-001` sang nhóm kiến trúc kỹ thuật).

## 9. Hiệu chỉnh v1.3 — chốt lại quy ước: giữ `VC-`/mã nhóm/trạng thái/thư mục viết hoa, chỉ tên ngắn gọn viết PascalCase

Sau khi rà soát, chủ repo xác nhận Mục 8 đã đổi quá tay: `VC-`, mã nhóm (`QT`, `DA`, `NV`...), trạng thái (`DRAFT`, `APPROVED`...) và toàn bộ tên thư mục phải **giữ nguyên viết hoa-gạch ngang như trước**, chỉ đoạn tên ngắn gọn `[TenNganPascalCase]` chuyển sang PascalCase viết liền — theo quy tắc đã sửa tại `VC-QT-001` Mục 3. Bản v1.3 khôi phục thư mục về chữ hoa và đặt lại tên 25 file mang mã `VC-` (24 file đã duyệt trước đó, cộng `VC-KT-002` mới thêm trong lúc rà soát).

| Nhóm | Trạng thái v1.2 (đã thay thế) | Trạng thái v1.3 (hiện hành) |
|---|---|---|
| Thư mục cấp 1 | `00_quan-tri` ... `99_tam` (chữ thường) | `00_QUAN-TRI` ... `99_TAM` (chữ hoa, khôi phục nguyên trạng) |
| Thư mục con theo giai đoạn | `01_nguon-goc`, `02_dang-soan-thao`, `03_cho-tham-dinh`, `04_da-phe-duyet`, `90_luu-tru-phien-ban-cu` | `01_NGUON-GOC`, `02_DANG-SOAN-THAO`, `03_CHO-THAM-DINH`, `04_DA-PHE-DUYET`, `90_LUU-TRU-PHIEN-BAN-CU` |
| Thư mục kiến trúc và pháp lý | `11-cau-phan`, `01_so-do-ha-tang`, `05_infographic`, `tham-khao-vusta`, `04_so-huu-tri-tue`, `01_ho-so-dang-ky`, `02_bieu-mau-tham-khao`, `03_tieu-chuan-quy-dinh` | `11-CAU-PHAN`, `01_SO-DO-HA-TANG`, `05_INFOGRAPHIC`, `THAM-KHAO-VUSTA`, `04_SO-HUU-TRI-TUE`, `01_HO-SO-DANG-KY`, `02_BIEU-MAU-THAM-KHAO`, `03_TIEU-CHUAN-QUY-DINH` |
| Toàn bộ file `VC-...` | Ví dụ `vc-da-001-thuyet-minh-de-an-draft_v0.6_20260817.docx` | `VC-DA-001-ThuyetMinhDeAn-DRAFT_v0.6_20260817.docx` |
| File làm việc trong `99_TAM/` | `vc-tmp-001-...py` | `VC-TMP-001-ChinhSuaThuyetMinhV4_20260816.py` (không thuộc phạm vi quản trị, đổi cho nhất quán) |
| Tài liệu mới trong lúc rà soát | — | `VC-KT-002` (thiết kế phân quyền), lưu tại `03_KIEN-TRUC-KY-THUAT/02_BAO-MAT-PHAN-QUYEN/VC-KT-002-ThietKePhanQuyen-DRAFT_v0.1_20260817.md` |

Ngoại lệ không đổi ở cả hai lần: `README.md`, `CHANGELOG.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `AGENTS.md`, `CLAUDE.md` và các file cấu hình repo — giữ nguyên cách viết hoa/thường theo thông lệ GitHub như quy định tại `VC-QT-001` Mục 4.2.
