import {
  accumulateSpawn,
  calculateDiceBonus,
  createInitialState,
  hitMosquito,
  updateMosquitoes,
  updateTimer
} from './gameCore.js';
import { GAME_SETTINGS } from './settings.js';
import { loadAssets, playSound } from './assets.js';
import {
  loadGlobalLeaderboard,
  savePlayerInfo,
  savePlayerProfile,
  validateNickname
} from './firebaseScores.js';
import {
  awardBonusCoins,
  loadNickname,
  loadSoundMuted,
  loadStats,
  saveNickname,
  saveMatchResult,
  saveSoundMuted
} from './storage.js';

const elements = {
  menuScreen: document.querySelector('#menuScreen'),
  gameplayScreen: document.querySelector('#gameplayScreen'),
  resultScreen: document.querySelector('#resultScreen'),
  playButton: document.querySelector('#playButton'),
  replayButton: document.querySelector('#replayButton'),
  homeButton: document.querySelector('#homeButton'),
  menuSoundButton: document.querySelector('#menuSoundButton'),
  gameSoundButton: document.querySelector('#gameSoundButton'),
  resultSoundButton: document.querySelector('#resultSoundButton'),
  scoreValue: document.querySelector('#scoreValue'),
  coinValue: document.querySelector('#coinValue'),
  timerValue: document.querySelector('#timerValue'),
  menuTotalCoins: document.querySelector('#menuTotalCoins'),
  menuTopRuns: document.querySelector('#menuTopRuns'),
  globalTopRuns: document.querySelector('#globalTopRuns'),
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
  canvas: document.querySelector('#gameCanvas')
};

const context = elements.canvas.getContext('2d');
const effects = [];
let assets = { images: {}, sounds: {} };
let state = null;
let lastFrame = 0;
let savedResult = false;
let buzzLoop = null;
let soundMuted = loadSoundMuted();
let diceRolled = false;
let latestResultStats = null;
let pendingCloudSave = null;

boot();

async function boot() {
  renderMenu();
  assets = await loadAssets().catch(() => ({ images: {}, sounds: {} }));
  elements.playButton.addEventListener('click', startGame);
  elements.replayButton.addEventListener('click', startGame);
  elements.homeButton.addEventListener('click', showMenu);
  for (const button of soundButtons()) {
    button.addEventListener('click', toggleSound);
  }
  elements.diceButton.addEventListener('click', rollResultDice);
  elements.nicknameForm.addEventListener('submit', handleNicknameSubmit);
  elements.canvas.addEventListener('pointerdown', handleCanvasTap);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  updateSoundButtons();
  requestAnimationFrame(gameLoop);
}

function showScreen(screen) {
  for (const element of [elements.menuScreen, elements.gameplayScreen, elements.resultScreen]) {
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
    stats
  };

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

  effects.push({ type: 'hit', x: hit.x, y: hit.y, age: 0, life: 0.55 });
  effects.push({ type: 'coin', x: hit.x, y: hit.y - 8, age: 0, life: 0.75 });
  if (hit.comboCount >= GAME_SETTINGS.combo.minDisplayCount) {
    effects.push({
      type: 'combo',
      text: `Combo x${hit.comboCount}`,
      x: hit.x,
      y: hit.y - 34,
      age: 0,
      life: 0.72
    });
  }
  playGameSound(assets.sounds.slapHit, { volume: 0.4 });
  playGameSound(assets.sounds.coinCollect, { volume: 0.24 });
  updateHud();
}

function updateEffects(deltaSeconds) {
  for (const effect of effects) {
    effect.age += deltaSeconds;
    if (effect.type === 'coin') {
      effect.y -= 38 * deltaSeconds;
    }
    if (effect.type === 'combo') {
      effect.y -= 24 * deltaSeconds;
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
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#bff0ff');
  sky.addColorStop(0.62, '#e9f7b8');
  sky.addColorStop(1, '#ffd074');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'rgba(78, 179, 107, 0.28)';
  for (let x = -40; x < width + 80; x += 82) {
    context.beginPath();
    context.ellipse(x, height + 10, 64, 120, -0.35, Math.PI, Math.PI * 2);
    context.fill();
  }
}

function drawMosquito(mosquito) {
  const image = mosquito.status === 'hit'
    ? assets.images.mosquitoSquashed
    : assets.images.mosquitoFlying;
  const size = mosquito.radius * GAME_SETTINGS.mosquitoVisualScale;

  context.save();
  context.translate(mosquito.x, mosquito.y);
  context.rotate(mosquito.status === 'hit' ? 0.35 : Math.sin(mosquito.rotation) * 0.18);

  if (image) {
    context.drawImage(image, -size / 2, -size / 2, size, size);
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
    const burst = assets.images.hitBurst;
    const slipper = assets.images.slipperHit;
    const size = 84 + progress * 22;
    if (burst) {
      context.drawImage(burst, effect.x - size / 2, effect.y - size / 2, size, size);
    }
    if (slipper) {
      context.translate(effect.x + 12, effect.y - 10);
      context.rotate(-0.45);
      context.drawImage(slipper, -42, -42, 84, 84);
    }
  }

  if (effect.type === 'coin') {
    const popup = assets.images.plusOneCoin;
    if (popup) {
      context.drawImage(popup, effect.x - 34, effect.y - 34, 68, 68);
    } else {
      context.fillStyle = '#d89100';
      context.font = '900 28px sans-serif';
      context.fillText('+1 xu', effect.x - 34, effect.y);
    }
  }

  if (effect.type === 'miss') {
    const radius = 12 + progress * 34;
    context.strokeStyle = 'rgba(38, 33, 28, 0.62)';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = 'rgba(255, 255, 255, 0.74)';
    context.beginPath();
    context.arc(effect.x, effect.y, 4 + progress * 4, 0, Math.PI * 2);
    context.fill();
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
  elements.menuTotalCoins.textContent = stats.totalCoins;
  elements.menuTopRuns.innerHTML = '';
  elements.globalTopRuns.innerHTML = '';

  if (!stats.topRuns.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Chưa có lượt chơi nào';
    elements.menuTopRuns.append(empty);
  } else {
    for (const run of stats.topRuns) {
      const item = document.createElement('li');
      item.textContent = `${run.score} điểm - ${run.coins} xu`;
      elements.menuTopRuns.append(item);
    }
  }

  renderGlobalLeaderboard();
}

function renderGlobalLeaderboard() {
  const loading = document.createElement('li');
  loading.textContent = 'Đang tải bảng xếp hạng...';
  elements.globalTopRuns.replaceChildren(loading);

  void loadGlobalLeaderboard({ limit: 10 }).then((rows) => {
    elements.globalTopRuns.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('li');
      empty.textContent = 'Chưa có hạng nào';
      elements.globalTopRuns.append(empty);
      return;
    }

    for (const row of rows) {
      const item = document.createElement('li');
      item.textContent = `#${row.rank} ${row.nickname} - ${row.score} điểm, ${row.coins} xu`;
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

  void savePlayerInfo(save.result, save.stats, { nickname }).then(() => {
    renderGlobalLeaderboard();
  }).catch((error) => {
    pendingCloudSave = save;
    console.warn('Không thể lưu thông tin lên Firebase.', error);
  });
}
function buildRankMessage(stats) {
  if (stats.isNewRecord && stats.latestRank) {
    return `Kỷ lục mới! Vào top 10 hạng ${stats.latestRank}.`;
  }
  if (stats.isNewRecord) {
    return 'Kỷ lục mới!';
  }
  if (stats.latestRank) {
    return `Vào top 10! Hạng ${stats.latestRank}.`;
  }
  return 'Cố thêm chút nữa để vào top 10 nhé!';
}

function renderResultBadges(stats) {
  elements.resultBadges.innerHTML = '';
  const badges = [];
  if (stats.isNewRecord) {
    badges.push('Kỷ lục mới');
  }
  if (stats.latestRank) {
    badges.push(`Vào top 10 #${stats.latestRank}`);
  }
  badges.push(`${stats.playedMatches} trận đã chơi`);

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
      ? (soundMuted ? '🔇' : '🔊')
      : (soundMuted ? '🔇 Tắt âm' : '🔊 Âm thanh');
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
