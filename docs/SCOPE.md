# Vì sao phạm vi coding không phải "toàn bộ 11 cấu phần"

Yêu cầu ban đầu là build "toàn bộ nền tảng production". Thuyết minh đề án
(`VI_CONNECT_TM_Dean.docx`) mô tả 11 cấu phần cho một nền tảng 5 năm, kinh phí riêng
năm đầu triển khai đã là 5 tỷ đồng, phục vụ 152 hội thành viên và 624 tổ chức KH&CN. Build cả
11 cấu phần (kể cả Funding Hub với due diligence/giải ngân thật, AI Governance, Risk &
Compliance ISO đầy đủ, tích hợp thật với ORCID/OpenAlex/Techmart) trong một lần code là
không thực tế và mâu thuẫn với chính nguyên tắc đề án đặt ra ở Phần V:

> "Nguyên tắc chuyển giai đoạn: không mở rộng chỉ vì hoàn thành phần mềm."

Vì vậy phạm vi coding được tự động thu hẹp về đúng **phạm vi ưu tiên (Năm 1)** như đề án
tự quy định — xây dựng thật (không mock), nhưng theo đúng 5 miền năng lực (A-E) mà đề
án đề xuất chốt, và để lại phần còn thiếu làm backlog rõ ràng (xem README.md) thay vì
giả vờ đã xây xong. 11 cấu phần nghiệp vụ không chia theo giai đoạn dự án — mỗi cấu
phần chỉ khác nhau ở mức độ đã triển khai (đã code thật / backlog), không gắn với một
mốc thời gian "Giai đoạn N" cố định.

Nguyên tắc áp dụng khi có mâu thuẫn tương tự trong tương lai: ưu tiên giới hạn mà chính
tài liệu nguồn (đề án) đặt ra, thay vì quy mô lớn nhất mà yêu cầu ban đầu ngụ ý.
