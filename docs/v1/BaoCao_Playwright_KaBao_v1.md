# Báo cáo kiểm thử Playwright - KaBao V1

Ngày kiểm thử: 2026-06-14  
URL: `http://127.0.0.1:4173/`  
Trình duyệt: Chrome headless qua Playwright  
Kết quả: 19/19 checks pass

## Nhóm kiểm thử

| ID | Nội dung | Kết quả |
| --- | --- | --- |
| PW-SM-001 | Mở game vào Main Menu | Pass |
| PW-MM-001 | Chữ tiếng Việt hiển thị đúng | Pass |
| PW-MM-002 | Nút Play đủ lớn và bấm được | Pass |
| PW-MM-003 | Không có tính năng ngoài V1 trong menu | Pass |
| PW-GP-001 | Bấm Play vào gameplay, timer bắt đầu | Pass |
| PW-GP-002 | Canvas buffer khớp kích thước hiển thị | Pass |
| PW-GP-003 | Tap trúng muỗi tăng điểm và xu | Pass |
| PW-GP-004 | Không có console/page error khi gameplay | Pass |
| PW-RS-001 | Hết trận chuyển Result | Pass |
| PW-ST-001 | Result lưu top run vào localStorage | Pass |
| PW-RS-002 | Chơi lại vào gameplay mới | Pass |
| PW-RS-003 | Về màn hình chính hoạt động | Pass |
| PW-RS-004 | Không có console/page error ở Result flow | Pass |
| PW-RP-360x640 | Responsive mobile 360 x 640 | Pass |
| PW-RP-375x667 | Responsive mobile 375 x 667 | Pass |
| PW-RP-390x844 | Responsive mobile 390 x 844 | Pass |
| PW-RP-414x896 | Responsive mobile 414 x 896 | Pass |
| PW-RP-430x932 | Responsive mobile 430 x 932 | Pass |
| PW-AS-001 | Tất cả asset hình/âm thanh trả HTTP 200 | Pass |

## Ghi chú chính

- Viewport chính 390 x 844:
  - Main Menu active đúng.
  - Tiêu đề: `Đập muỗi cùng Ka Báo`.
  - Timer sau khi bấm Play: `01:59`.
  - Canvas hiển thị: 370 x 737.
  - Canvas buffer: 370 x 737.
  - Tap trúng muỗi làm `score = 1`, `coins = 1`.
- Responsive:
  - Không overflow ngang ở 360 x 640, 375 x 667, 390 x 844, 414 x 896, 430 x 932.
  - Canvas buffer khớp client size ở tất cả viewport trên.
- Asset:
  - `asset-manifest.json`, toàn bộ SVG và WAV đều trả HTTP 200.
- Console:
  - Không có `pageerror`.
  - Không có console error trong smoke gameplay và result flow.

## Giới hạn

- Result flow được kiểm thử bằng Playwright context tăng tốc `requestAnimationFrame` để không phải chờ đủ 120 giây thật. Logic chuyển màn vẫn đi qua game loop thật.
- Âm thanh được xác nhận qua asset HTTP và không lỗi console; chưa xác nhận cảm nhận âm thanh bằng tai người.
