# 06 — Pháp lý và tuân thủ

Thư mục này lưu hồ sơ pháp lý về sở hữu trí tuệ và quyền tác giả của VI CONNECT. Mỗi tài liệu chỉ có một nơi lưu chuẩn; các bản ở vị trí khác chỉ được phép là liên kết hoặc bản phát hành có kiểm soát.

## Cấu trúc bắt buộc

```text
06_PHAP-LY-TUAN-THU/
├── README.md
├── SO_HUU_TRI_TUE/
│   ├── 01_HO_SO_DANG_KY/
│   └── 02_BIEU_MAU_THAM_KHAO/
└── BQ_TAC_GIA/
    └── 01_HO_SO_DANG_KY/
```

### `SO_HUU_TRI_TUE/`

Lưu hồ sơ về nhãn hiệu và các đối tượng sở hữu công nghiệp khác:

- `01_HO_SO_DANG_KY/`: tờ khai, tài liệu giải trình và bộ hồ sơ đăng ký chính thức.
- `02_BIEU_MAU_THAM_KHAO/`: biểu mẫu, hướng dẫn và tài liệu nguồn dùng để lập hồ sơ; tài liệu tham khảo phải mang trạng thái `REFERENCE`.

### `BQ_TAC_GIA/`

Lưu hồ sơ đăng ký quyền tác giả đối với chương trình máy tính, tài liệu thiết kế và các tác phẩm thuộc VI CONNECT:

- `01_HO_SO_DANG_KY/`: bộ hồ sơ đang soạn, bản PDF kiểm tra, phiên bản đã ký và phiên bản lịch sử.
- Hồ sơ quyền tác giả phải xác định rõ tác phẩm, tác giả, chủ sở hữu, căn cứ phát sinh quyền, phiên bản mã nguồn và tài liệu chuyển giao/nghiệm thu.

## Yêu cầu quản lý

1. Tên file tuân thủ `VC-QT-001`; tài liệu VI CONNECT dùng mã `VC-` và trạng thái hợp lệ như `DRAFT`, `REVIEW`, `APPROVED`, `REFERENCE` hoặc `SUPERSEDED`.
2. Mỗi mã tài liệu chỉ có một phiên bản hiện hành. Phiên bản cũ phải được ghi rõ `SUPERSEDED`; không dùng các hậu tố `final`, `new`, `copy` hoặc `final2`.
3. Khi tạo, đổi phiên bản hoặc di chuyển tài liệu, phải cập nhật `VC-QT-003` và mọi liên kết đang sử dụng trong cùng thay đổi.
4. Không lưu file tạm `~$*`, bản tự động sinh hoặc bản sao không kiểm soát trong hai thư mục nghiệp vụ.
5. Không đưa CCCD, chữ ký, tài khoản ngân hàng, dữ liệu cá nhân, `.env`, khóa API hoặc dữ liệu sản xuất lên kho Git công khai. Bản có dữ liệu định danh phải được lưu và chia sẻ theo chế độ hạn chế truy cập.
6. Các trường tô vàng trong hồ sơ là dữ liệu chờ xác nhận; không được ký, đóng dấu hoặc nộp khi chưa hoàn thiện và đối chiếu bằng chứng nguồn.
7. Bản Word là nguồn chỉnh sửa; bản PDF là bản kiểm tra/phát hành dẫn xuất. Khi nội dung Word thay đổi, phải xuất lại PDF và kiểm tra trực quan trước khi sử dụng.

## Tài liệu hiện có

| Nhóm | Mã | Tài liệu hiện hành | Trạng thái |
|---|---|---|---|
| Sở hữu trí tuệ | `VC-PL-001` | Tờ khai đăng ký nhãn hiệu VI CONNECT | `REVIEW v0.9` |
| Sở hữu trí tuệ | `VC-PL-002` | Biểu mẫu tờ khai nhãn hiệu | `REFERENCE v1.0` |
| Quyền tác giả | `VC-PL-003` | Bộ hồ sơ đăng ký quyền tác giả VI-CONNECT v1.0 | `DRAFT v0.2` |

Bản `VC-PL-003 v0.1` được giữ để truy vết và mang trạng thái `SUPERSEDED`; không dùng để ký hoặc nộp.
