# Báo cáo nâng cấp KaBao V1.1 - UI, vật phẩm và phòng bạn bè

Ngày cập nhật: 2026-06-15

## 1. Phạm vi nâng cấp

Bản nâng cấp V1.1 mở rộng game từ vòng chơi cơ bản thành một hub có nhiều hoạt động giữ chân người chơi:

- Menu chính dạng hub với Play, Bạn bè, Shop, Tủ đồ, Nhiệm vụ và Hướng dẫn.
- Shop/tủ đồ đổi xu với 4 vật phẩm cosmetic.
- Hiệu ứng vật phẩm trong gameplay, không ảnh hưởng điểm, xu, hitbox hoặc leaderboard.
- Hướng dẫn 3 bước cho người chơi nhỏ tuổi.
- Nhiệm vụ hằng ngày dùng Firebase/server time.
- Mã phòng bạn bè theo trận, lưu leaderboard phòng trên Firebase.

## 2. Vật phẩm

| ID | Tên hiển thị | Giá | Vai trò |
| --- | --- | --- | --- |
| `slipper` | Dép thần tốc | 0 xu | Mặc định, luôn có trong tủ đồ. |
| `notebook` | Vở gió giấy | 40 xu | Cosmetic, hiệu ứng giấy/quạt. |
| `swatter` | Vợt muỗi điện | 80 xu | Cosmetic, hiệu ứng điện/impact rõ hơn. |
| `phone` | Điện thoại bộp | 120 xu | Cosmetic, hiệu ứng hài hước. |

Asset đã được đăng ký trong `assets/asset-manifest.json` từ các thư mục:

- `assets/lip/weapons/slipper/frames/`
- `assets/lip/weapons/notebook/frames/`
- `assets/lip/weapons/swatter/frames/`
- `assets/lip/weapons/phone/frames/`

## 3. Dữ liệu mới

LocalStorage:

- `kabao.inventory`: danh sách vật phẩm đã sở hữu.
- `kabao.equippedItem`: vật phẩm đang trang bị.
- `kabao.tutorialSeen`: trạng thái đã xem hướng dẫn.
- `kabao.lastRoomCode`: mã phòng gần nhất.

Firebase:

- `players/{uid}/dailyMissions/{date}`: tiến độ và trạng thái nhận thưởng nhiệm vụ.
- `rooms/{roomCode}/meta`: thông tin phòng.
- `rooms/{roomCode}/members/{uid}`: thành viên phòng.
- `rooms/{roomCode}/leaderboard/{uid}`: thành tích tốt nhất trong phòng.

## 4. Module mới

- `src/items.js`: catalog vật phẩm và mapping frame asset.
- `src/missions.js`: cấu hình và logic thuần cho nhiệm vụ hằng ngày.
- `src/storage.js`: mở rộng lưu inventory, equipped item, tutorial và room code.
- `src/firebaseScores.js`: mở rộng helper cho room, missions, server date và room leaderboard.

## 5. Kiểm thử cần chạy

Unit:

```bash
node tests/gameCore.test.mjs
```

Manual:

- Mở game lần đầu và kiểm tra tutorial.
- Mua từng vật phẩm trong shop, trang bị trong tủ đồ, reload vẫn giữ dữ liệu.
- Vào gameplay với từng vật phẩm và kiểm tra hiệu ứng hit khác nhau.
- Kiểm tra nhiệm vụ điểm danh, chơi 1 trận, đập 20 muỗi và tung xúc xắc.
- Tạo/nhập mã phòng, chơi một trận và xem leaderboard phòng.
- Kiểm tra responsive tại 360 x 640 và 390 x 844.

## 6. Lưu ý

- Daily missions cần Firebase để lấy server time; nếu mất mạng, game vẫn chơi được nhưng màn nhiệm vụ báo không tải được.
- Phòng bạn bè là phòng theo trận, không phải realtime multiplayer.
- Môi trường hiện tại chưa có `node` trong PATH nên unit test cần chạy lại khi Node khả dụng.
