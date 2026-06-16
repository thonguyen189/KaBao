import {
  accumulateSpawn,
  calculateDiceBonus,
  createInitialState,
  getMosquitoFrameKey,
  hitMosquito,
  updateMosquitoes,
  updateTimer
} from './gameCore.js';
import { GAME_SETTINGS } from './settings.js';
import { loadAssets, playSound } from './assets.js';
import { getItem, SHOP_ITEM_IDS } from './items.js';
import {
  DAILY_MISSIONS,
  DAILY_MISSION_IDS,
  applyMissionProgress,
  claimMissionReward,
  createMissionState,
  getClaimableMissionIds
} from './missions.js';
import {
  createOrJoinRoom,
  generateRoomCode,
  getServerDateInfo,
  loadDailyMissionState,
  loadGlobalLeaderboard,
  loadRoomLeaderboard,
  saveDailyMissionState,
  savePlayerInfo,
  savePlayerProfile,
  saveRoomResult,
  validateNickname,
  validateRoomCode
} from './firebaseScores.js';
import {
  awardBonusCoins,
  loadEquippedItem,
  loadInventory,
  loadLastRoomCode,
  loadNickname,
  loadSoundMuted,
  loadStats,
  loadTutorialSeen,
  purchaseItem,
  saveEquippedItem,
  saveLastRoomCode,
  saveNickname,
  saveMatchResult,
  saveSoundMuted,
  saveTutorialSeen
} from './storage.js';

const elements = {
  screens: Array.from(document.querySelectorAll('.screen')),
  menuScreen: document.querySelector('#menuScreen'),
  shopScreen: document.querySelector('#shopScreen'),
  inventoryScreen: document.querySelector('#inventoryScreen'),
  missionsScreen: document.querySelector('#missionsScreen'),
  friendsScreen: document.querySelector('#friendsScreen'),
  tutorialScreen: document.querySelector('#tutorialScreen'),
  gameplayScreen: document.querySelector('#gameplayScreen'),
  resultScreen: document.querySelector('#resultScreen'),
  playButton: document.querySelector('#playButton'),
  replayButton: document.querySelector('#replayButton'),
  homeButton: document.querySelector('#homeButton'),
  shopButton: document.querySelector('#shopButton'),
  inventoryButton: document.querySelector('#inventoryButton'),
  missionsButton: document.querySelector('#missionsButton'),
  friendsButton: document.querySelector('#friendsButton'),
  tutorialButton: document.querySelector('#tutorialButton'),
  missionNotify: document.querySelector('#missionNotify'),
  menuSoundButton: document.querySelector('#menuSoundButton'),
  gameSoundButton: document.querySelector('#gameSoundButton'),
  resultSoundButton: document.querySelector('#resultSoundButton'),
  scoreValue: document.querySelector('#scoreValue'),
  coinValue: document.querySelector('#coinValue'),
  timerValue: document.querySelector('#timerValue'),
  menuTotalCoins: document.querySelector('#menuTotalCoins'),
  menuEquippedItem: document.querySelector('#menuEquippedItem'),
  menuTopRuns: document.querySelector('#menuTopRuns'),
  globalTopRuns: document.querySelector('#globalTopRuns'),
  shopItems: document.querySelector('#shopItems'),
  shopMessage: document.querySelector('#shopMessage'),
  inventoryItems: document.querySelector('#inventoryItems'),
  inventoryMessage: document.querySelector('#inventoryMessage'),
  missionsMessage: document.querySelector('#missionsMessage'),
  missionList: document.querySelector('#missionList'),
  roomForm: document.querySelector('#roomForm'),
  roomCodeInput: document.querySelector('#roomCodeInput'),
  createRoomButton: document.querySelector('#createRoomButton'),
  roomMessage: document.querySelector('#roomMessage'),
  roomTitle: document.querySelector('#roomTitle'),
  roomLeaderboard: document.querySelector('#roomLeaderboard'),
  tutorialImage: document.querySelector('#tutorialImage'),
  tutorialStep: document.querySelector('#tutorialStep'),
  tutorialTitle: document.querySelector('#tutorialTitle'),
  tutorialCopy: document.querySelector('#tutorialCopy'),
  tutorialNextButton: document.querySelector('#tutorialNextButton'),
  tutorialSkipButton: document.querySelector('#tutorialSkipButton'),
  rankMessage: document.querySelector('#rankMessage'),
  resultBadges: document.querySelector('#resultBadges'),
  nicknameForm: document.querySelector('#nicknameForm'),
  nicknameInput: document.querySelector('#nicknameInput'),
  nicknameError: document.querySelector('#nicknameError'),
  resultScore: document.querySelector('#resultScore'),
  resultMosquitoes: document.querySelector('#resultMosquitoes'),
  resultCoins: document.querySelector('#resultCoins'),
  resultTotalCoins: document.querySelector('#resultTotalCoins'),
  resultPlayedMatches: document.querySelector('#resultPlayedMatches'),
  resultBestCombo: document.querySelector('#resultBestCombo'),
  diceButton: document.querySelector('#diceButton'),
  diceMessage: document.querySelector('#diceMessage'),
  diceBonusValue: document.querySelector('#diceBonusValue'),
  roomResultPanel: document.querySelector('#roomResultPanel'),
  resultRoomTitle: document.querySelector('#resultRoomTitle'),
  resultRoomLeaderboard: document.querySelector('#resultRoomLeaderboard'),
  canvas: document.querySelector('#gameCanvas')
};

const context = elements.canvas.getContext('2d');
const effects = [];
const tutorialSteps = [
  {
    image: 'kabaoPointing',
    title: 'Chạm vào muỗi',
    copy: 'Chạm thật nhanh vào muỗi đang bay để ghi điểm và nhận xu.'
  },
  {
    image: 'kabaoHero',
    title: 'Đập liên tiếp',
    copy: 'Đập nhiều muỗi thật nhanh để tạo combo vui mắt.'
  },
  {
    image: 'kabaoHoldingCoin',
    title: 'Tung xúc xắc',
    copy: 'Hết giờ, tung xúc xắc một lần để nhận thêm xu thưởng.'
  }
];

let assets = { images: {}, sounds: {} };
let state = null;
let lastFrame = 0;
let savedResult = false;
let buzzLoop = null;
let soundMuted = loadSoundMuted();
let diceRolled = false;
let latestResultStats = null;
let pendingCloudSave = null;
let equippedItemId = loadEquippedItem();
let activeRoomCode = '';
let matchRoomCode = '';
let dailyMissionState = null;
let dailyOnline = false;
let tutorialIndex = 0;

boot();

async function boot() {
  bindEvents();
  renderMenu();
  renderShop();
  renderInventory();
  renderMissions();
  assets = await loadAssets().catch(() => ({ images: {}, sounds: {} }));
  updateSoundButtons();
  void initializeDailyMissions();
  resizeCanvas();
  requestAnimationFrame(gameLoop);

  if (!loadTutorialSeen()) {
    openTutorial();
  }
}

function bindEvents() {
  elements.playButton.addEventListener('click', startGame);
  elements.replayButton.addEventListener('click', startGame);
  elements.homeButton.addEventListener('click', showMenu);
  elements.shopButton.addEventListener('click', () => {
    renderShop();
    showScreen(elements.shopScreen);
  });
  elements.inventoryButton.addEventListener('click', () => {
    renderInventory();
    showScreen(elements.inventoryScreen);
  });
  elements.missionsButton.addEventListener('click', () => {
    renderMissions();
    showScreen(elements.missionsScreen);
  });
  elements.tutorialButton.addEventListener('click', openTutorial);
  elements.tutorialNextButton.addEventListener('click', nextTutorialStep);
  elements.tutorialSkipButton.addEventListener('click', closeTutorial);
  for (const button of document.querySelectorAll('[data-home]')) {
    button.addEventListener('click', showMenu);
  }
  for (const button of soundButtons()) {
    button.addEventListener('click', toggleSound);
  }
  elements.diceButton.addEventListener('click', rollResultDice);
  elements.nicknameForm.addEventListener('submit', handleNicknameSubmit);
  elements.canvas.addEventListener('pointerdown', handleCanvasTap);
  window.addEventListener('resize', resizeCanvas);
}

function showScreen(screen) {
  for (const element of elements.screens) {
    element.classList.toggle('is-active', element === screen);
  }
}

function showMenu() {
  stopBuzz();
  state = null;
  savedResult = false;
  diceRolled = false;
  latestResultStats = null;
  pendingCloudSave = null;
  renderMenu();
  showScreen(elements.menuScreen);
}

function startGame() {
  state = createInitialState();
  effects.length = 0;
  savedResult = false;
  diceRolled = false;
  latestResultStats = null;
  pendingCloudSave = null;
  matchRoomCode = activeRoomCode;
  activeRoomCode = '';
  equippedItemId = loadEquippedItem();
  showScreen(elements.gameplayScreen);
  resizeCanvas();
  updateHud();
  playGameSound(assets.sounds.gameStart, { volume: 0.28 });
  startBuzz();
}

function finishGame() {
  if (!state || savedResult) {
    return;
  }

  savedResult = true;
  stopBuzz();
  playGameSound(assets.sounds.gameOver, { volume: 0.34 });
  const playedAt = new Date().toISOString();
  const stats = saveMatchResult({
    score: state.score,
    coins: state.matchCoins,
    playedAt
  });
  pendingCloudSave = {
    result: {
      score: state.score,
      coins: state.matchCoins,
      bestCombo: state.combo.best,
      playedAt
    },
    stats,
    roomCode: matchRoomCode
  };

  void updateDailyProgress({
    play_one_match: 1,
    hit_20_mosquitoes: state.score
  });

  elements.resultScore.textContent = state.score;
  elements.resultMosquitoes.textContent = state.score;
  elements.resultCoins.textContent = state.matchCoins;
  latestResultStats = stats;
  elements.resultTotalCoins.textContent = stats.totalCoins;
  elements.resultPlayedMatches.textContent = stats.playedMatches;
  elements.resultBestCombo.textContent = state.combo.best;
  elements.rankMessage.textContent = buildRankMessage(stats);
  renderResultBadges(stats);
  renderNicknameForm();
  saveCloudResultWhenReady();
  resetDicePanel();
  renderResultRoom();
  showScreen(elements.resultScreen);
}

function gameLoop(timestamp) {
  const deltaSeconds = Math.min(0.05, (timestamp - lastFrame) / 1000 || 0);
  lastFrame = timestamp;

  if (state?.phase === 'playing') {
    updateTimer(state, deltaSeconds);
    accumulateSpawn(state, deltaSeconds, canvasBounds());
    updateMosquitoes(state, deltaSeconds, canvasBounds());
    updateEffects(deltaSeconds);
    updateHud();

    if (state.phase === 'result') {
      finishGame();
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function handleCanvasTap(event) {
  if (state?.phase !== 'playing') {
    return;
  }

  const rect = elements.canvas.getBoundingClientRect();
  const scaleX = elements.canvas.width / rect.width;
  const scaleY = elements.canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const hit = hitMosquito(state, x, y, { currentTimeSeconds: state.elapsedSeconds });

  if (!hit) {
    effects.push({
      type: 'miss',
      x,
      y,
      age: 0,
      life: GAME_SETTINGS.missFeedback.lifeSeconds
    });
    if (navigator.vibrate) {
      navigator.vibrate(GAME_SETTINGS.missFeedback.vibrateMs);
    }
    return;
  }

  effects.push({ type: 'hit', itemId: equippedItemId, x: hit.x, y: hit.y, age: 0, life: 0.24 });
  if (hit.comboCount >= GAME_SETTINGS.combo.minDisplayCount) {
    effects.push({
      type: 'combo',
      text: `Combo x${hit.comboCount}  +${hit.comboCount} xu`,
      x: hit.x,
      y: hit.y - 58,
      age: 0,
      life: 0.58
    });
  }
  playGameSound(assets.sounds.slapHit, { volume: 0.4 });
  playGameSound(assets.sounds.coinCollect, { volume: 0.24 });
  updateHud();
}

function updateEffects(deltaSeconds) {
  for (const effect of effects) {
    effect.age += deltaSeconds;
    if (effect.type === 'combo') {
      effect.y -= 30 * deltaSeconds;
    }
  }

  for (let index = effects.length - 1; index >= 0; index -= 1) {
    if (effects[index].age >= effects[index].life) {
      effects.splice(index, 1);
    }
  }
}

function resizeCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(320, Math.round(rect.width * dpr));
  const height = Math.max(420, Math.round(rect.height * dpr));
  elements.canvas.width = width;
  elements.canvas.height = height;
}

function draw() {
  const width = elements.canvas.width;
  const height = elements.canvas.height;
  context.clearRect(0, 0, width, height);
  drawBackground(width, height);

  if (!state) {
    return;
  }

  for (const mosquito of state.mosquitoes) {
    drawMosquito(mosquito);
  }

  for (const effect of effects) {
    drawEffect(effect);
  }
}

function drawBackground(width, height) {
  const background = assets.images.backgroundPattern;
  if (background) {
    context.globalAlpha = 0.28;
    context.drawImage(background, 0, 0, width, height);
    context.globalAlpha = 1;
  }

  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#bff0ff');
  sky.addColorStop(0.62, '#e9f7b8');
  sky.addColorStop(1, '#ffd074');
  context.globalCompositeOperation = 'destination-over';
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
}

function drawMosquito(mosquito) {
  const fallbackImage = mosquito.status === 'hit'
    ? assets.images.mosquitoSquashed
    : assets.images.mosquitoFlying;
  const image = assets.images[getMosquitoFrameKey(mosquito)] ?? fallbackImage;
  const size = mosquito.radius * GAME_SETTINGS.mosquitoVisualScale;

  context.save();
  context.translate(mosquito.x, mosquito.y);
  context.rotate(mosquito.status === 'hit' ? 0.18 : Math.sin(mosquito.rotation) * 0.18);

  if (image) {
    const aspect = image.naturalWidth && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : 1;
    const drawWidth = aspect >= 1 ? size : size * aspect;
    const drawHeight = aspect >= 1 ? size / aspect : size;
    context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  } else {
    context.fillStyle = '#27231f';
    context.beginPath();
    context.ellipse(0, 0, mosquito.radius, mosquito.radius * 0.72, 0, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawEffect(effect) {
  const progress = effect.age / effect.life;
  context.save();
  context.globalAlpha = Math.max(0, 1 - progress);

  if (effect.type === 'hit') {
    const item = getItem(effect.itemId);
    const burst = assets.images[item.frames.impact] ?? assets.images.hitBurst;
    const size = 92 + progress * 26;
    if (burst) {
      context.drawImage(burst, effect.x - size / 2, effect.y - size / 2, size, size);
    }
  }

  if (effect.type === 'miss') {
    const radius = 12 + progress * 34;
    context.strokeStyle = 'rgba(38, 33, 28, 0.62)';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    context.stroke();
  }

  if (effect.type === 'combo') {
    context.font = '900 30px "Trebuchet MS", Arial, sans-serif';
    context.textAlign = 'center';
    context.lineWidth = 6;
    context.strokeStyle = 'rgba(38, 33, 28, 0.8)';
    context.strokeText(effect.text, effect.x, effect.y);
    context.fillStyle = '#ffe76b';
    context.fillText(effect.text, effect.x, effect.y);
  }

  context.restore();
}

function updateHud() {
  if (!state) {
    return;
  }

  elements.scoreValue.textContent = state.score;
  elements.coinValue.textContent = state.matchCoins;
  elements.timerValue.textContent = formatTime(state.remainingSeconds);
}

function renderMenu() {
  const stats = loadStats();
  const item = getItem(loadEquippedItem());
  elements.menuTotalCoins.textContent = stats.totalCoins;
  elements.menuEquippedItem.textContent = item.shortName;
  renderLocalRuns(stats);
  renderGlobalLeaderboard();
  renderMissionNotify();
}

function renderLocalRuns(stats) {
  elements.menuTopRuns.innerHTML = '';
  if (!stats.topRuns.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Chưa có lượt chơi nào';
    elements.menuTopRuns.append(empty);
    return;
  }

  for (const run of stats.topRuns) {
    const item = document.createElement('li');
    item.textContent = `${run.score} điểm - ${run.coins} xu`;
    elements.menuTopRuns.append(item);
  }
}

function renderGlobalLeaderboard() {
  const loading = document.createElement('li');
  loading.textContent = 'Đang tải bảng xếp hạng...';
  elements.globalTopRuns.replaceChildren(loading);

  void loadGlobalLeaderboard({ limit: 5 }).then((rows) => {
    elements.globalTopRuns.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('li');
      empty.textContent = 'Chưa có hạng nào';
      elements.globalTopRuns.append(empty);
      return;
    }

    for (const row of rows) {
      const item = document.createElement('li');
      item.textContent = `#${row.rank} ${row.nickname} - ${row.score} điểm`;
      elements.globalTopRuns.append(item);
    }
  }).catch((error) => {
    elements.globalTopRuns.innerHTML = '';
    const item = document.createElement('li');
    item.textContent = 'Chưa tải được bảng xếp hạng';
    elements.globalTopRuns.append(item);
    console.warn('Không thể tải bảng xếp hạng Firebase.', error);
  });
}

function renderShop(message = '') {
  const inventory = loadInventory();
  const stats = loadStats();
  elements.shopMessage.textContent = message || `Bạn đang có ${stats.totalCoins} xu.`;
  elements.shopItems.replaceChildren(...SHOP_ITEM_IDS.map((itemId) => {
    const item = getItem(itemId);
    const owned = inventory.includes(itemId);
    const card = createItemCard(item, owned);
    const action = document.createElement('button');
    action.className = owned ? 'secondary-action' : 'primary-action';
    action.type = 'button';
    action.textContent = owned ? 'Đã có' : `Mua ${item.price} xu`;
    action.disabled = owned;
    action.addEventListener('click', () => {
      const result = purchaseItem(item.id);
      const nextMessage = result.ok
        ? `Đã mua ${item.shortName}.`
        : result.reason === 'coins'
          ? 'Bạn chưa đủ xu.'
          : 'Vật phẩm này đã có trong tủ đồ.';
      renderShop(nextMessage);
      renderInventory();
      renderMenu();
    });
    card.querySelector('.item-meta').append(action);
    return card;
  }));
}

function renderInventory(message = '') {
  const inventory = loadInventory();
  const equipped = loadEquippedItem();
  elements.inventoryMessage.textContent = message || 'Chọn một vật phẩm để dùng trong trận kế tiếp.';
  elements.inventoryItems.replaceChildren(...SHOP_ITEM_IDS
    .filter((itemId) => inventory.includes(itemId))
    .map((itemId) => {
      const item = getItem(itemId);
      const card = createItemCard(item, true, itemId === equipped);
      const action = document.createElement('button');
      action.className = itemId === equipped ? 'secondary-action' : 'primary-action';
      action.type = 'button';
      action.textContent = itemId === equipped ? 'Đang dùng' : 'Trang bị';
      action.disabled = itemId === equipped;
      action.addEventListener('click', () => {
        equippedItemId = saveEquippedItem(item.id);
        renderInventory(`Đã trang bị ${item.shortName}.`);
        renderMenu();
      });
      card.querySelector('.item-meta').append(action);
      return card;
    }));
}

function createItemCard(item, owned, equipped = false) {
  const card = document.createElement('article');
  card.className = 'item-card';
  const image = document.createElement('img');
  image.src = `assets/${assetPathForFrame(item.frames.idle)}`;
  image.alt = item.name;
  const body = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = item.name;
  const description = document.createElement('p');
  description.textContent = item.description;
  const meta = document.createElement('div');
  meta.className = 'item-meta';
  const price = document.createElement('span');
  price.className = 'price-pill';
  price.textContent = item.price ? `${item.price} xu` : 'Miễn phí';
  meta.append(price);
  if (owned) {
    const ownedLabel = document.createElement('span');
    ownedLabel.className = 'owned-pill';
    ownedLabel.textContent = equipped ? 'Đang dùng' : 'Đã sở hữu';
    meta.append(ownedLabel);
  }
  body.append(title, description, meta);
  card.append(image, body);
  return card;
}

function assetPathForFrame(frameKey) {
  const manifestPath = {
    weaponSlipperIdle: 'lip/Slipper weapons_Assets/asset_01.png',
    weaponNotebookIdle: 'lip/notebook weapon_Assets/asset_01.png',
    weaponSwatterIdle: 'lip/mosquito swatter weapon_Assets/asset_01.png',
    weaponPhoneIdle: 'lip/smartphone weapon_Assets/asset_01.png'
  };
  return manifestPath[frameKey] ?? 'images/slipper-hit.svg';
}

async function initializeDailyMissions() {
  try {
    const server = await getServerDateInfo();
    dailyMissionState = await loadDailyMissionState(server.date, createMissionState);
    dailyMissionState = applyMissionProgress(dailyMissionState, 'daily_login', 1);
    dailyMissionState = await saveDailyMissionState(dailyMissionState);
    dailyOnline = true;
    renderMissions();
    renderMissionNotify();
  } catch (error) {
    dailyOnline = false;
    elements.missionsMessage.textContent = 'Chưa tải được nhiệm vụ online. Bạn vẫn có thể chơi cá nhân.';
    console.warn('Không thể tải nhiệm vụ hằng ngày.', error);
  }
}

function renderMissions() {
  if (!dailyOnline || !dailyMissionState) {
    elements.missionsMessage.textContent = 'Nhiệm vụ dùng thời gian Firebase/server và cần kết nối mạng.';
    elements.missionList.innerHTML = '';
    return;
  }

  elements.missionsMessage.textContent = `Nhiệm vụ ngày ${dailyMissionState.date}.`;
  elements.missionList.replaceChildren(...DAILY_MISSION_IDS.map((missionId) => {
    const mission = DAILY_MISSIONS[missionId];
    const progress = dailyMissionState.progress[missionId] ?? 0;
    const claimed = dailyMissionState.claimed[missionId] === true;
    const complete = progress >= mission.target;
    const card = document.createElement('article');
    card.className = 'mission-card';
    const top = document.createElement('div');
    top.className = 'mission-top';
    const text = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = mission.title;
    const copy = document.createElement('p');
    copy.textContent = `Thưởng ${mission.reward} xu`;
    text.append(title, copy);
    const action = document.createElement('button');
    action.className = complete && !claimed ? 'primary-action' : 'secondary-action';
    action.type = 'button';
    action.textContent = claimed ? 'Đã nhận' : complete ? 'Nhận' : `${progress}/${mission.target}`;
    action.disabled = claimed || !complete;
    action.addEventListener('click', () => claimMission(missionId));
    top.append(text, action);
    const track = document.createElement('div');
    track.className = 'progress-track';
    const fill = document.createElement('span');
    fill.style.width = `${Math.min(100, (progress / mission.target) * 100)}%`;
    track.append(fill);
    card.append(top, track);
    return card;
  }));
}

async function updateDailyProgress(increments) {
  if (!dailyOnline || !dailyMissionState) {
    return;
  }

  let nextState = dailyMissionState;
  for (const [missionId, amount] of Object.entries(increments)) {
    nextState = applyMissionProgress(nextState, missionId, amount);
  }
  dailyMissionState = nextState;
  renderMissionNotify();
  renderMissions();

  try {
    dailyMissionState = await saveDailyMissionState(dailyMissionState);
    renderMissions();
  } catch (error) {
    dailyOnline = false;
    elements.missionsMessage.textContent = 'Không lưu được nhiệm vụ online.';
    console.warn('Không thể lưu nhiệm vụ hằng ngày.', error);
  }
}

async function claimMission(missionId) {
  const claimed = claimMissionReward(dailyMissionState, missionId);
  if (!claimed.ok) {
    return;
  }

  dailyMissionState = claimed.state;
  const stats = awardBonusCoins(claimed.reward);
  latestResultStats = latestResultStats ? { ...latestResultStats, totalCoins: stats.totalCoins } : latestResultStats;
  renderMenu();
  renderMissions();

  try {
    dailyMissionState = await saveDailyMissionState(dailyMissionState);
    renderMissions();
  } catch (error) {
    console.warn('Không thể lưu trạng thái nhận thưởng.', error);
  }
}

function renderMissionNotify() {
  const hasReward = dailyMissionState && getClaimableMissionIds(dailyMissionState).length > 0;
  elements.missionNotify.classList.toggle('is-hidden', !hasReward);
}

function renderFriends(message = '') {
  const savedCode = loadLastRoomCode();
  elements.roomCodeInput.value = savedCode;
  elements.roomMessage.textContent = message || (activeRoomCode
    ? `Phòng ${activeRoomCode} sẽ áp dụng cho trận kế tiếp.`
    : 'Tạo hoặc nhập mã phòng trước khi bấm Play.');
  renderRoomLeaderboard(savedCode);
}

async function createRoom() {
  const nickname = loadNickname();
  if (!nickname) {
    elements.roomMessage.textContent = 'Hãy lưu nickname ở màn kết quả trước khi tạo phòng.';
    return;
  }

  const code = generateRoomCode();
  await activateRoom(code, nickname);
}

async function joinRoom(event) {
  event.preventDefault();
  const nickname = loadNickname();
  if (!nickname) {
    elements.roomMessage.textContent = 'Hãy lưu nickname ở màn kết quả trước khi vào phòng.';
    return;
  }

  const validation = validateRoomCode(elements.roomCodeInput.value);
  if (!validation.ok) {
    elements.roomMessage.textContent = 'Mã phòng cần 5-6 chữ in hoa hoặc số.';
    return;
  }

  await activateRoom(validation.value, nickname);
}

async function activateRoom(code, nickname) {
  elements.roomMessage.textContent = 'Đang kết nối phòng...';
  try {
    const room = await createOrJoinRoom(code, { nickname });
    activeRoomCode = room.code;
    saveLastRoomCode(room.code);
    elements.roomCodeInput.value = room.code;
    elements.roomMessage.textContent = `Phòng ${room.code} đã sẵn sàng cho trận kế tiếp.`;
    renderRoomLeaderboard(room.code);
  } catch (error) {
    elements.roomMessage.textContent = 'Chưa kết nối được phòng. Hãy thử lại khi có mạng.';
    console.warn('Không thể tạo/vào phòng.', error);
  }
}

function renderRoomLeaderboard(roomCode) {
  const validation = validateRoomCode(roomCode);
  elements.roomTitle.textContent = validation.ok ? `Bảng phòng ${validation.value}` : 'Bảng phòng';
  elements.roomLeaderboard.innerHTML = '';
  if (!validation.ok) {
    const empty = document.createElement('li');
    empty.textContent = 'Chưa chọn phòng';
    elements.roomLeaderboard.append(empty);
    return;
  }

  const loading = document.createElement('li');
  loading.textContent = 'Đang tải phòng...';
  elements.roomLeaderboard.append(loading);
  void loadRoomLeaderboard(validation.value, { limit: 5 }).then((rows) => {
    renderRows(elements.roomLeaderboard, rows, 'Chưa có điểm trong phòng');
  }).catch((error) => {
    elements.roomLeaderboard.innerHTML = '';
    const item = document.createElement('li');
    item.textContent = 'Chưa tải được phòng';
    elements.roomLeaderboard.append(item);
    console.warn('Không thể tải leaderboard phòng.', error);
  });
}

function renderResultRoom() {
  elements.roomResultPanel.classList.toggle('is-hidden', !matchRoomCode);
  elements.resultRoomLeaderboard.innerHTML = '';
  if (!matchRoomCode) {
    return;
  }

  elements.resultRoomTitle.textContent = `Phòng ${matchRoomCode}`;
  const loading = document.createElement('li');
  loading.textContent = 'Đang cập nhật bảng phòng...';
  elements.resultRoomLeaderboard.append(loading);
}

function renderRows(list, rows, emptyText) {
  list.innerHTML = '';
  if (!rows.length) {
    const empty = document.createElement('li');
    empty.textContent = emptyText;
    list.append(empty);
    return;
  }
  for (const row of rows) {
    const item = document.createElement('li');
    item.textContent = `#${row.rank} ${row.nickname} - ${row.score} điểm`;
    list.append(item);
  }
}

function openTutorial() {
  tutorialIndex = 0;
  renderTutorial();
  showScreen(elements.tutorialScreen);
}

function renderTutorial() {
  const step = tutorialSteps[tutorialIndex];
  elements.tutorialImage.src = `assets/${assetPathForTutorial(step.image)}`;
  elements.tutorialStep.textContent = `Bước ${tutorialIndex + 1}/3`;
  elements.tutorialTitle.textContent = step.title;
  elements.tutorialCopy.textContent = step.copy;
  elements.tutorialNextButton.textContent = tutorialIndex === tutorialSteps.length - 1 ? 'Chơi ngay' : 'Tiếp';
}

function assetPathForTutorial(key) {
  const paths = {
    kabaoPointing: 'lip/Ka Báo Pose Sheet_Assets/asset_03.png',
    kabaoHero: 'lip/Ka Báo Pose Sheet_Assets/asset_01.png',
    kabaoHoldingCoin: 'lip/Ka Báo Pose Sheet_Assets/asset_05.png'
  };
  return paths[key];
}

function nextTutorialStep() {
  if (tutorialIndex < tutorialSteps.length - 1) {
    tutorialIndex += 1;
    renderTutorial();
    return;
  }
  closeTutorial();
  startGame();
}

function closeTutorial() {
  saveTutorialSeen(true);
  showMenu();
}

function renderNicknameForm() {
  const nickname = loadNickname();
  elements.nicknameInput.value = nickname;
  elements.nicknameError.textContent = '';
  elements.nicknameForm.classList.toggle('is-hidden', Boolean(nickname));
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const validation = validateNickname(elements.nicknameInput.value);

  if (!validation.ok) {
    elements.nicknameError.textContent = 'Tên này chưa phù hợp, hãy chọn tên vui vẻ hơn nhé.';
    return;
  }

  saveNickname(validation.value);
  elements.nicknameInput.value = validation.value;
  elements.nicknameError.textContent = '';
  elements.nicknameForm.classList.add('is-hidden');
  saveCloudResultWhenReady();
}

function saveCloudResultWhenReady() {
  const nickname = loadNickname();
  if (!pendingCloudSave || !nickname) {
    return;
  }

  const save = pendingCloudSave;
  pendingCloudSave = null;

  void savePlayerInfo(save.result, save.stats, { nickname }).then(async () => {
    renderGlobalLeaderboard();
    if (save.roomCode) {
      await saveRoomResult(save.roomCode, save.result, { nickname });
      const rows = await loadRoomLeaderboard(save.roomCode, { limit: 5 });
      renderRows(elements.resultRoomLeaderboard, rows, 'Chưa có điểm trong phòng');
    }
  }).catch((error) => {
    pendingCloudSave = save;
    console.warn('Không thể lưu thông tin lên Firebase.', error);
  });
}

function buildRankMessage(stats) {
  if (matchRoomCode) {
    return `Đã chơi trong phòng ${matchRoomCode}.`;
  }
  if (stats.isNewRecord && stats.latestRank) {
    return `Kỷ lục mới! Vào top 5 hạng ${stats.latestRank}.`;
  }
  if (stats.isNewRecord) {
    return 'Kỷ lục mới!';
  }
  if (stats.latestRank) {
    return `Vào top 5! Hạng ${stats.latestRank}.`;
  }
  return 'Cố thêm chút nữa để vào top 5 nhé!';
}

function renderResultBadges(stats) {
  elements.resultBadges.innerHTML = '';
  const badges = [];
  if (stats.isNewRecord) {
    badges.push('Kỷ lục mới');
  }
  if (stats.latestRank) {
    badges.push(`Vào top 5 #${stats.latestRank}`);
  }
  if (matchRoomCode) {
    badges.push(`Phòng ${matchRoomCode}`);
  }
  badges.push(`${getItem(equippedItemId).shortName}`);

  for (const label of badges) {
    const badge = document.createElement('span');
    badge.className = 'result-badge';
    badge.textContent = label;
    elements.resultBadges.append(badge);
  }
}

function resetDicePanel() {
  diceRolled = false;
  elements.diceButton.disabled = false;
  elements.diceButton.textContent = '🎲';
  elements.diceBonusValue.textContent = '0';
  elements.diceMessage.textContent = 'Tung một lần để nhận thêm xu thưởng.';
}

function rollResultDice() {
  if (!state || !latestResultStats || diceRolled) {
    return;
  }

  diceRolled = true;
  const minFace = GAME_SETTINGS.dice.minFace;
  const maxFace = GAME_SETTINGS.dice.maxFace;
  const face = minFace + Math.floor(Math.random() * (maxFace - minFace + 1));
  const bonus = calculateDiceBonus(state.matchCoins, face);
  const stats = awardBonusCoins(bonus);
  latestResultStats = stats;
  if (pendingCloudSave) {
    pendingCloudSave.stats = stats;
  } else {
    const nickname = loadNickname();
    if (nickname) {
      void savePlayerProfile(stats, { nickname }).catch((error) => {
        console.warn('Không thể cập nhật hồ sơ Firebase.', error);
      });
    }
  }

  void updateDailyProgress({ roll_dice: 1 });
  elements.diceButton.disabled = true;
  elements.diceButton.textContent = String(face);
  elements.diceBonusValue.textContent = bonus;
  elements.resultTotalCoins.textContent = stats.totalCoins;
  elements.diceMessage.textContent = `Ra mặt ${face}: thưởng thêm ${state.matchCoins} x ${face} = ${bonus} xu.`;
  playGameSound(assets.sounds.coinCollect, { volume: 0.32 });
}

function soundButtons() {
  return [
    elements.menuSoundButton,
    elements.gameSoundButton,
    elements.resultSoundButton
  ].filter(Boolean);
}

function toggleSound() {
  soundMuted = !soundMuted;
  saveSoundMuted(soundMuted);
  updateSoundButtons();

  if (soundMuted) {
    stopBuzz();
  } else if (state?.phase === 'playing') {
    startBuzz();
  }
}

function updateSoundButtons() {
  for (const button of soundButtons()) {
    button.setAttribute('aria-pressed', soundMuted ? 'true' : 'false');
    button.textContent = button === elements.gameSoundButton
      ? (soundMuted ? 'Tắt' : 'Âm')
      : (soundMuted ? 'Tắt âm' : 'Âm thanh');
  }
}

function playGameSound(audio, options = {}) {
  if (soundMuted) {
    return null;
  }
  return playSound(audio, options);
}

function formatTime(seconds) {
  const rounded = Math.ceil(seconds);
  const minutes = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function canvasBounds() {
  return {
    width: elements.canvas.width,
    height: elements.canvas.height
  };
}

function startBuzz() {
  stopBuzz();
  const source = assets.sounds.mosquitoLoop;
  if (!source || soundMuted) {
    return;
  }

  try {
    buzzLoop = source.cloneNode();
    buzzLoop.volume = 0.12;
    buzzLoop.loop = true;
    void buzzLoop.play();
  } catch {
    buzzLoop = null;
  }
}

function stopBuzz() {
  if (!buzzLoop) {
    return;
  }

  buzzLoop.pause();
  buzzLoop.currentTime = 0;
  buzzLoop = null;
}
