# Kịch bản kiểm thử game "Đập muỗi cùng Ka Báo" - V1

Ngày tạo: 2026-06-14  
Nguồn yêu cầu: `PhanTich_Game_KaBao_v1.md`, `Note.txt`, `assets/README.md`

## 1. Mục tiêu kiểm thử

Xác nhận bản V1 có một vòng chơi hoàn chỉnh trên web mobile:

- Mở game vào được Main Menu.
- Bấm Play vào Gameplay.
- Trận chơi kéo dài 120 giây và tự chuyển Result khi hết giờ.
- Muỗi sinh ra, bay trong vùng chơi, có giới hạn số lượng.
- Chạm trúng muỗi cộng đúng điểm và xu.
- Có phản hồi hình ảnh và âm thanh khi bắt đầu, đập trúng, nhận xu, hết giờ.
- Tổng xu và top 10 điểm cao được lưu cục bộ sau khi thoát/mở lại.
- UI không vỡ trên các tỉ lệ màn hình mobile phổ biến.

## 2. Phạm vi kiểm thử

### Trong phạm vi V1

- Main Menu.
- Gameplay.
- Result.
- Spawn, movement, hit detection và trạng thái muỗi.
- Điểm, xu trong trận, tổng xu.
- Top 10 local leaderboard.
- Asset hình ảnh/âm thanh cơ bản.
- Responsive màn hình dọc mobile.
- Lưu dữ liệu bằng localStorage hoặc cơ chế cục bộ tương đương.

### Ngoài phạm vi V1, dùng để kiểm tra không bị làm dư

- Shop.
- Tủ đồ.
- Đăng nhập.
- Leaderboard online/bạn bè.
- Xúc xắc cuối trận.
- Pause.
- Nút bật/tắt âm thanh.
- Nhiệm vụ đăng nhập hằng ngày.

## 3. Môi trường kiểm thử đề xuất

- Desktop browser dùng DevTools mobile emulation.
- Chrome hoặc Edge mới nhất.
- Viewport dọc:
  - 360 x 640.
  - 375 x 667.
  - 390 x 844.
  - 414 x 896.
  - 430 x 932.
- Kiểm thử thêm trên viewport ngang để xác nhận game không vỡ nghiêm trọng, dù mục tiêu chính là màn hình dọc.
- Nếu có server dev, mở bằng `http://localhost:<port>`.
- Nếu là HTML tĩnh, mở trực tiếp file `index.html` hoặc chạy một static server đơn giản.

## 4. Quy tắc ghi bug và fix

Khi gặp bug:

1. Ghi rõ testcase ID, viewport, trình duyệt, bước tái hiện, kết quả thực tế, kết quả mong đợi.
2. Tái hiện lại tối thiểu 2 lần để xác nhận bug ổn định.
3. Xác định nguyên nhân gốc trước khi sửa.
4. Nếu có hệ thống test tự động, thêm test tái hiện lỗi trước khi sửa.
5. Sửa tối thiểu đúng nguyên nhân.
6. Chạy lại testcase lỗi và các testcase liên quan.
7. Tiếp tục kịch bản từ testcase đang dở.

Mẫu bug log:

```text
BUG-001
Testcase: TC-GP-004
Viewport: 390 x 844
Trình duyệt: Chrome
Bước tái hiện:
1. Mở game
2. Bấm Play
3. Chạm vào muỗi ở góc phải
Kết quả thực tế:
Kết quả mong đợi:
Mức độ: Blocker/Critical/Major/Minor
Nguyên nhân gốc:
Fix:
Kết quả retest:
```

## 5. Checklist smoke test

Chạy trước để biết bản build có đủ điều kiện test sâu không.

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-SM-001 | Blocker | Game mở được | Mở URL hoặc `index.html` | Không lỗi trắng màn hình, không crash console nghiêm trọng |
| TC-SM-002 | Blocker | Main Menu hiển thị | Quan sát màn hình đầu | Có logo, tên game, slogan, nút Play, tổng xu |
| TC-SM-003 | Blocker | Vào gameplay | Bấm Play | Chuyển sang màn gameplay, timer bắt đầu từ 120 giây |
| TC-SM-004 | Blocker | Muỗi xuất hiện | Chờ 2 đến 3 giây | Có muỗi sinh ra và bay trong vùng chơi |
| TC-SM-005 | Blocker | Đập muỗi | Chạm/bấm vào một con muỗi | Muỗi bị đập, điểm +1, xu trận +1 |
| TC-SM-006 | Blocker | Kết thúc trận | Chờ hết giờ hoặc dùng công cụ debug nếu có | Chuyển Result, hiện điểm và xu |
| TC-SM-007 | Critical | Chơi lại | Từ Result bấm Chơi lại | Vào trận mới, điểm và xu trận reset về 0 |
| TC-SM-008 | Critical | Về menu | Từ Result bấm Về màn hình chính | Về Main Menu, tổng xu đã cập nhật |

## 6. Testcase Main Menu

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-MM-001 | Critical | Nội dung tiếng Việt | Mở Main Menu | Toàn bộ chữ có dấu, dễ đọc, không mojibake |
| TC-MM-002 | Critical | Logo đúng chủ đề | Quan sát logo | Logo thể hiện chủ đề chống muỗi, không méo/vỡ |
| TC-MM-003 | Critical | Nút Play dễ chạm | Kiểm tra trên 360 x 640 | Nút đủ lớn, không bị che, bấm được bằng thao tác touch/click |
| TC-MM-004 | Major | Tổng xu hiển thị | Mở game lần đầu | Tổng xu là 0 nếu chưa có dữ liệu |
| TC-MM-005 | Major | Không có tính năng ngoài V1 | Quan sát menu | Không có Shop, Tủ đồ, Login, Pause, bật/tắt âm thanh |
| TC-MM-006 | Major | Dữ liệu cũ được đọc | Có sẵn tổng xu trong localStorage, reload game | Main Menu hiển thị đúng tổng xu đã lưu |

## 7. Testcase Gameplay

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-GP-001 | Blocker | Timer bắt đầu đúng | Bấm Play | Timer hiển thị 120 hoặc 02:00 và bắt đầu đếm ngược |
| TC-GP-002 | Critical | Timer giảm đều | Quan sát 10 giây đầu | Timer giảm theo giây, không nhảy số bất thường |
| TC-GP-003 | Critical | Spawn 2 muỗi/giây | Bắt đầu trận, không đập muỗi trong 5 giây | Số muỗi tăng gần 2 con/giây, không vượt giới hạn thiết kế |
| TC-GP-004 | Critical | Giới hạn 20 muỗi | Không đập muỗi đến khi đông màn hình | Số muỗi đang sống không vượt 20 |
| TC-GP-005 | Critical | Muỗi không spawn lên UI | Quan sát vị trí spawn | Muỗi không bị thanh điểm/xu/timer che khuất |
| TC-GP-006 | Critical | Muỗi không spawn quá sát mép | Quan sát nhiều lần spawn | Muỗi nằm trong vùng có thể chạm được |
| TC-GP-007 | Critical | Muỗi bay trong vùng chơi | Theo dõi 5 đến 10 con | Muỗi đổi hướng hoặc bật lại khi tới rìa, không bay mất khỏi màn hình khi còn sống |
| TC-GP-008 | Blocker | Hit detection trúng | Chạm vào thân muỗi | Ghi nhận hit ngay, điểm +1, xu trận +1 |
| TC-GP-009 | Critical | Hit detection trượt | Chạm vùng trống | Không cộng điểm, không cộng xu, không crash |
| TC-GP-010 | Critical | Một muỗi không tính điểm nhiều lần | Chạm liên tục vào cùng một muỗi đang bị đập/rơi | Chỉ cộng điểm và xu đúng 1 lần |
| TC-GP-011 | Critical | Phản hồi khi đập trúng | Đập trúng muỗi | Có hiệu ứng dép/hit burst, muỗi đổi sang trạng thái bị đập/rơi, có popup +1 hoặc +1 xu |
| TC-GP-012 | Major | Âm thanh bắt đầu | Bấm Play sau tương tác người dùng | Có âm thanh start nếu browser cho phép autoplay sau gesture |
| TC-GP-013 | Major | Âm thanh muỗi bay | Trong gameplay có muỗi sống | Có lớp tiếng muỗi nhẹ, không quá ồn, không phát chồng từng con |
| TC-GP-014 | Major | Âm thanh đập trúng | Đập trúng muỗi | Có âm slap ngắn, không bị trễ rõ rệt |
| TC-GP-015 | Major | Âm thanh nhận xu | Đập trúng muỗi | Có âm nhận xu hoặc phản hồi âm thanh phù hợp |
| TC-GP-016 | Critical | Điểm và xu trận bằng nhau | Đập chính xác 5 con | Điểm trận = 5, xu trận = 5 |
| TC-GP-017 | Critical | Hết giờ dừng gameplay | Khi timer về 0 | Không thể tiếp tục cộng điểm/xu, game chuyển Result |
| TC-GP-018 | Major | Không có Pause | Trong gameplay quan sát UI | Không hiển thị nút Pause trong V1 |
| TC-GP-019 | Major | Không có mute toggle | Trong gameplay quan sát UI | Không hiển thị nút bật/tắt âm thanh trong V1 |
| TC-GP-020 | Critical | Hiệu năng cơ bản | Chơi 60 giây với nhiều muỗi | Không giật nặng, không tụt phản hồi tap, không tăng muỗi vô hạn |

## 8. Testcase Result

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-RS-001 | Blocker | Result xuất hiện khi hết giờ | Chơi đến timer 0 | Hiển thị màn Result với tiêu đề "Hết giờ!" hoặc tương đương |
| TC-RS-002 | Critical | Hiển thị điểm | Kết thúc trận có điểm > 0 | Result hiển thị đúng điểm cuối |
| TC-RS-003 | Critical | Hiển thị số muỗi đã đập | Kết thúc trận sau khi đập N con | Số muỗi đã đập = N |
| TC-RS-004 | Critical | Hiển thị xu nhận được | Kết thúc trận sau khi đập N con | Xu nhận được = N |
| TC-RS-005 | Critical | Cộng tổng xu | Ghi tổng xu trước trận, chơi được N xu | Tổng xu sau trận = tổng xu trước trận + N |
| TC-RS-006 | Major | Thông báo top 10 | Chơi một trận đủ điểm vào top 10 | Có thông báo "Vào top 10!" hoặc thứ hạng tương ứng |
| TC-RS-007 | Critical | Nút Chơi lại | Bấm Chơi lại | Vào gameplay mới, timer reset, điểm/xu trận reset |
| TC-RS-008 | Critical | Nút Về màn hình chính | Bấm Về màn hình chính | Quay về Main Menu, dữ liệu tổng xu giữ nguyên |
| TC-RS-009 | Major | Không có xúc xắc cuối trận | Quan sát Result | Không có cơ chế đổ xúc xắc trong V1 |

## 9. Testcase lưu dữ liệu cục bộ

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-ST-001 | Critical | Tổng xu lưu sau reload | Chơi một trận có xu, reload trang | Main Menu/Result vẫn hiển thị tổng xu đã cộng |
| TC-ST-002 | Critical | Top 10 lưu sau reload | Tạo ít nhất 1 điểm top 10, reload trang | Danh sách top 10 vẫn còn dữ liệu |
| TC-ST-003 | Critical | Top 10 chỉ giữ 10 bản ghi | Tạo 11 lượt chơi với điểm khác nhau | Chỉ còn 10 lượt điểm cao nhất |
| TC-ST-004 | Critical | Top 10 sắp xếp giảm dần | Tạo các điểm 3, 10, 5 | Thứ tự lưu/hiển thị là 10, 5, 3 |
| TC-ST-005 | Major | Dữ liệu hỏng không làm crash | Sửa localStorage top 10 thành chuỗi không hợp lệ, reload | Game tự fallback an toàn, không trắng màn hình |
| TC-ST-006 | Major | Tổng xu không âm/NaN | Sửa localStorage tổng xu thành giá trị âm hoặc chữ, reload | Game fallback về 0 hoặc giá trị hợp lệ |

## 10. Testcase responsive mobile

| ID | Mức | Viewport | Kịch bản | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-RP-001 | Critical | 360 x 640 | Main Menu | Không tràn chữ, nút Play thấy rõ và bấm được |
| TC-RP-002 | Critical | 360 x 640 | Gameplay | Timer/điểm/xu không che vùng muỗi quá mức |
| TC-RP-003 | Critical | 360 x 640 | Result | Nút Chơi lại và Về màn hình chính không bị cắt |
| TC-RP-004 | Critical | 390 x 844 | Gameplay | Canvas/vùng chơi lấp đầy hợp lý, không méo asset |
| TC-RP-005 | Critical | 414 x 896 | Gameplay | Muỗi có kích thước đủ chạm, không quá nhỏ |
| TC-RP-006 | Major | 430 x 932 | Main Menu/Result | Bố cục cân đối, không có khoảng trống bất thường |
| TC-RP-007 | Major | Landscape bất kỳ | Xoay ngang hoặc dùng viewport ngang | Không crash; nếu không hỗ trợ ngang, có thông báo hoặc layout vẫn dùng được tối thiểu |

## 11. Testcase asset

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-AS-001 | Critical | Tải hình ảnh | Mở game, quan sát network/console | Các SVG trong `assets/images` tải thành công |
| TC-AS-002 | Major | Tải âm thanh | Bấm Play và đập muỗi | Các WAV trong `assets/sounds` tải thành công, không lỗi 404 |
| TC-AS-003 | Major | Manifest khớp đường dẫn | Kiểm tra asset lookup nếu game dùng manifest | Đường dẫn trong `asset-manifest.json` được resolve đúng |
| TC-AS-004 | Major | Fallback asset | Giả lập thiếu một asset không blocker | Game không crash toàn bộ; ít nhất log lỗi rõ ràng |

## 12. Testcase độ bền và thao tác nhanh

| ID | Mức | Kịch bản | Bước thực hiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| TC-DU-001 | Major | Tap nhanh nhiều điểm | Tap nhanh 20 lần vào các vị trí có/không có muỗi | Không crash, không cộng sai cho tap trượt |
| TC-DU-002 | Major | Bấm Play nhiều lần | Ở Main Menu bấm Play liên tục | Chỉ tạo một trận chơi, không nhân đôi timer/spawn loop |
| TC-DU-003 | Major | Reload giữa trận | Bấm Play, reload trang giữa gameplay | Game khởi động lại an toàn, không dữ liệu trận dở gây lỗi |
| TC-DU-004 | Major | Chơi liên tiếp 3 trận | Chơi hoặc rút ngắn debug 3 trận liên tục | Điểm/xu từng trận reset đúng, tổng xu tích lũy đúng |
| TC-DU-005 | Minor | Tab background | Đang chơi chuyển tab 10 giây rồi quay lại | Timer và game loop không nhảy lỗi nghiêm trọng; không spawn bùng nổ vượt 20 |

## 13. Thứ tự chạy đề xuất

1. Chạy toàn bộ smoke test `TC-SM-*`.
2. Nếu có blocker, dừng để fix rồi chạy lại smoke test.
3. Chạy Main Menu `TC-MM-*`.
4. Chạy Gameplay `TC-GP-*`.
5. Chạy Result `TC-RS-*`.
6. Chạy Storage `TC-ST-*`.
7. Chạy Responsive `TC-RP-*`.
8. Chạy Asset `TC-AS-*`.
9. Chạy Durability `TC-DU-*`.
10. Sau mỗi bug fix, chạy lại testcase lỗi, testcase cùng nhóm, rồi tiếp tục từ vị trí dở.

## 14. Tiêu chí pass V1

Bản V1 được xem là đạt kiểm thử khi:

- Không còn testcase mức Blocker hoặc Critical fail.
- Bug Major còn lại, nếu có, không phá vòng chơi chính và có ghi chú chấp nhận rõ ràng.
- Game chơi được từ Main Menu đến Result trên ít nhất 3 viewport mobile dọc.
- Tổng xu và top 10 vẫn còn sau reload.
- Không có tính năng ngoài phạm vi V1 làm rối luồng chính.
- Không có lỗi console nghiêm trọng gây crash hoặc trắng màn hình.

## 15. Trạng thái chạy thử hiện tại

Chưa chạy được test trên bản game vì workspace hiện chỉ có tài liệu và asset, chưa có mã nguồn HTML/JS/CSS hoặc server dev để mở game.

Khi session `019ec682-d613-71a0-bd25-b571bc7ef5ec` kết thúc và bản V1 xuất hiện trong workspace, bắt đầu chạy từ `TC-SM-001`. Nếu gặp bug, thực hiện theo mục 4 rồi tiếp tục kịch bản đến hết.
