# Báo cáo triển khai KaBao - V1.1

Ngày triển khai: 2026-06-15  
Nhánh: `main`  
Commit: `57f6d5210f2b36203612ca052ccdb9d702b728b2`  
Commit message: `Add leaderboard and reward features`

## 1. Nội dung đã triển khai

- Thêm cấu hình game tập trung trong `src/settings.js`.
- Rút thời lượng trận xuống 30 giây.
- Thêm độ khó tăng dần theo thời gian.
- Mở rộng hitbox muỗi cho thao tác mobile.
- Thêm combo khi hit liên tiếp.
- Thêm phản hồi miss.
- Thêm bật/tắt âm thanh và lưu trạng thái mute.
- Thêm form nickname và validate nickname.
- Thêm Firebase anonymous auth, lưu profile/run/leaderboard.
- Thêm Firebase Realtime Database Security Rules cho leaderboard và dữ liệu players.
- Thêm top 10 toàn cầu ở Main Menu.
- Thêm số trận đã chơi và combo cao nhất ở Result.
- Thêm xúc xắc thưởng xu sau trận.
- Mở rộng unit test cho core, storage và Firebase payload.
- Sửa các chuỗi tiếng Việt bị lỗi mã hóa trước khi push.

## 2. File thay đổi

- `index.html`
- `src/firebaseScores.js`
- `src/gameCore.js`
- `src/main.js`
- `src/settings.js`
- `src/storage.js`
- `src/styles.css`
- `tests/gameCore.test.mjs`
- `database.rules.json`
- `firebase.json`

## 3. Deploy

Deploy dùng GitHub Actions:

- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: push vào `main`
- Run: https://github.com/thonguyen189/KaBao/actions/runs/27520793213
- Kết quả: `completed / success`
- Updated at: `2026-06-15T02:40:53Z`

Site live:

- https://thonguyen189.github.io/KaBao/

## 4. Kiểm tra sau deploy

Đã kiểm tra bằng HTTP:

- URL live trả `200`.
- HTML live có tiêu đề game.
- HTML live có markup mới: `globalTopRuns`, `menuSoundButton`.
- `src/main.js` live trả `200`.
- JS live có import `firebaseScores`.
- JS live có chuỗi tiếng Việt đã sửa: `Kỷ lục mới`.
- JS live có emoji xúc xắc.

Git local sau push:

- `git status -sb`: `## main...origin/main`
- Không còn file modified/untracked trong worktree tại thời điểm kiểm tra.

## 5. Giới hạn kiểm tra

- Không chạy được `node tests/gameCore.test.mjs` vì máy hiện không có `node` trong PATH.
- Browser plugin nội bộ không có phiên `iab` khả dụng, nên không chụp được screenshot trực tiếp bằng Browser plugin.
- Chưa xác nhận âm thanh bằng tai người dùng; mới kiểm tra code/deploy và asset theo phạm vi có thể thực hiện trong môi trường hiện tại.

## 6. Khuyến nghị trước lần deploy tiếp theo

1. Cài hoặc khôi phục Node.js trong PATH.
2. Chạy `node tests/gameCore.test.mjs`.
3. Mở site live trên điện thoại thật để kiểm tra touch, âm thanh và layout.
4. Deploy `database.rules.json` lên Firebase Realtime Database trước khi cho nhiều người chơi dùng leaderboard.
