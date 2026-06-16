# Phan tich game KaBao - V1.2: Nickname va thiet lap tai khoan

Ngay cap nhat: 2026-06-16  
Pham vi: phan tich truoc trien khai cho thay doi luong nickname, thiet lap am thanh va tao lai tai khoan nickname  
Tai lieu lien quan: `docs/v1.1/phan-tich-game-kabao-v1-1.md`, `docs/v1.1/bao-cao-nang-cap-kabao-v1-1-vat-pham.md`

## 1. Muc tieu

V1.2 tap trung chuan hoa dinh danh nguoi choi truoc khi vao game. Thay vi chi hoi nickname o man ket qua, game se yeu cau nguoi choi nhap nickname som hon, luu nickname tren may va dung nickname do cho cac lan choi tiep theo cung nhu du lieu bang xep hang.

Ban nay cung can tach nut thiet lap rieng de nguoi choi bat/tat am thanh va tao lai tai khoan nickname khi muon doi ten. Viec tao lai nickname duoc xem nhu tao mot ho so local moi, nen toan bo du lieu luu tam tren may se bi xoa de tranh lan du lieu giua hai nickname.

## 2. Hien trang lien quan trong V1.1

- `src/storage.js` da co `kabao.nickname` va helper `loadNickname`, `saveNickname`.
- `src/storage.js` da co `kabao.soundMuted` va helper `loadSoundMuted`, `saveSoundMuted`.
- `src/firebaseScores.js` da validate nickname truoc khi luu profile, run va leaderboard.
- `src/main.js` hien dang hien form nickname o man ket qua neu chua co nickname.
- Tao/vao phong ban be hien yeu cau da co nickname.
- Du lieu local dang gom xu, top runs, so tran, am thanh, nickname, inventory, vat pham dang trang bi, tutorial va ma phong gan nhat.

## 3. Pham vi thay doi V1.2

### 3.1. Thoi diem nhap nickname

Nickname nen duoc yeu cau o lan mo game dau tien, truoc khi nguoi choi bat dau tran dau. Luong de xuat:

1. Nguoi choi mo game.
2. Game kiem tra `kabao.nickname`.
3. Neu chua co nickname hop le, hien man nhap nickname hoac modal tao tai khoan.
4. Sau khi nickname hop le, luu vao `localStorage`.
5. Game moi cho vao menu chinh day du va cho bam Play.
6. Cac lan sau, game bo qua buoc nhap nickname va dung nickname da luu.

Man nhap nickname can ngan gon, than thien voi tre nho:

- Tieu de: "Ten cua ban la gi?"
- Input gioi han 2-16 ky tu, dung chung rule validate hien tai.
- Nut chinh: "Bat dau".
- Loi validate: hien cau ngan, khong dung thong bao ky thuat.

### 3.2. Nickname tren bang xep hang

Nickname da luu tren may se la nguon du lieu chinh khi gui ket qua len Firebase:

- Global leaderboard: moi ket qua gui len phai kem nickname hien tai.
- Room leaderboard: khi tao/vao phong va khi luu ket qua phong phai dung nickname hien tai.
- Player profile: cap nhat nickname hien tai khi co ket qua moi hoac khi can dong bo profile.

Neu Firebase loi hoac offline, game van cho choi va luu local nhu hien tai. Ket qua online co the bo qua neu khong luu duoc, nhung khong duoc lam mat tien trinh local trong phien choi.

### 3.3. Nut thiet lap rieng

V1.2 nen gom cac thao tac cau hinh vao mot nut "Thiet lap" rieng tren menu chinh. Nut am thanh khong nen nam rai rac o nhieu man hinh nhu hanh dong chinh nua, tru khi can giu mot nut tat nhanh trong gameplay.

Noi dung man thiet lap de xuat:

- Hien nickname hien tai.
- Cong tac am thanh: Bat/Tat.
- Nut "Tao lai nickname" hoac "Doi nickname".
- Nut dong/quay lai menu.

Quy tac am thanh:

- Trang thai am thanh tiep tuc luu trong `kabao.soundMuted`.
- Doi trang thai trong thiet lap phai cap nhat ngay UI va am thanh dang chay.
- Neu van giu nut am thanh o HUD, nut do phai dong bo voi trang thai trong thiet lap.

### 3.4. Tao lai nickname va xoa du lieu local

Theo yeu cau V1.2, thay doi nickname dong nghia voi xoa het du lieu luu tam tren may. Day la hanh dong co rui ro, nen can co buoc xac nhan ro rang.

Luong de xuat:

1. Nguoi choi vao Thiet lap.
2. Bam "Tao lai nickname".
3. Game hien xac nhan: "Doi nickname se xoa xu, vat pham, lich su choi va du lieu luu tren may nay. Ban co chac khong?"
4. Neu huy, khong thay doi gi.
5. Neu dong y, game xoa du lieu local cua KaBao.
6. Game quay ve man nhap nickname ban dau.
7. Sau khi nhap nickname moi, nguoi choi bat dau lai voi ho so local moi.

Du lieu can xoa:

- `kabao.totalCoins`
- `kabao.topRuns`
- `kabao.playedMatches`
- `kabao.nickname`
- `kabao.inventory`
- `kabao.equippedItem`
- `kabao.tutorialSeen`
- `kabao.lastRoomCode`
- Du lieu nhiem vu hang ngay neu da co trong code hien tai hoac se them sau nay.

Can can nhac rieng voi `kabao.soundMuted`:

- Khuyen nghi giu lai `kabao.soundMuted` vi day la tuy chon thiet bi, khong phai thanh tich tai khoan.
- Neu muon dung dung cau "xoa het du lieu luu tam", co the xoa ca `kabao.soundMuted`; tuy nhien trai nghiem se kem on dinh hon vi nguoi choi da tat am co the bi bat lai sau khi doi nickname.
- De xuat V1.2: xoa du lieu tien trinh/tai khoan, giu tuy chon am thanh. Tai lieu kiem thu can ghi ro quy uoc nay.

### 3.5. Cap nhat UI va rule hieu ung khi dap muoi

Hien tai khi dap trung muoi, ba lop hieu ung co the xuat hien gan cung mot vi tri: icon `+1 xu`, thong tin combo va hieu ung vu khi dap trung. Cac lop nay de che nhau, dac biet icon xu lam kho nhin hieu ung vu khi.

V1.2 can chuan hoa rule:

1. Khi hit duoc tinh combo, so xu nhan duoc bang combo hien tai.
2. Hit dau tien trong chuoi la `combo x1`, nguoi choi nhan 1 xu.
3. Hit thu hai trong cua so combo la `combo x2`, nguoi choi nhan 2 xu.
4. Hit thu ba la `combo x3`, nguoi choi nhan 3 xu, va tiep tuc theo cung quy tac.
5. Bo hieu ung icon `+1 xu` tai vi tri dap muoi.
6. Hieu ung vu khi dap trung la lop uu tien tai diem cham.
7. Neu can hien phan thuong xu khi combo, hien bang text nho trong cung dong combo, vi du `Combo x2  +2 xu`, dat lech len tren diem hit.
8. Giam thoi gian ton tai cua hieu ung dap trung de no bien mat nhanh va muot hon, tranh de effect cu che hit moi.

Thu tu lop hieu ung de xuat:

| Lop | Vi tri | Muc dich |
| --- | --- | --- |
| Vu khi/impact | Tai diem hit | Phan hoi chinh cho hanh dong dap trung |
| Combo va xu combo | Lech len tren diem hit | Bao nguoi choi dang duoc nhan thuong theo combo |
| HUD diem/xu | Thanh thong tin | Nguon so lieu chinh, luon chinh xac |

Thoi luong de xuat:

- Hieu ung vu khi/impact: khoang `0.18s - 0.25s`.
- Text combo: khoang `0.5s - 0.6s`, troi len nhe.
- Khong con vong doi rieng cho icon `+1 xu` tai diem hit.

## 4. Tac dong toi kien truc

### `index.html`

- Them man/modal nhap nickname dau tien.
- Them nut "Thiet lap" o menu chinh.
- Them man/modal thiet lap gom nickname hien tai, toggle am thanh va tao lai nickname.
- Co the bo form nickname khoi man ket qua, hoac bien thanh thong tin chi doc "Dang choi voi ten ...".

### `src/styles.css`

- Them layout responsive cho man nhap nickname va thiet lap.
- Dam bao nut xac nhan xoa du lieu khong qua gan nut huy tren mobile.
- Thong bao xoa du lieu can de doc, ngan, khong che cac nut chinh.

### `src/storage.js`

- Them helper xoa du lieu tai khoan local, vi du `resetLocalAccountData`.
- Helper nay nen chi xoa cac key cua KaBao, khong dung `localStorage.clear()`.
- Can quy dinh ro co giu `kabao.soundMuted` hay khong.
- Neu co daily missions, can them key vao danh sach reset.

### `src/main.js`

- Chuyen luong bat dau app sang kiem tra nickname truoc khi cho Play.
- Dung nickname da luu lam nguon duy nhat khi gui leaderboard.
- Dong bo nut am thanh trong thiet lap voi cac nut am thanh hien co neu van giu.
- Xu ly tao lai nickname: xac nhan, reset local data, tai lai state UI, hien man nhap nickname.
- Sau reset, cac bien runtime nhu stats, inventory, room, pending cloud save can ve trang thai mac dinh.
- Bo effect `coin` tai diem hit de hieu ung vu khi khong bi che.
- Rut ngan life cua effect `hit` va dat text combo/xu lech len tren diem hit.

### `src/gameCore.js`

- Doi rule tinh `matchCoins`: moi hit cong so xu bang `comboCount` cua hit do thay vi luon cong 1.
- Giu `score` la so muoi dap trung, khong nhan theo combo.

### `src/firebaseScores.js`

- Co the tai su dung validate nickname hien tai.
- Khong can doi schema leaderboard neu tiep tuc luu nickname trong payload hien co.
- Can tranh gui ket qua neu nickname bi thieu hoac khong hop le.

### `tests/gameCore.test.mjs`

- Them test cho helper reset local account data.
- Them test nickname validate va normalize tiep tuc hoat dong.
- Them test build leaderboard payload khong tao payload khi nickname khong hop le.
- Them test rule combo: hit nhanh lan 2 tao combo x2 va tong xu sau 2 hit la 3.
- Them test source UI khong con tao/draw effect `coin` tai diem hit va effect `hit` co life ngan.

## 5. Du lieu

### LocalStorage sau V1.2

| Key | Vai tro | Reset khi tao lai nickname |
| --- | --- | --- |
| `kabao.nickname` | Nickname hien tai tren may | Co |
| `kabao.totalCoins` | Tong xu local | Co |
| `kabao.topRuns` | Top luot choi local | Co |
| `kabao.playedMatches` | So tran da choi | Co |
| `kabao.inventory` | Vat pham da so huu | Co |
| `kabao.equippedItem` | Vat pham dang trang bi | Co |
| `kabao.tutorialSeen` | Da xem huong dan | Co |
| `kabao.lastRoomCode` | Phong gan nhat | Co |
| `kabao.soundMuted` | Tuy chon am thanh thiet bi | De xuat giu lai |

### Firebase

Schema Firebase hien tai co the giu nguyen:

- `players/{uid}/profile.nickname`
- `players/{uid}/runs`
- `leaderboard`
- `rooms/{roomCode}/members/{uid}.nickname`
- `rooms/{roomCode}/leaderboard/{uid}.nickname`

Luu y: Firebase anonymous auth co the van giu cung `uid` sau khi xoa localStorage tuy vao cach Firebase luu session. Neu can "tai khoan online moi" dung nghia, V1.2 can bo sung thao tac sign out/delete anonymous user. Pham vi yeu cau hien tai chi noi xoa du lieu luu tam tren may, nen co the chua can xoa anonymous user.

## 6. Rui ro va luu y

- Xoa du lieu la hanh dong khong hoan tac, can xac nhan ro.
- Neu chi xoa localStorage ma Firebase van giu `uid`, profile online co the bi cap nhat nickname moi tren cung anonymous user.
- Neu xoa ca `kabao.soundMuted`, nguoi choi da tat am co the bat ngo nghe am thanh sau khi tao nickname moi.
- Neu cho vao gameplay khi nickname chua hop le, leaderboard se thieu ten hoac khong luu duoc ket qua.
- Neu form nickname van nam o result, nguoi choi co the hieu nham la co the doi ten ma khong mat du lieu.

## 7. Tieu chi nghiem thu

| Ma | Muc | Ky vong |
| --- | --- | --- |
| V12-NN-001 | Mo game lan dau | Neu chua co `kabao.nickname`, game hien man nhap nickname truoc khi cho Play. |
| V12-NN-002 | Luu nickname | Nhap nickname hop le thi luu vao localStorage va reload van giu ten. |
| V12-NN-003 | Validate nickname | Nickname rong, qua ngan, qua dai, ky tu khong hop le hoac tu cam bi chan. |
| V12-NN-004 | Leaderboard | Ket qua gui Firebase co nickname da luu. |
| V12-NN-005 | Room | Tao/vao phong dung nickname da luu, khong yeu cau nhap lai o result. |
| V12-ST-001 | Nut thiet lap | Menu co nut Thiet lap rieng, mo duoc man thiet lap. |
| V12-ST-002 | Am thanh | Bat/tat am thanh trong thiet lap cap nhat `kabao.soundMuted` va dong bo UI. |
| V12-ST-003 | Tao lai nickname | Bam tao lai nickname hien xac nhan truoc khi xoa du lieu. |
| V12-ST-004 | Huy reset | Bam huy giu nguyen nickname, xu, top runs, inventory va setting. |
| V12-ST-005 | Dong y reset | Bam dong y xoa du lieu tai khoan local va quay ve man nhap nickname. |
| V12-ST-006 | Sau reset | Nickname moi bat dau voi xu, top runs, so tran, inventory va phong gan nhat ve mac dinh. |
| V12-ST-007 | Pham vi xoa | Chi xoa cac key KaBao, khong anh huong du lieu localStorage khac cua domain neu co. |
| V12-HIT-001 | Xu theo combo | Hai hit lien tiep trong cua so combo lan luot cong 1 xu va 2 xu, tong 3 xu. |
| V12-HIT-002 | Diem khong nhan combo | Score van tang theo so muoi dap trung, khong tang theo combo. |
| V12-HIT-003 | Bo icon xu | Khi dap trung khong con hien icon `+1 xu` tai diem hit. |
| V12-HIT-004 | Hieu ung vu khi | Effect vu khi/impact tai diem hit khong bi text combo hay icon xu che. |
| V12-HIT-005 | Thoi gian effect | Effect dap trung bien mat nhanh hon, khoang `0.18s - 0.25s`. |
| V12-HIT-006 | Combo text | Khi combo tu x2 tro len, text combo hien them so xu nhan duoc va lech len tren diem hit. |

## 8. De xuat thu tu trien khai

1. Them helper reset du lieu tai khoan local trong `src/storage.js`.
2. Them man nhap nickname dau tien va chan Play khi chua co nickname.
3. Chuyen man result sang hien nickname da luu, khong con la noi tao nickname chinh.
4. Them nut va man Thiet lap.
5. Dua toggle am thanh vao Thiet lap, dong bo voi cac nut am thanh hien co.
6. Them luong tao lai nickname kem xac nhan va reset state.
7. Doi rule tinh xu theo combo trong `src/gameCore.js`.
8. Bo effect icon xu tai diem hit, rut ngan effect vu khi va dat combo text lech len tren trong `src/main.js`.
9. Cap nhat test storage, nickname, leaderboard payload, combo/xu va cac kich ban UI.

## 9. Ket luan

V1.2 nen coi nickname la ho so local bat buoc cua nguoi choi. Thay doi nay giup leaderboard va phong ban be co du lieu ten on dinh hon, dong thoi lam trai nghiem vao game ro rang hon: tao ten mot lan, choi nhieu lan.

Nut Thiet lap rieng giup menu gon hon va tao cho nguoi choi mot noi de quan ly am thanh va nickname. Khi doi nickname, game can reset du lieu local tai khoan de tranh nhap nhang thanh tich, xu, vat pham va lich su choi giua hai ten khac nhau.

Voi gameplay, V1.2 can uu tien do ro cua hanh dong dap trung: hieu ung vu khi phai nhin thay ngay, combo phai gan voi so xu nhan duoc, va UI khong nen chen them icon xu tai cung diem hit.
