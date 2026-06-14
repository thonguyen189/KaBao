import {
  accumulateSpawn,
  createInitialState,
  hitMosquito,
  updateMosquitoes,
  updateTimer
} from './gameCore.js';
import { loadAssets, playSound } from './assets.js';
import { loadStats, saveMatchResult } from './storage.js';

const elements = {
  menuScreen: document.querySelector('#menuScreen'),
  gameplayScreen: document.querySelector('#gameplayScreen'),
  resultScreen: document.querySelector('#resultScreen'),
  playButton: document.querySelector('#playButton'),
  replayButton: document.querySelector('#replayButton'),
  homeButton: document.querySelector('#homeButton'),
  scoreValue: document.querySelector('#scoreValue'),
  coinValue: document.querySelector('#coinValue'),
  timerValue: document.querySelector('#timerValue'),
  menuTotalCoins: document.querySelector('#menuTotalCoins'),
  menuTopRuns: document.querySelector('#menuTopRuns'),
  rankMessage: document.querySelector('#rankMessage'),
  resultScore: document.querySelector('#resultScore'),
  resultMosquitoes: document.querySelector('#resultMosquitoes'),
  resultCoins: document.querySelector('#resultCoins'),
  resultTotalCoins: document.querySelector('#resultTotalCoins'),
  canvas: document.querySelector('#gameCanvas')
};

const context = elements.canvas.getContext('2d');
const effects = [];
let assets = { images: {}, sounds: {} };
let state = null;
let lastFrame = 0;
let savedResult = false;
let buzzLoop = null;

boot();

async function boot() {
  renderMenu();
  assets = await loadAssets().catch(() => ({ images: {}, sounds: {} }));
  elements.playButton.addEventListener('click', startGame);
  elements.replayButton.addEventListener('click', startGame);
  elements.homeButton.addEventListener('click', showMenu);
  elements.canvas.addEventListener('pointerdown', handleCanvasTap);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
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
  renderMenu();
  showScreen(elements.menuScreen);
}

function startGame() {
  state = createInitialState();
  effects.length = 0;
  savedResult = false;
  showScreen(elements.gameplayScreen);
  resizeCanvas();
  updateHud();
  playSound(assets.sounds.gameStart, { volume: 0.28 });
  startBuzz();
}

function finishGame() {
  if (!state || savedResult) {
    return;
  }

  savedResult = true;
  stopBuzz();
  playSound(assets.sounds.gameOver, { volume: 0.34 });
  const stats = saveMatchResult({
    score: state.score,
    coins: state.matchCoins
  });

  elements.resultScore.textContent = state.score;
  elements.resultMosquitoes.textContent = state.score;
  elements.resultCoins.textContent = state.matchCoins;
  elements.resultTotalCoins.textContent = stats.totalCoins;
  elements.rankMessage.textContent = stats.latestRank
    ? `Vào top 10! Hạng ${stats.latestRank}`
    : 'Cố thêm chút nữa để vào top 10 nhé!';
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
  const hit = hitMosquito(state, x, y);

  if (!hit) {
    return;
  }

  effects.push({ type: 'hit', x: hit.x, y: hit.y, age: 0, life: 0.55 });
  effects.push({ type: 'coin', x: hit.x, y: hit.y - 8, age: 0, life: 0.75 });
  playSound(assets.sounds.slapHit, { volume: 0.4 });
  playSound(assets.sounds.coinCollect, { volume: 0.24 });
  updateHud();
}

function updateEffects(deltaSeconds) {
  for (const effect of effects) {
    effect.age += deltaSeconds;
    if (effect.type === 'coin') {
      effect.y -= 38 * deltaSeconds;
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
  const size = mosquito.radius * 2.15;

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
  if (!source) {
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
