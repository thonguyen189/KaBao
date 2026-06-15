# Phân tích game "Đập muỗi cùng Ka Báo" - V1.1

Ngày cập nhật: 2026-06-15  
Commit triển khai: `57f6d52`  
URL: https://thonguyen189.github.io/KaBao/

## 1. Tổng quan

"Đập muỗi cùng Ka Báo" là game HTML5 mobile-first. Người chơi bấm Play, bước vào trận chơi ngắn, chạm vào muỗi đang bay để ghi điểm và nhận xu. Bản hiện hành mở rộng V1 ban đầu bằng một số cơ chế giữ chân người chơi: combo, bảng xếp hạng toàn cầu qua Firebase, nickname, bật/tắt âm thanh và xúc xắc thưởng xu sau trận.

## 2. Phạm vi hiện hành

- Main Menu với logo, tổng xu, nút Play, nút âm thanh, top 10 cá nhân và top 10 toàn cầu.
- Gameplay trên HTML5 Canvas.
- Trận chơi mặc định 30 giây.
- Muỗi sinh theo thời gian, tối đa 20 con đang sống.
- Độ khó tăng dần sau 30% thời lượng đầu trận, tối đa hệ số 1.8.
- Chạm trúng muỗi cộng 1 điểm và 1 xu.
- Hitbox muỗi rộng hơn bán kính gốc theo hệ số 1.075 để dễ chạm trên mobile.
- Combo khi người chơi đập liên tiếp trong cửa sổ 0.8 giây.
- Phản hồi khi bấm trượt: vòng hiệu ứng và rung nhẹ nếu trình duyệt hỗ trợ.
- Màn kết quả có điểm, số muỗi, xu trận, tổng xu, số trận đã chơi, combo cao nhất.
- Xúc xắc thưởng xu một lần sau trận: thưởng = xu trận x mặt xúc xắc.
- Lưu dữ liệu cục bộ bằng `localStorage`.
- Lưu nickname cục bộ, validate nickname trước khi gửi Firebase.
- Lưu hồ sơ/lượt chơi và tải top 10 toàn cầu qua Firebase Realtime Database.
- Deploy tự động bằng GitHub Actions lên GitHub Pages khi push vào `main`.

## 3. Cấu hình game

Nguồn cấu hình: `src/settings.js`

| Tham số | Giá trị |
| --- | --- |
| Thời lượng trận | 30 giây |
| Muỗi sinh mỗi giây | 2 |
| Muỗi tối đa | 20 |
| Bán kính muỗi | 30 |
| Hệ số hitbox | 1.075 |
| Cửa sổ combo | 0.8 giây |
| Combo bắt đầu hiển thị | x2 |
| Xúc xắc | mặt 1 đến 6 |
| Độ khó dễ ban đầu | 30% thời lượng trận |
| Hệ số độ khó tối đa | 1.8 |

## 4. Kiến trúc kỹ thuật

- `index.html`: cấu trúc màn hình menu, gameplay và result.
- `src/main.js`: vòng đời app, render Canvas, xử lý UI, âm thanh, nickname, xúc xắc, lưu cloud.
- `src/gameCore.js`: logic thuần cho state, spawn, hit, timer, combo, difficulty, dice.
- `src/settings.js`: cấu hình game tập trung.
- `src/storage.js`: lưu tổng xu, top runs, số trận, nickname, trạng thái mute.
- `src/firebaseScores.js`: validate nickname, anonymous auth, lưu profile/run/leaderboard, tải bảng xếp hạng.
- `database.rules.json`: Firebase Realtime Database Security Rules cho players và leaderboard.
- `firebase.json`: cấu hình Firebase CLI trỏ tới file rules.
- `src/assets.js`: tải hình ảnh và âm thanh từ manifest.
- `tests/gameCore.test.mjs`: unit tests cho core, storage và payload Firebase.
- `.github/workflows/deploy-pages.yml`: build static site vào `dist` và deploy Pages.

## 5. Dữ liệu lưu trữ

### LocalStorage

- `kabao.totalCoins`: tổng xu.
- `kabao.topRuns`: top 10 lượt chơi cá nhân.
- `kabao.playedMatches`: số trận đã chơi.
- `kabao.soundMuted`: trạng thái bật/tắt âm thanh.
- `kabao.nickname`: nickname đã lưu.

### Firebase

- `players/{uid}/profile`: hồ sơ người chơi.
- `players/{uid}/runs`: lịch sử lượt chơi.
- `leaderboard`: dữ liệu xếp hạng công khai.

Người chơi dùng Firebase anonymous auth. Leaderboard chỉ được lưu khi nickname hợp lệ.

## 6. Luồng chính

1. Người chơi mở game.
2. Menu tải tổng xu, top 10 cá nhân và top 10 toàn cầu.
3. Người chơi có thể bật/tắt âm thanh.
4. Bấm Play để bắt đầu trận 30 giây.
5. Muỗi sinh ra và bay trong Canvas.
6. Chạm trúng muỗi để ghi điểm, nhận xu và tăng combo.
7. Hết giờ chuyển sang Result.
8. Result lưu lượt chơi cục bộ, hiển thị thành tích và form nickname nếu chưa có.
9. Khi có nickname hợp lệ, kết quả được gửi lên Firebase.
10. Người chơi có thể tung xúc xắc một lần để nhận thêm xu.
11. Người chơi bấm Chơi lại hoặc Về màn hình chính.

## 7. Rủi ro và lưu ý

- Firebase config đang nằm trong client code, phù hợp với web app Firebase nhưng cần rules Realtime Database chặt chẽ.
- Trình duyệt có thể chặn âm thanh cho tới khi có tương tác người dùng.
- Nếu Firebase không truy cập được, game vẫn phải chơi được với dữ liệu cục bộ.
- `node` chưa có trong PATH trên máy kiểm tra hiện tại, nên lệnh unit test terminal chưa chạy được tại thời điểm deploy.
- UI dùng nhiều tiếng Việt có dấu, cần luôn lưu file bằng UTF-8.

## 8. Hướng mở rộng

- Theo dõi và tinh chỉnh Firebase Security Rules khi schema leaderboard thay đổi.
- Thêm chế độ bạn bè hoặc mã phòng riêng.
- Thêm shop/tủ đồ đổi xu.
- Thêm vật phẩm như dép, vợt muỗi, điện thoại, vở.
- Thêm nhiệm vụ hằng ngày.
- Thêm màn hướng dẫn ngắn cho người chơi nhỏ tuổi.
