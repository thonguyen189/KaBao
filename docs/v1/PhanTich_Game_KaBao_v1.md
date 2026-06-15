# Phân tích game "Đập muỗi cùng Ka Báo" - V1

## 1. Tổng quan

"Đập muỗi cùng Ka Báo" là game mobile casual, trong đó người chơi chạm vào các con muỗi đang bay trên màn hình để đập chết chúng, ghi điểm và nhận xu. V1 tập trung vào việc tạo ra một prototype chơi được nhanh, có vòng chơi rõ ràng từ lúc vào game đến lúc kết thúc trận.

Mục tiêu của V1 không phải là làm đầy đủ toàn bộ hệ thống game, mà là chứng minh cảm giác chơi cốt lõi: muỗi xuất hiện, bay xung quanh, người chơi đập trúng, nhận phản hồi hình ảnh/âm thanh, tích lũy điểm và xem kết quả sau 2 phút.

## 2. Mục tiêu của V1

- Tạo được một bản game có thể chơi trên điện thoại.
- Có màn hình chính đơn giản với nút Play.
- Có gameplay 2 phút đếm ngược.
- Muỗi tự sinh ra theo thời gian và bay quanh màn hình.
- Người chơi chạm vào muỗi để đập chết.
- Mỗi con muỗi bị đập chết cộng điểm và xu.
- Có hiệu ứng đập trúng, âm thanh đập trúng và trạng thái muỗi rơi xuống.
- Có màn hình kết quả sau khi hết thời gian.
- Lưu được tổng xu của người chơi trên máy.
- Lưu được top 10 lượt chơi có điểm cao nhất trên máy.

## 3. Đối tượng người chơi

V1 hướng đến người chơi mobile casual, đặc biệt là trẻ em khoảng 6 tuổi, thích game ngắn, dễ hiểu, thao tác đơn giản và có tính giải trí nhanh. Người chơi không cần học luật phức tạp: chỉ cần thấy muỗi và chạm để đập.

Nhóm người chơi phù hợp:

- Trẻ em khoảng 6 tuổi hoặc người chơi phổ thông.
- Người chơi muốn giải trí ngắn trong vài phút.
- Người chơi thích game tap nhanh, có âm thanh và hiệu ứng vui.

## 4. Phạm vi V1

V1 chỉ bao gồm các thành phần cần thiết để tạo một vòng chơi hoàn chỉnh:

- Màn hình chính.
- Màn hình gameplay.
- Màn hình kết quả.
- Hệ thống sinh muỗi.
- Hệ thống chạm/đập muỗi.
- Hệ thống điểm và xu.
- Hiệu ứng cơ bản.
- Lưu tổng xu cục bộ trên thiết bị.
- Lưu top 10 lượt chơi có điểm cao nhất trên thiết bị.
- Hỗ trợ chơi trên web mobile ở nhiều tỉ lệ màn hình điện thoại.

## 5. Ngoài phạm vi V1

Những tính năng sau có trong ý tưởng ban đầu nhưng chưa nên làm trong V1:

- Cửa hàng đổi xu lấy vật phẩm.
- Tủ đồ chọn vật phẩm.
- Vật phẩm như dép, vợt muỗi, điện thoại, vở.
- Nhiệm vụ đăng nhập hằng ngày.
- Bảng xếp hạng bạn bè.
- Tài khoản người chơi.
- Đồng bộ dữ liệu online.
- Chế độ chơi xếp hạng.
- Hệ thống xúc xắc cuối trận.
- Nút Pause trong trận.
- Nút bật/tắt âm thanh trong V1.

Lý do để ngoài phạm vi: các tính năng này phụ thuộc vào gameplay cốt lõi. Nếu cảm giác đập muỗi chưa vui, shop hay leaderboard sẽ chưa tạo được giá trị thật sự. Vì vậy V1 cần ưu tiên làm gameplay thật rõ và có cảm giác phản hồi tốt.

## 6. Luồng màn hình V1

### 6.1. Luồng chính

1. Người chơi mở game.
2. Game hiện màn hình chính.
3. Người chơi bấm Play.
4. Game bắt đầu trận chơi 2 phút.
5. Muỗi xuất hiện và bay trên màn hình.
6. Người chơi chạm vào muỗi để đập.
7. Game cộng điểm và xu khi đập trúng.
8. Hết thời gian, game chuyển sang màn hình kết quả.
9. Người chơi xem điểm, xu nhận được và có thể chơi lại.

### 6.2. Các màn hình cần có

- Main Menu: màn hình chính.
- Gameplay: màn hình chơi.
- Result: màn hình kết quả.

## 7. Màn hình chính

### 7.1. Mục đích

Màn hình chính giúp người chơi nhận diện game và bắt đầu chơi nhanh.

### 7.2. Thành phần UI

- Logo game.
- Tên game: "Đập muỗi cùng Ka Báo".
- Slogan ngắn.
- Nút Play.
- Hiển thị tổng xu hiện có của người chơi.

### 7.3. Logo theo note ban đầu

Logo có thể lấy ý tưởng từ mô tả ban đầu: hình tròn màu trắng, bên trong là hình con muỗi màu đen, có viền đỏ và gạch chéo đỏ lên hình muỗi. Vì V1 cho phép sáng tạo thêm, logo có thể được thể hiện theo phong cách vui nhộn, pixel art, miễn là vẫn truyền tải rõ chủ đề chống muỗi.

### 7.4. Slogan gợi ý

Có thể dùng một trong các slogan sau:

- "Đập nhanh tay, sạch bóng muỗi!"
- "Muỗi bay tới đâu, Ka Báo đập tới đó!"
- "Săn muỗi trong 2 phút!"

V1 nên chọn một slogan ngắn, dễ đọc trên màn hình điện thoại.

## 8. Gameplay V1

### 8.1. Mục tiêu của người chơi

Trong 2 phút, đập chết càng nhiều muỗi càng tốt để đạt điểm cao và nhận nhiều xu.

### 8.2. Thời lượng trận

- Mỗi trận kéo dài 120 giây.
- Đồng hồ đếm ngược từ 120 về 0.
- Khi hết thời gian, tất cả thao tác đập muỗi dừng lại và game chuyển sang màn hình kết quả.

### 8.3. Vùng chơi

Muỗi bay trong vùng màn hình gameplay. UI điểm, xu và thời gian nên đặt ở phần trên cùng, tách khỏi vùng bay của muỗi nếu có thể.

Cần tránh để muỗi bị che bởi UI. Nếu muỗi bay gần thanh điểm/thời gian, người chơi có thể khó chạm hoặc cảm thấy bất công.

### 8.4. Điều khiển

- Người chơi chạm vào con muỗi trên màn hình.
- Nếu chạm trúng hitbox của muỗi, muỗi bị đập chết.
- Nếu chạm trượt, V1 có thể không phát sinh hình phạt.

Khuyến nghị V1 không trừ điểm khi chạm trượt, vì game cần ưu tiên cảm giác vui và dễ tiếp cận.

## 9. Hệ thống muỗi

### 9.1. Muỗi V1

V1 chỉ cần một loại muỗi cơ bản.

Thuộc tính gợi ý:

- Màu sắc: đen/xám đậm để nổi trên nền.
- Kích thước: đủ lớn để chạm được trên điện thoại.
- Tốc độ: vừa phải, có thể tăng dần theo thời gian.
- Di chuyển: bay quanh màn hình theo hướng ngẫu nhiên.
- Trạng thái: đang bay, bị đập, đang rơi, đã biến mất.

### 9.2. Sinh muỗi

Theo note ban đầu, mỗi giây sinh thêm 2 con muỗi. Tuy nhiên nếu để không giới hạn trong 2 phút, số lượng muỗi có thể quá lớn và gây rối màn hình.

Quy tắc khuyến nghị cho V1:

- Mỗi giây sinh tối đa 2 con muỗi mới.
- Giới hạn số muỗi đang sống trên màn hình.
- Số muỗi tối đa khuyến nghị ban đầu: 20 con.
- Nếu đã đạt giới hạn, game tạm dừng sinh muỗi mới cho đến khi người chơi đập bớt muỗi.

Quy tắc này giữ đúng tinh thần "sinh thêm 2 con mỗi giây" nhưng tránh việc game trở nên mất kiểm soát.

### 9.3. Vị trí sinh

Muỗi có thể sinh ở các vị trí ngẫu nhiên trong vùng chơi, tránh các khu vực sau:

- Sát mép màn hình quá mức khiến khó chạm.
- Trùng lên UI thời gian/điểm/xu.
- Trùng nhau quá nhiều trong cùng một điểm.

### 9.4. Chuyển động

Chuyển động của muỗi cần tạo cảm giác khó chịu, nhanh nhẹn nhưng không quá khó.

Gợi ý V1:

- Mỗi con muỗi có một hướng bay riêng.
- Sau một khoảng thời gian ngắn, muỗi đổi hướng nhẹ.
- Khi chạm mép vùng chơi, muỗi đổi hướng.
- Tốc độ có dao động ngẫu nhiên để tránh tất cả muỗi bay giống nhau.

## 10. Luật tính điểm và xu

### 10.1. Điểm

- Mỗi con muỗi bị đập chết: +1 điểm.
- Điểm trận hiện tại hiển thị trong gameplay.
- Điểm cuối cùng hiển thị ở màn hình kết quả.

### 10.2. Xu

- Mỗi con muỗi bị đập chết: +1 xu trong trận.
- Khi hết trận, xu của trận được cộng vào tổng xu lưu trên máy.
- Tổng xu hiển thị ở màn hình chính và màn hình kết quả.

V1 nên để điểm và xu bằng nhau để dễ hiểu. Về sau có thể thêm muỗi đặc biệt, combo hoặc vật phẩm tăng xu.

### 10.3. Top 10 lượt chơi cá nhân

V1 cần lưu top 10 lượt chơi có điểm cao nhất cục bộ trên máy.

- Sau mỗi trận, game kiểm tra điểm của trận vừa chơi.
- Nếu điểm đủ cao để vào top 10, thêm lượt chơi mới vào danh sách.
- Danh sách top 10 được sắp xếp từ điểm cao xuống thấp.
- Mỗi bản ghi nên lưu điểm, số xu nhận được và thời điểm chơi.
- Màn hình kết quả hiện thông báo "Vào top 10!" nếu lượt chơi mới lọt vào danh sách.

Leaderboard online chưa nằm trong V1.

## 11. Hiệu ứng và âm thanh

### 11.1. Âm thanh khi muỗi bay

Note ban đầu có yêu cầu muỗi bay có hiệu ứng âm thanh. Trong V1, cần cẩn thận vì nếu mỗi con muỗi đều phát tiếng liên tục, âm thanh có thể bị ồn.

Khuyến nghị:

- Dùng một lớp âm thanh nền nhẹ mô phỏng tiếng muỗi.
- Không cho từng con muỗi phát âm thanh riêng liên tục.
- Có thể tăng nhẹ âm lượng/cường độ khi số muỗi trên màn hình nhiều hơn.

### 11.2. Âm thanh khi đập trúng

Khi người chơi đập trúng muỗi:

- Phát âm thanh "đập" ngắn.
- Nếu có thể, thêm âm thanh muỗi bị tiêu diệt rất nhẹ.
- Âm thanh cần ngắn để không gây lặp khó chịu khi người chơi đập nhanh.

### 11.3. Hiệu ứng hình ảnh khi đập trúng

Khi đập trúng:

- Hiện nhanh hiệu ứng vật phẩm đập vào vị trí muỗi.
- Muỗi chuyển sang trạng thái bị đập.
- Muỗi rơi xuống dưới màn hình rồi biến mất.
- Hiện popup nhỏ "+1" hoặc "+1 xu".

V1 có thể dùng một vật phẩm mặc định là "dép" để đập muỗi. Các vật phẩm khác sẽ để cho shop/tủ đồ ở phiên bản sau.

## 12. Màn hình kết quả

### 12.1. Mục đích

Màn hình kết quả tổng kết thành tích trận vừa chơi và tạo động lực chơi lại.

### 12.2. Thành phần UI

- Tiêu đề: "Hết giờ!".
- Điểm đạt được.
- Số muỗi đã đập.
- Xu nhận được.
- Tổng xu hiện có sau khi cộng thưởng.
- Thứ hạng của lượt chơi trong top 10, nếu có.
- Thông báo "Vào top 10!" nếu lượt chơi mới lọt vào danh sách.
- Nút Chơi lại.
- Nút Về màn hình chính.

### 12.3. Xúc xắc cuối trận

Ý tưởng xúc xắc cuối trận trong note ban đầu rất thú vị, nhưng nên để ngoài V1 để gameplay cốt lõi đơn giản và dễ cân bằng.

Có thể đưa vào V1.1:

- Sau trận, người chơi được đổ xúc xắc một lần.
- Kết quả xúc xắc cộng thêm xu thưởng.
- Có thể dùng làm cơ chế giữ chân người chơi.

## 13. Dữ liệu cần lưu trong V1

V1 chỉ cần lưu dữ liệu cục bộ trên thiết bị:

- Tổng xu của người chơi.
- Top 10 lượt chơi có điểm cao nhất.
- Số trận đã chơi, nếu muốn thống kê cơ bản.

Chưa cần server, tài khoản hoặc database online.

## 14. Cân bằng độ khó ban đầu

### 14.1. Thông số đề xuất

- Thời gian trận: 120 giây.
- Muỗi sinh mỗi giây: 2 con.
- Số muỗi tối đa trên màn hình: 20 con.
- Điểm mỗi muỗi: 1.
- Xu mỗi muỗi: 1.
- Tốc độ muỗi ban đầu: chậm-vừa.
- Tăng tốc: có thể tăng nhẹ sau mỗi 30 giây.

### 14.2. Độ khó theo thời gian

Để trận chơi có cảm giác tăng nhiệt, có thể chia thành 4 giai đoạn:

- 0-30 giây: muỗi bay chậm, giúp người chơi làm quen.
- 31-60 giây: tăng nhẹ tốc độ.
- 61-90 giây: muỗi đổi hướng thường hơn.
- 91-120 giây: tốc độ nhanh hơn, màn hình đông hơn.

Nếu V1 cần làm cực nhanh, có thể giữ một mức độ khó cố định và chưa cần chia giai đoạn.

## 15. Yêu cầu trải nghiệm trên điện thoại

- Nút Play phải lớn và dễ chạm.
- Muỗi phải đủ lớn để chạm bằng ngón tay.
- Không đặt các mục tiêu chạm quá sát mép màn hình.
- UI điểm/thời gian/xu không được che gameplay.
- Game cần chạy mượt, ưu tiên ổn định hơn số lượng muỗi quá đông.
- Thao tác chạm phải có phản hồi ngay.
- V1 không cần nút Pause.
- V1 không cần nút bật/tắt âm thanh.
- Toàn bộ chữ trong game dùng tiếng Việt có dấu.
- Layout cần hỗ trợ nhiều tỉ lệ màn hình điện thoại khác nhau.

## 16. Yêu cầu kỹ thuật gợi ý

V1 sẽ được xây theo hướng HTML5 chạy trên web mobile. Cách tiếp cận phù hợp nhất là dùng HTML5 Canvas để dựng gameplay 2D, vì dễ mở trên trình duyệt điện thoại, dễ thử nghiệm nhanh và phù hợp với phạm vi prototype.

Định hướng kỹ thuật:

- HTML5 Canvas cho vùng gameplay.
- JavaScript/TypeScript cho logic game.
- CSS responsive cho màn hình dọc và nhiều tỉ lệ điện thoại.
- LocalStorage hoặc IndexedDB để lưu tổng xu và top 10 lượt chơi.

Với V1, yêu cầu kỹ thuật chính:

- Vòng lặp game có delta time.
- Hệ thống spawn muỗi.
- Xử lý chạm/tap trên mobile.
- Quản lý trạng thái game: menu, playing, result.
- Lưu local data.
- Quản lý âm thanh cơ bản.
- Nội dung giao diện sử dụng 100% tiếng Việt có dấu.

## 17. Tiêu chí hoàn thành V1

V1 được xem là hoàn thành khi:

- Mở game thấy màn hình chính.
- Bấm Play vào được gameplay.
- Đồng hồ đếm ngược từ 120 giây.
- Muỗi sinh ra và bay quanh màn hình.
- Chạm trúng muỗi làm muỗi bị đập chết.
- Điểm và xu trong trận tăng đúng.
- Muỗi có hiệu ứng/phản hồi khi bị đập.
- Hết giờ chuyển sang màn hình kết quả.
- Màn hình kết quả hiện điểm và xu.
- Tổng xu và top 10 lượt chơi được lưu lại sau khi thoát/mở lại game.
- Game chơi được trên màn hình điện thoại mà không bị vỡ UI.
- Game hỗ trợ nhiều tỉ lệ màn hình điện thoại phổ biến.

## 18. Rủi ro trong V1

### 18.1. Quá nhiều muỗi gây rối

Nếu sinh 2 con mỗi giây mà không có giới hạn, game sẽ nhanh chóng bị quá tải. Cần có giới hạn số muỗi đang sống.

### 18.2. Âm thanh muỗi gây khó chịu

Tiếng muỗi lặp lại liên tục có thể làm người chơi mệt. Nên dùng âm thanh nền nhẹ và âm thanh đập ngắn.

### 18.3. Muỗi quá nhỏ trên điện thoại

Nếu muỗi nhỏ như thật, người chơi sẽ khó chạm. Cần ưu tiên cảm giác chơi hơn tính thực tế.

### 18.4. Gameplay lặp lại nhanh chán

V1 có thể lặp lại vì chưa có shop/vật phẩm. Cần làm phản hồi đập trúng thật vui để bù lại. Sau đó V1.1 có thể thêm shop, xúc xắc hoặc vật phẩm.

## 19. Hướng mở rộng sau V1

### V1.1

- Thêm xúc xắc cuối trận để nhận thêm xu.
- Thêm cửa hàng đơn giản.
- Thêm tủ đồ.
- Thêm vật phẩm "dép" và "vợt muỗi" với hình ảnh khác nhau.
- Thêm nút bật/tắt âm thanh.

### V1.2

- Thêm nhiệm vụ đăng nhập hằng ngày.
- Thêm combo khi đập liên tục.
- Thêm muỗi đặc biệt cho nhiều xu hơn.
- Thêm mức độ khó.

### V2

- Thêm tài khoản.
- Thêm bảng xếp hạng bạn bè.
- Thêm đồng bộ dữ liệu.
- Thêm sự kiện hoặc thử thách hằng ngày.

## 20. Thông tin đã chốt sau khi làm rõ

Các quyết định sau đã được bổ sung để hoàn thiện phạm vi V1:

1. Công nghệ thực hiện: HTML5.
2. Nền tảng mục tiêu: web mobile.
3. Phong cách hình ảnh: vui nhộn, pixel art.
4. "Ka Báo" là tên của người đưa ra ý tưởng, chưa phải nhân vật có hình ảnh cố định.
5. Logo có thể sáng tạo thêm dựa trên mô tả chống muỗi ban đầu.
6. V1 không cần nút Pause.
7. V1 không cần nút bật/tắt âm thanh.
8. Kích thước và tốc độ muỗi cần phù hợp với thao tác bấm của trẻ khoảng 6 tuổi.
9. Tổng xu có sử dụng trong V1 và cần được lưu lại.
10. V1 lưu top 10 lượt chơi có điểm cao nhất.
11. Gameplay ưu tiên dễ chơi cho trẻ em.
12. Game dùng màn hình dọc.
13. V1 cần hỗ trợ nhiều tỉ lệ màn hình điện thoại khác nhau.
14. Toàn bộ chữ trong game sử dụng tiếng Việt có dấu.
15. V1 không yêu cầu âm thanh/hình ảnh mẫu riêng từ người dùng cung cấp.

## 21. Quyết định mặc định cho V1

Dựa trên thông tin đã chốt, V1 sẽ đi theo các quyết định sau:

- Làm bằng HTML5 cho web mobile.
- Dùng màn hình dọc.
- Hỗ trợ nhiều tỉ lệ màn hình điện thoại phổ biến.
- Dùng phong cách vui nhộn, pixel art.
- V1 có Main Menu, Gameplay và Result.
- Chưa làm shop, tủ đồ, login, leaderboard.
- Chưa làm xúc xắc cuối trận.
- Chưa làm Pause và nút bật/tắt âm thanh.
- Mỗi trận dài 120 giây.
- Mỗi giây sinh tối đa 2 muỗi.
- Giới hạn 20 muỗi trên màn hình.
- Mỗi muỗi bị đập cộng 1 điểm và 1 xu.
- Lưu tổng xu và top 10 lượt chơi trên máy.
- Vật phẩm đập mặc định là dép.
- Toàn bộ giao diện dùng tiếng Việt có dấu.

Đây là phạm vi gọn, rõ, phù hợp để bắt đầu prototype và kiểm tra cảm giác chơi sớm.
