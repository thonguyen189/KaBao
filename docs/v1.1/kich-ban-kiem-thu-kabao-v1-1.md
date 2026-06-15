# Kịch bản kiểm thử KaBao - V1.1

Ngày cập nhật: 2026-06-15  
URL live: https://thonguyen189.github.io/KaBao/

## 1. Mục tiêu

Xác nhận bản hiện hành chơi được từ menu đến result, dữ liệu cục bộ hoạt động, tính năng online không làm hỏng vòng chơi chính, và bản deploy GitHub Pages đang phục vụ code mới.

## 2. Smoke test

| ID | Mức | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- |
| SM-001 | Blocker | Mở URL live | Trang trả HTTP 200, không trắng màn hình. |
| SM-002 | Blocker | Quan sát Main Menu | Có logo, tên game, Play, tổng xu, top cá nhân, top toàn cầu, nút âm thanh. |
| SM-003 | Blocker | Bấm Play | Chuyển sang gameplay, timer bắt đầu ở 00:30. |
| SM-004 | Blocker | Chờ 2-3 giây | Muỗi xuất hiện và bay trong Canvas. |
| SM-005 | Blocker | Chạm trúng muỗi | Điểm +1, xu +1, có hiệu ứng hit/coin. |
| SM-006 | Blocker | Chơi hết 30 giây | Chuyển sang màn Result. |
| SM-007 | Critical | Bấm Chơi lại | Bắt đầu trận mới, điểm và xu trận reset. |
| SM-008 | Critical | Bấm Về màn hình chính | Quay lại menu, tổng xu đã cập nhật. |

## 3. Gameplay

| ID | Mức | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- |
| GP-001 | Critical | Timer | Hiển thị 00:30 và đếm ngược theo giây. |
| GP-002 | Critical | Spawn muỗi | Muỗi sinh đều, không vượt quá 20 con đang sống. |
| GP-003 | Critical | Hitbox | Tap trong vùng hình muỗi được tính trúng, phù hợp thao tác mobile. |
| GP-004 | Critical | Tap trượt | Không cộng điểm/xu, có phản hồi miss, không crash. |
| GP-005 | Critical | Một muỗi bị hit nhiều lần | Chỉ cộng điểm một lần. |
| GP-006 | Major | Combo | Hai hit trong 0.8 giây hiển thị combo từ x2. |
| GP-007 | Major | Độ khó | Cuối trận muỗi/spawn có cảm giác nhanh hơn đầu trận, không vượt mức gây rối. |
| GP-008 | Major | Âm thanh | Start, hit, coin, game over phát sau tương tác nếu không mute. |
| GP-009 | Major | Mute | Nút âm thanh đổi trạng thái và tắt/bật âm thanh đúng. |

## 4. Result và thưởng xu

| ID | Mức | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- |
| RS-001 | Critical | Result sau hết giờ | Hiển thị điểm, số muỗi, xu trận, tổng xu. |
| RS-002 | Critical | Số trận | `Số trận đã chơi` tăng sau mỗi trận. |
| RS-003 | Major | Combo cao nhất | Result hiển thị combo cao nhất của trận. |
| RS-004 | Critical | Xúc xắc | Chỉ tung được một lần sau trận. |
| RS-005 | Critical | Công thức thưởng | Bonus = xu trận x mặt xúc xắc. |
| RS-006 | Critical | Tổng xu sau xúc xắc | Tổng xu tăng đúng bonus và không tạo top run mới. |

## 5. Nickname và leaderboard toàn cầu

| ID | Mức | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- |
| LB-001 | Major | Menu tải leaderboard | Top 10 toàn cầu hiển thị hoặc fallback "Chưa tải được bảng xếp hạng". |
| LB-002 | Critical | Nickname hợp lệ | Nhập tên 2-16 ký tự, chữ/số/khoảng trắng/gạch dưới/gạch ngang, lưu được. |
| LB-003 | Critical | Nickname rỗng/dài/ký tự lạ | Bị từ chối, hiển thị lỗi. |
| LB-004 | Critical | Nickname nhạy cảm | Bị từ chối sau khi normalize dấu tiếng Việt. |
| LB-005 | Major | Lưu cloud sau result | Khi có nickname hợp lệ, lượt chơi được gửi Firebase và leaderboard có thể refresh. |
| LB-006 | Major | Firebase lỗi/mất mạng | Game vẫn chơi được, dữ liệu cục bộ vẫn lưu. |
| LB-007 | Critical | Firebase Rules | Leaderboard public read, chỉ auth user được tạo bản ghi có `uid === auth.uid`, không cho sửa/xóa bản ghi cũ. |

## 6. LocalStorage

| ID | Mức | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- |
| ST-001 | Critical | Reload sau khi có xu | Tổng xu vẫn còn. |
| ST-002 | Critical | Reload sau top run | Top 10 cá nhân vẫn còn. |
| ST-003 | Critical | Tạo hơn 10 lượt chơi | Chỉ giữ 10 điểm cao nhất. |
| ST-004 | Major | Dữ liệu hỏng | Game fallback an toàn, không trắng màn hình. |
| ST-005 | Major | Mute persisted | Reload giữ trạng thái bật/tắt âm thanh. |
| ST-006 | Major | Nickname persisted | Reload giữ nickname đã lưu. |

## 7. Responsive

Chạy trên các viewport:

- 360 x 640
- 375 x 667
- 390 x 844
- 414 x 896
- 430 x 932

Kỳ vọng:

- Không overflow ngang.
- Nút đủ lớn để chạm.
- HUD không che vùng chơi quá mức.
- Result có thể scroll nếu nội dung cao.
- Nút xúc xắc, form nickname và result stats không chồng nhau.

## 8. Asset và deploy

| ID | Mức | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- |
| DP-001 | Blocker | Truy cập URL GitHub Pages | HTTP 200. |
| DP-002 | Critical | Kiểm tra HTML live | Có `globalTopRuns`, `menuSoundButton`. |
| DP-003 | Critical | Kiểm tra `src/main.js` live | Có import `firebaseScores`, chuỗi `Kỷ lục mới`, emoji xúc xắc. |
| DP-004 | Critical | GitHub Actions | Workflow `Deploy GitHub Pages` kết luận `success`. |
| AS-001 | Critical | Hình ảnh | SVG trong `assets/images` tải 200. |
| AS-002 | Major | Âm thanh | WAV trong `assets/sounds` tải 200. |

## 9. Unit test

Lệnh dự kiến:

```bash
node tests/gameCore.test.mjs
```

Trạng thái hiện tại: chưa chạy được trên máy này vì `node` không có trong PATH. Khi cài/khôi phục Node.js, cần chạy lại lệnh trên trước mỗi lần deploy.
