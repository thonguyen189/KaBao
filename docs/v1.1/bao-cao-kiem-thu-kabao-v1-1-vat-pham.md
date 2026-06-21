# Báo cáo kiểm thử KaBao V1.1 - UI, vật phẩm và phòng bạn bè

Ngày kiểm thử: 2026-06-15  
Môi trường: local static server `http://127.0.0.1:4173/`, Chrome headless, Node REPL runtime  
Kịch bản gốc: `docs/v1.1/kich-ban-kiem-thu-kabao-v1-1.md`  
Phạm vi bổ sung: shop/tủ đồ, vật phẩm, nhiệm vụ hằng ngày, hướng dẫn, phòng bạn bè theo trận

## 1. Tóm tắt kết quả

| Nhóm | Kết quả | Ghi chú |
| --- | --- | --- |
| Unit test logic | Pass | 26/26 test pass qua Node REPL runtime. |
| Local HTTP smoke | Pass | Trang local, `src/main.js`, manifest và asset vật phẩm đều trả 200. |
| UI hub local | Pass | Tutorial, menu, 6 nút hub, shop, tủ đồ, gameplay đều mở được. |
| Shop/tủ đồ/localStorage | Pass | Mua vở + vợt, trừ xu, lưu inventory, trang bị vợt, mute persisted. |
| Result/xúc xắc | Pass | Hết 30 giây chuyển Result, số trận tăng, xúc xắc chỉ dùng 1 lần. |
| Responsive smoke | Pass một phần | 360x640, 390x844, 430x932 không overflow ngang; chưa có kiểm tra thị giác thủ công. |
| Firebase online | Fail/Blocked | Anonymous Auth trả `auth/configuration-not-found`, online missions/leaderboard/room fallback. |
| GitHub Pages live | Fail cho bản nâng cấp | Live 200 nhưng chưa có `shopScreen`/`renderShop`, tức code mới chưa deploy. |

## 2. Evidence chính

### Unit test

Chạy qua Node REPL vì `node` trong PowerShell không khả dụng.

Kết quả:

- `passed`: 26
- Bao gồm core gameplay, dice, storage, inventory, equipped item, tutorial, daily missions, room payload, Firebase rules.

Lệnh PowerShell `node tests/gameCore.test.mjs` vẫn bị chặn:

```text
node : The term 'node' is not recognized...
```

### Local HTTP

Các URL local trả `200`:

- `http://127.0.0.1:4173/`
- `http://127.0.0.1:4173/src/main.js`
- `http://127.0.0.1:4173/assets/asset-manifest.json`
- `http://127.0.0.1:4173/assets/lip/weapons/slipper/frames/impact.png`
- `http://127.0.0.1:4173/assets/lip/weapons/swatter/frames/impact.png`
- `http://127.0.0.1:4173/assets/lip/weapons/phone/frames/impact.png`
- `http://127.0.0.1:4173/assets/lip/weapons/notebook/frames/impact.png`

Manifest check:

```text
PASS all manifest assets exist
```

Firebase rules:

```text
rules rooms=True daily=True leaderboardRead=True
```

## 3. Smoke và UI local

Chrome headless tại 3 viewport:

- 360 x 640
- 390 x 844
- 430 x 932

Kết quả chung:

- First-run tutorial xuất hiện.
- Sau bỏ qua, menu chính hiển thị.
- Có đủ 6 nút hub: Play, Bạn bè, Shop, Tủ đồ, Nhiệm vụ, Hướng dẫn.
- Shop hiển thị 4 item.
- Tủ đồ ban đầu hiển thị 1 item mặc định.
- Màn nhiệm vụ mở được và báo cần Firebase/server time khi online không khả dụng.
- Bấm Play chuyển sang gameplay, timer chạy tới `00:29`.
- Canvas có kích thước hợp lệ và không overflow ngang.

Console có lỗi 400 từ Firebase Auth:

```text
https://identitytoolkit.googleapis.com/v1/accounts:signUp?... -> 400
Firebase: Error (auth/configuration-not-found)
```

Đánh giá: lỗi này ảnh hưởng online features, không làm hỏng local gameplay.

## 4. Shop/tủ đồ/localStorage

Kịch bản:

1. Clear localStorage.
2. Seed `kabao.totalCoins = 200`.
3. Mở Shop.
4. Mua `notebook` giá 40 xu.
5. Mua `swatter` giá 80 xu.
6. Mở Tủ đồ và trang bị vợt.
7. Toggle mute.

Kết quả:

```json
{
  "tutorialFirst": true,
  "beforeShopText": "Bạn đang có 200 xu.",
  "afterBuy": {
    "coins": "80",
    "inventory": "[\"slipper\",\"notebook\",\"swatter\"]"
  },
  "invCount": 3,
  "equipped": "swatter",
  "muted": "true",
  "localErrors": []
}
```

Đánh giá: Pass.

## 5. Result và xúc xắc

Kịch bản:

1. Clear localStorage.
2. Set `kabao.tutorialSeen = true`.
3. Bấm Play.
4. Chờ hết 30 giây.
5. Kiểm tra Result.
6. Bấm xúc xắc.

Kết quả:

```json
{
  "resultVisible": true,
  "resultStats": {
    "score": "0",
    "coins": "0",
    "matches": "1",
    "total": "0",
    "diceDisabledBefore": false
  },
  "afterDice": {
    "diceDisabledAfter": true,
    "diceText": "3",
    "bonus": "0",
    "total": "0"
  },
  "resultErrors": []
}
```

Đánh giá: Pass. Trận này không hit muỗi nên điểm/xu là 0; công thức bonus vẫn đúng.

## 6. Live deploy

URL live:

```text
https://thonguyen189.github.io/KaBao/
```

Kết quả:

```text
live has globalTopRuns=True shopScreen=False firebaseScores=True renderShop=False
```

GitHub Actions mới nhất:

```text
Deploy GitHub Pages status=completed conclusion=success branch=main created=2026-06-15T07:09:04Z
```

Đánh giá: live đang phục vụ bản cũ, chưa có nâng cấp shop/tủ đồ/phòng.

## 7. Mapping test case V1.1

| ID | Kết quả | Ghi chú |
| --- | --- | --- |
| SM-001 | Pass local / Pass live | HTTP 200. |
| SM-002 | Pass local | Menu hub có Play, tổng xu, top cá nhân/toàn cầu, âm thanh. |
| SM-003 | Pass local | Bấm Play chuyển gameplay, timer chạy. |
| SM-004 | Pass một phần | Gameplay mở và canvas hoạt động; chưa xác nhận thị giác muỗi bằng manual view. |
| SM-005 | Pass unit / Chưa manual | `hitMosquito` pass unit; chưa click trúng muỗi trong browser automation. |
| SM-006 | Pass local | Hết 30 giây chuyển Result. |
| SM-007 | Chưa chạy | Chưa tự động bấm Chơi lại sau Result. |
| SM-008 | Pass gián tiếp | Các nút về menu từ panel pass; home từ Result chưa chạy riêng. |
| GP-001 đến GP-007 | Pass unit một phần | Core timer/spawn/hit/combo/difficulty pass unit. |
| GP-008 | Chưa chạy | Browser headless không xác nhận âm thanh thực tế. |
| GP-009 | Pass local | Toggle mute lưu `kabao.soundMuted=true`. |
| RS-001 đến RS-006 | Pass local/unit | Result và dice pass; bonus 0 do trận không hit muỗi. |
| LB-001 | Pass fallback | Firebase lỗi thì hiển thị fallback, không crash. |
| LB-002 đến LB-004 | Pass unit | Validate nickname pass unit. |
| LB-005 | Fail/Blocked | Firebase Auth configuration lỗi. |
| LB-006 | Pass | Firebase lỗi nhưng local gameplay vẫn chạy. |
| LB-007 | Pass static | Rules có leaderboard, rooms, dailyMissions validations. |
| ST-001 đến ST-006 | Pass unit/local một phần | Storage, inventory, mute, nickname helpers pass; reload top run chưa chạy browser riêng. |
| Responsive | Pass smoke | 3 viewport không overflow ngang. |
| AS-001/AS-002 | Pass local | Manifest assets tồn tại; selected assets HTTP 200. |
| DP-001 | Pass | Live HTTP 200. |
| DP-002/DP-003 | Fail for upgraded version | Live chưa có shop/renderShop. |
| DP-004 | Pass | Latest workflow success, nhưng live vẫn chưa có code mới. |

## 8. Kết luận

Bản local đã pass các kiểm tra chính cho logic, UI hub, shop/tủ đồ, localStorage, Result và xúc xắc. Hai vấn đề còn lại trước khi coi V1.1 sẵn sàng release:

1. Firebase Anonymous Auth đang trả `auth/configuration-not-found`, làm các tính năng online như daily missions, room và cloud save không hoạt động đầy đủ.
2. GitHub Pages live chưa deploy bản nâng cấp hiện tại; live vẫn là bản cũ không có `shopScreen` và `renderShop`.

Sau khi bật/cấu hình Firebase Anonymous Auth và deploy code mới, cần chạy lại nhóm test online và deploy.
