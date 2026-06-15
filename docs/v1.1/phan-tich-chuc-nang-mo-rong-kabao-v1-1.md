# Phân tích chức năng mở rộng KaBao - V1.1+

Ngày cập nhật: 2026-06-15  
Phạm vi: phân tích trước triển khai cho các chức năng mở rộng sau V1.1  
Tài liệu liên quan: `phan-tich-game-kabao-v1-1.md`, `kich-ban-kiem-thu-kabao-v1-1.md`

## 1. Mục tiêu

Nhóm chức năng mở rộng này nhằm biến KaBao từ một vòng chơi ngắn thành một game có khả năng giữ chân người chơi tốt hơn. Trọng tâm không chỉ là thêm màn hình mới, mà là tạo lý do để người chơi quay lại, tích xu, thử vật phẩm, chơi cùng bạn bè và hiểu luật nhanh hơn.

Các chức năng cần phân tích:

- Thêm chế độ bạn bè hoặc mã phòng riêng.
- Thêm shop/tủ đồ đổi xu.
- Thêm vật phẩm như dép, vợt muỗi, điện thoại, vở.
- Thêm nhiệm vụ hằng ngày.
- Thêm màn hướng dẫn ngắn cho người chơi nhỏ tuổi.

## 2. Nguyên tắc thiết kế

- Ưu tiên dễ hiểu cho người chơi nhỏ tuổi: chữ ngắn, nút lớn, phản hồi rõ.
- Mỗi chức năng phải hỗ trợ vòng chơi chính là đập muỗi, không làm menu nặng hoặc khó vào trận.
- Dữ liệu quan trọng như xu, vật phẩm đã mua, nhiệm vụ và phòng chơi phải có cấu trúc rõ để sau này đồng bộ online.
- Nếu mạng hoặc Firebase lỗi, game vẫn cần chơi được ở chế độ cá nhân.
- Tránh làm kinh tế game quá phức tạp trong giai đoạn đầu; xu chỉ nên dùng cho vật phẩm và phần thưởng đơn giản.

## 3. Chế độ bạn bè hoặc mã phòng riêng

### Mục tiêu

Cho phép người chơi so điểm trong một nhóm nhỏ thay vì chỉ xem bảng xếp hạng toàn cầu. Đây là bước phù hợp sau leaderboard hiện tại vì game đã có nickname và Firebase anonymous auth.

### Trải nghiệm đề xuất

1. Từ màn hình chính, người chơi chọn "Bạn bè".
2. Người chơi có hai lựa chọn: tạo phòng mới hoặc nhập mã phòng.
3. Khi tạo phòng, game sinh mã ngắn 5-6 ký tự, ví dụ `KAB27`.
4. Người chơi chia sẻ mã này cho bạn bè.
5. Sau khi chơi, điểm của người chơi được gửi vào leaderboard của phòng.
6. Màn phòng hiển thị top người chơi trong phòng, điểm cao nhất, số xu nhận được và thời điểm chơi gần nhất.

### Dữ liệu đề xuất

LocalStorage:

- `kabao.lastRoomCode`: mã phòng gần nhất người chơi đã dùng.

Firebase:

- `rooms/{roomCode}/meta`: thông tin phòng, thời gian tạo, người tạo.
- `rooms/{roomCode}/members/{uid}`: nickname, thời gian tham gia.
- `rooms/{roomCode}/leaderboard/{uid}`: điểm cao nhất trong phòng, xu, combo cao nhất, thời điểm cập nhật.

### Quy tắc

- Mã phòng chỉ gồm chữ in hoa và số để dễ nhập trên điện thoại.
- Nickname vẫn dùng rule hiện tại để tránh dữ liệu rác.
- Mỗi người chơi chỉ lưu một bản ghi tốt nhất trong phòng, giúp bảng xếp hạng dễ đọc.
- Nếu người chơi chưa nhập nickname, cần yêu cầu nhập trước khi tạo hoặc tham gia phòng.

### Rủi ro

- Đã có baseline Firebase Security Rules; cần tinh chỉnh thêm nếu schema multiplayer thay đổi.
- Nếu tạo phòng không giới hạn, database có thể phình nhanh.
- Trẻ nhỏ có thể nhập nhầm mã phòng; UI cần báo lỗi nhẹ nhàng và cho thử lại.

### Tiêu chí nghiệm thu

- Tạo được mã phòng và tham gia lại bằng mã đó.
- Hai thiết bị có cùng mã phòng thấy cùng leaderboard.
- Không có mạng thì game báo không tải được phòng nhưng vẫn chơi cá nhân được.
- Điểm trong phòng không làm mất top cá nhân và top toàn cầu hiện có.

## 4. Shop và tủ đồ đổi xu

### Mục tiêu

Tạo giá trị sử dụng cho tổng xu. Shop là nơi mua vật phẩm, tủ đồ là nơi chọn vật phẩm đang dùng trong gameplay.

### Trải nghiệm đề xuất

1. Màn hình chính có nút "Shop" và "Tủ đồ".
2. Shop hiển thị danh sách vật phẩm, giá xu, trạng thái đã mua/chưa mua.
3. Người chơi đủ xu có thể mua vật phẩm.
4. Sau khi mua, vật phẩm xuất hiện trong tủ đồ.
5. Trong tủ đồ, người chơi chọn một vật phẩm làm vật phẩm đang dùng.
6. Gameplay dùng hình ảnh/hiệu ứng của vật phẩm đã chọn khi đập muỗi.

### Dữ liệu đề xuất

LocalStorage:

- `kabao.inventory`: danh sách mã vật phẩm đã sở hữu.
- `kabao.equippedItem`: mã vật phẩm đang trang bị.
- `kabao.totalCoins`: dùng lại tổng xu hiện có.

Cấu hình tĩnh:

- `shopItems`: danh sách vật phẩm, giá, tên, mô tả, asset, hiệu ứng.

### Quy tắc

- Vật phẩm mặc định là dép, luôn có sẵn và không thể bán/xóa.
- Mua vật phẩm trừ xu ngay khi xác nhận.
- Không cho mua trùng vật phẩm đã sở hữu.
- Nếu dữ liệu tủ đồ bị lỗi, fallback về dép mặc định.

### Rủi ro

- Nếu giá quá cao, người chơi nhỏ tuổi dễ nản.
- Nếu vật phẩm chỉ đổi hình ảnh, shop có thể thiếu hấp dẫn; nên có phản hồi âm thanh/hiệu ứng riêng.
- Cần tránh nút mua quá gần nút đóng để hạn chế mua nhầm trên mobile.

### Tiêu chí nghiệm thu

- Tổng xu giảm đúng sau khi mua.
- Vật phẩm đã mua vẫn còn sau reload.
- Vật phẩm đang trang bị được dùng trong gameplay.
- Không thể mua khi không đủ xu.
- UI shop/tủ đồ hoạt động tốt ở màn 360 x 640.

## 5. Vật phẩm: dép, vợt muỗi, điện thoại, vở

### Vai trò từng vật phẩm

| Vật phẩm | Trạng thái đề xuất | Vai trò gameplay | Ghi chú cân bằng |
| --- | --- | --- | --- |
| Dép | Mặc định | Hiệu ứng đập cơ bản | Có ngay từ đầu |
| Vợt muỗi | Mua bằng xu | Hiệu ứng điện/impact rõ hơn | Có thể tăng nhẹ vùng hitbox nếu cần |
| Điện thoại | Mua bằng xu | Hiệu ứng hài hước, âm thanh "bộp" khác | Không nên quá mạnh để tránh lệch game |
| Vở | Mua bằng xu | Hiệu ứng giấy/quạt, phù hợp trẻ nhỏ | Giá thấp hơn để dễ mua sớm |

### Mức triển khai đề xuất

Giai đoạn đầu nên coi vật phẩm là cosmetic có hiệu ứng khác nhau. Việc thêm chỉ số gameplay như tăng hitbox, tăng xu hoặc làm chậm muỗi nên để sau khi có dữ liệu chơi, vì các chỉ số này ảnh hưởng trực tiếp tới leaderboard.

### Asset cần chuẩn bị

- Icon nhỏ cho shop/tủ đồ.
- Sprite hoặc ảnh trạng thái khi vung vật phẩm.
- Hiệu ứng khi trúng muỗi.
- Âm thanh riêng nếu có.

Tài nguyên hiện có đã có nhóm `SlipperWeapons_Assets`, `EffectPack_Assets`, icon xu và UI pack. Dép có thể triển khai trước bằng tài nguyên sẵn có, các vật phẩm còn lại có thể dùng placeholder nội bộ trong tài liệu thiết kế nhưng không nên đưa placeholder vào bản chơi chính thức.

### Tiêu chí nghiệm thu

- Mỗi vật phẩm có tên, giá, mô tả ngắn và icon riêng.
- Khi đổi vật phẩm, gameplay phản hồi đúng vật phẩm đang chọn.
- Leaderboard vẫn ghi điểm công bằng nếu vật phẩm chỉ là cosmetic.
- Nếu vật phẩm có chỉ số, màn shop phải hiển thị chỉ số đó rõ ràng.

## 6. Nhiệm vụ hằng ngày

### Mục tiêu

Tạo lý do quay lại mỗi ngày và tăng nguồn xu ngoài gameplay. Bản đầu nên dùng nhiệm vụ đơn giản, dễ hiểu, không đòi hỏi đăng nhập tài khoản thật.

### Nhiệm vụ đề xuất

| Mã | Tên nhiệm vụ | Điều kiện hoàn thành | Thưởng |
| --- | --- | --- | --- |
| `daily_login` | Điểm danh hôm nay | Mở game lần đầu trong ngày | 10 xu |
| `play_one_match` | Chơi một trận | Kết thúc 1 trận bất kỳ | 15 xu |
| `hit_20_mosquitoes` | Đập 20 muỗi | Tích lũy 20 hit trong ngày | 20 xu |
| `roll_dice` | Tung xúc xắc | Tung xúc xắc sau trận | 10 xu |

### Dữ liệu đề xuất

LocalStorage:

- `kabao.dailyMissions.date`: ngày hiện tại theo định dạng `YYYY-MM-DD`.
- `kabao.dailyMissions.progress`: tiến độ từng nhiệm vụ.
- `kabao.dailyMissions.claimed`: trạng thái đã nhận thưởng.

### Quy tắc

- Nhiệm vụ reset theo ngày cục bộ của thiết bị.
- Người chơi cần bấm "Nhận" để cộng thưởng, giúp hiểu rõ vì sao xu tăng.
- Nếu mở game qua nhiều tab, cần hạn chế cộng thưởng trùng.
- Không nên yêu cầu chơi quá lâu; nhiệm vụ phải phù hợp phiên chơi ngắn.

### Rủi ro

- Người chơi có thể đổi ngày trên thiết bị để nhận thưởng thêm. Với bản local-first, rủi ro này chấp nhận được; nếu chuyển sang online, cần dùng server timestamp.
- Quá nhiều pop-up nhiệm vụ có thể làm trẻ nhỏ rối. Nên gom trong một màn nhiệm vụ riêng và chỉ báo chấm đỏ khi có thưởng.

### Tiêu chí nghiệm thu

- Điểm danh chỉ nhận một lần mỗi ngày.
- Tiến độ nhiệm vụ cập nhật đúng sau trận.
- Xu thưởng cộng đúng khi bấm nhận.
- Reload game không làm mất tiến độ trong ngày.

## 7. Màn hướng dẫn ngắn cho người chơi nhỏ tuổi

### Mục tiêu

Giúp người chơi mới hiểu luật trong dưới 20 giây, không cần đọc nhiều chữ. Màn hướng dẫn nên xuất hiện ở lần chơi đầu tiên và có thể mở lại từ menu.

### Nội dung đề xuất

Hướng dẫn gồm 3 bước:

1. "Chạm vào muỗi để ghi điểm."
2. "Đập liên tiếp để tạo combo."
3. "Hết giờ, tung xúc xắc để nhận thêm xu."

Mỗi bước nên có hình minh họa lớn, một câu ngắn và nút tiếp tục. Bước cuối có nút "Chơi ngay".

### Dữ liệu đề xuất

LocalStorage:

- `kabao.tutorialSeen`: đã xem hướng dẫn lần đầu.

### Quy tắc

- Lần đầu mở game nên hiển thị hướng dẫn trước khi vào trận, nhưng vẫn có nút bỏ qua.
- Sau khi người chơi bấm "Chơi ngay" hoặc "Bỏ qua", lưu `tutorialSeen = true`.
- Menu nên có nút nhỏ để xem lại hướng dẫn.
- Không dùng đoạn chữ dài hoặc thuật ngữ khó.

### Tiêu chí nghiệm thu

- Người chơi mới thấy hướng dẫn trong lần đầu.
- Người chơi cũ không bị ép xem lại sau reload.
- Có thể mở lại hướng dẫn từ menu.
- Hướng dẫn không che mất nút chính và không vỡ layout trên mobile.

## 8. Thứ tự ưu tiên triển khai

### Giai đoạn 1: Hướng dẫn và nền dữ liệu

- Màn hướng dẫn ngắn.
- Chuẩn hóa storage cho inventory, equipped item, daily missions.
- Thêm test cho storage fallback.

Lý do: ít phụ thuộc backend, giảm rủi ro và cải thiện trải nghiệm người chơi mới ngay.

### Giai đoạn 2: Shop, tủ đồ và vật phẩm cosmetic

- Shop.
- Tủ đồ.
- Dép mặc định và ít nhất một vật phẩm mua được.
- Hiệu ứng vật phẩm trong gameplay.

Lý do: tận dụng tổng xu hiện có, tạo mục tiêu chơi lại.

### Giai đoạn 3: Nhiệm vụ hằng ngày

- Điểm danh.
- Chơi một trận.
- Đập số lượng muỗi trong ngày.
- Nhận thưởng.

Lý do: nhiệm vụ dùng xu và gameplay đã ổn định hơn sau shop/tủ đồ.

### Giai đoạn 4: Mã phòng bạn bè

- Tạo phòng.
- Nhập phòng.
- Leaderboard theo phòng.
- Đồng bộ Firebase và xử lý lỗi mạng.

Lý do: có phụ thuộc backend và rules bảo mật, nên nên làm sau khi luồng offline/local đã chắc.

## 9. Tác động tới kiến trúc hiện tại

Các file có khả năng cần thay đổi khi triển khai:

- `index.html`: thêm màn shop, tủ đồ, nhiệm vụ, hướng dẫn, bạn bè/phòng.
- `src/styles.css`: thêm layout responsive cho các màn mới.
- `src/main.js`: điều phối màn hình, sự kiện UI, mua/trang bị vật phẩm, nhiệm vụ, phòng.
- `src/gameCore.js`: nếu vật phẩm có ảnh hưởng gameplay hoặc nhiệm vụ cần hook theo hit/match.
- `src/storage.js`: thêm inventory, equipped item, daily missions, tutorial seen, last room code.
- `src/firebaseScores.js`: thêm API phòng riêng nếu triển khai chế độ bạn bè.
- `src/assets.js` và `assets/asset-manifest.json`: đăng ký icon, sprite và effect mới.
- `tests/gameCore.test.mjs`: thêm test storage, nhiệm vụ, quy tắc mua/trang bị.

## 10. Khuyến nghị phạm vi bản đầu

Không nên triển khai cả 5 nhóm chức năng trong một lần lớn. Phạm vi hợp lý cho bản mở rộng đầu tiên:

- Màn hướng dẫn ngắn cho người chơi nhỏ tuổi.
- Shop/tủ đồ local-first.
- 2 vật phẩm: dép mặc định và vợt muỗi mua bằng xu.
- Nhiệm vụ hằng ngày đơn giản: điểm danh và chơi một trận.

Chế độ bạn bè/mã phòng riêng nên tách thành bản sau vì cần thiết kế Firebase data model và security rules kỹ hơn.

## 11. Câu hỏi cần chốt trước khi lập kế hoạch triển khai

- Các vật phẩm chỉ đổi hình ảnh/hiệu ứng hay có chỉ số gameplay?
- Giá xu từng vật phẩm nên thấp để trẻ nhỏ mua nhanh hay cao để kéo dài mục tiêu chơi?
- Chế độ bạn bè cần phòng tạm thời hay phòng lưu lâu dài?
- Nhiệm vụ hằng ngày chỉ lưu local hay cần chống gian lận bằng thời gian server?
- Hướng dẫn lần đầu có bắt buộc xem đủ hay cho bỏ qua ngay?

## 12. Kết luận

Nhóm mở rộng này nên được triển khai theo hướng local-first trước, online sau. Hướng dẫn, shop/tủ đồ và nhiệm vụ hằng ngày có thể nâng chất lượng trải nghiệm nhanh mà không làm tăng rủi ro backend. Mã phòng bạn bè là tính năng có giá trị cao nhưng cần được tách riêng thành một kế hoạch triển khai độc lập để đảm bảo dữ liệu, bảo mật và trải nghiệm nhiều người chơi ổn định.
