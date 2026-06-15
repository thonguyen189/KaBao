# Báo cáo kiểm thử game "Đập muỗi cùng Ka Báo" - V1

Ngày kiểm thử: 2026-06-14  
Kịch bản: `KichBan_KiemThu_KaBao_v1.md`  
URL test cục bộ: `http://127.0.0.1:4173/`

## 1. Môi trường

- Static server: Python `http.server`.
- Browser test: Chrome headless qua Playwright.
- Viewport chính: 390 x 844, mobile/touch.
- Viewport responsive: 360 x 640, 375 x 667, 390 x 844, 414 x 896, 430 x 932.

## 2. Kết quả tổng quan

- Smoke test: Pass sau khi fix bug canvas resize.
- Main Menu: Pass.
- Gameplay cơ bản: Pass sau khi fix bug canvas resize.
- Result flow: Pass bằng context test rút ngắn thời gian.
- Storage/core logic: Pass.
- Responsive mobile dọc: Pass.
- Asset HTTP: Pass.
- Unit test bằng lệnh `node tests/gameCore.test.mjs`: Chưa chạy được vì shell hiện không có lệnh `node`.

## 3. Bug đã phát hiện và đã fix

### BUG-001 - Canvas bị resize sai khi bắt đầu game

- Testcase liên quan: `TC-GP-001`, `TC-GP-008`, `TC-RP-002`, `TC-RP-004`.
- Viewport: 390 x 844.
- Kết quả thực tế trước fix:
  - Canvas hiển thị client: 370 x 737.
  - Canvas drawing buffer: 320 x 420.
  - Hình ảnh gameplay bị kéo giãn/giảm nét và responsive không đúng.
- Nguyên nhân gốc:
  - `startGame()` gọi `resizeCanvas()` khi màn gameplay còn đang ẩn, nên `getBoundingClientRect()` trả kích thước không đúng và rơi về min size.
- Fix:
  - Trong `src/main.js`, đổi thứ tự sang `showScreen(elements.gameplayScreen)` trước, rồi mới gọi `resizeCanvas()`.
- Retest:
  - Canvas client: 370 x 737.
  - Canvas drawing buffer: 370 x 737.
  - Tap trúng muỗi tăng điểm và xu đúng.

## 4. Test đã chạy

### Smoke và Main Menu

- `TC-SM-001`: Pass. Game mở được, không trắng màn hình.
- `TC-SM-002`: Pass. Main Menu có logo, tên game, slogan, Play, tổng xu.
- `TC-SM-003`: Pass. Bấm Play vào gameplay.
- `TC-MM-001`: Pass. Browser hiển thị chữ tiếng Việt đúng.
- `TC-MM-003`: Pass. Nút Play đủ lớn trên mobile.
- `TC-MM-005`: Pass. Không có Shop, Tủ đồ, Login, Pause, mute toggle, xúc xắc.

### Gameplay

- `TC-GP-001`: Pass. Timer bắt đầu từ 02:00 và giảm.
- `TC-GP-004`: Pass. Core logic giới hạn 20 muỗi.
- `TC-GP-008`: Pass. Tap trúng muỗi làm score +1, xu +1.
- `TC-GP-009`: Pass gián tiếp qua core logic. Tap trượt không cộng điểm/xu.
- `TC-GP-010`: Pass. Một muỗi đã hit không được tính điểm lần hai.
- `TC-GP-016`: Pass. Điểm và xu trận tăng bằng nhau.
- `TC-GP-017`: Pass. Core timer về 0 chuyển phase result.

### Result và Storage

- `TC-RS-001`: Pass. Hết giờ chuyển Result.
- `TC-RS-002` đến `TC-RS-005`: Pass. Result hiển thị điểm, số muỗi, xu, tổng xu.
- `TC-RS-007`: Pass. Nút Chơi lại vào trận mới.
- `TC-RS-008`: Pass. Nút Về màn hình chính hoạt động.
- `TC-ST-001`: Pass. Save match cộng tổng xu.
- `TC-ST-003`: Pass. Top 10 chỉ giữ 10 bản ghi.
- `TC-ST-004`: Pass. Top 10 sắp xếp giảm dần.
- `TC-ST-005`: Pass. Dữ liệu topRuns hỏng fallback an toàn.
- `TC-ST-006`: Pass. Tổng xu hỏng/âm/NaN fallback an toàn.

### Responsive

- `TC-RP-001` đến `TC-RP-006`: Pass.
- Các viewport dọc không overflow ngang.
- Canvas client và drawing buffer khớp nhau sau fix.
- Play button giữ kích thước 58px cao, dễ chạm.

### Asset

- `TC-AS-001`: Pass. Tất cả SVG trả HTTP 200.
- `TC-AS-002`: Pass về mặt tải file. Tất cả WAV trả HTTP 200.
- `TC-AS-003`: Pass. `asset-manifest.json` trả HTTP 200.

## 5. Giới hạn kiểm thử

- Chưa xác nhận âm thanh bằng tai người; mới xác nhận file âm thanh tải được và không có lỗi console khi tương tác.
- Không chờ 120 giây thật trong UI; màn Result được test bằng context rút ngắn thời gian, còn logic timer 120 giây đã kiểm tra qua core function.
- Lệnh shell `node` không có trong PATH, nên không chạy được `tests/gameCore.test.mjs` bằng terminal. Các test core tương đương đã chạy qua môi trường JS của Codex.

## 6. Kết luận

Bản V1 hiện pass các nhóm kiểm thử chính sau khi fix `BUG-001`. Không còn bug blocker/critical được phát hiện trong phạm vi test đã chạy.
