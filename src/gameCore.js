export const GAME_CONFIG = {
  durationSeconds: 120,
  spawnPerSecond: 2,
  maxMosquitoes: 20,
  mosquitoRadius: 30,
  minSpeed: 38,
  maxSpeed: 92,
  safePadding: 32
};

let nextMosquitoId = 1;

export function createInitialState(options = {}) {
  return {
    phase: 'playing',
    durationSeconds: options.durationSeconds ?? GAME_CONFIG.durationSeconds,
    remainingSeconds: options.durationSeconds ?? GAME_CONFIG.durationSeconds,
    score: 0,
    matchCoins: 0,
    mosquitoes: [],
    elapsedSeconds: 0,
    spawnCarry: 0
  };
}

export function spawnMosquitoes(state, options) {
  const random = options.random ?? Math.random;
  const count = Math.min(options.count, GAME_CONFIG.maxMosquitoes - state.mosquitoes.length);
  const created = [];

  for (let index = 0; index < count; index += 1) {
    const radius = options.radius ?? GAME_CONFIG.mosquitoRadius;
    const safePadding = Math.max(radius + 2, GAME_CONFIG.safePadding);
    const x = safePadding + random() * Math.max(1, options.playWidth - safePadding * 2);
    const y = safePadding + random() * Math.max(1, options.playHeight - safePadding * 2);
    const angle = random() * Math.PI * 2;
    const speed = GAME_CONFIG.minSpeed + random() * (GAME_CONFIG.maxSpeed - GAME_CONFIG.minSpeed);
    const mosquito = {
      id: `m${nextMosquitoId}`,
      x,
      y,
      radius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      status: 'flying',
      age: 0,
      rotation: random() * Math.PI * 2,
      wobble: 0.8 + random() * 1.4
    };

    nextMosquitoId += 1;
    state.mosquitoes.push(mosquito);
    created.push(mosquito);
  }

  return created;
}

export function hitMosquito(state, x, y) {
  const mosquito = state.mosquitoes.find((candidate) => {
    if (candidate.status !== 'flying') {
      return false;
    }
    const dx = candidate.x - x;
    const dy = candidate.y - y;
    return Math.hypot(dx, dy) <= candidate.radius;
  });

  if (!mosquito) {
    return null;
  }

  mosquito.status = 'hit';
  mosquito.vx = 0;
  mosquito.vy = 160;
  mosquito.hitAge = 0;
  state.score += 1;
  state.matchCoins += 1;
  return mosquito;
}

export function updateTimer(state, deltaSeconds) {
  if (state.phase !== 'playing') {
    return state.remainingSeconds;
  }

  state.elapsedSeconds += deltaSeconds;
  state.remainingSeconds = Math.max(0, state.remainingSeconds - deltaSeconds);

  if (state.remainingSeconds <= 0) {
    state.phase = 'result';
  }

  return state.remainingSeconds;
}

export function updateMosquitoes(state, deltaSeconds, bounds, random = Math.random) {
  for (const mosquito of state.mosquitoes) {
    mosquito.age += deltaSeconds;
    mosquito.rotation += deltaSeconds * mosquito.wobble;

    if (mosquito.status === 'hit') {
      mosquito.hitAge = (mosquito.hitAge ?? 0) + deltaSeconds;
      mosquito.y += mosquito.vy * deltaSeconds;
      mosquito.vy += 420 * deltaSeconds;
      continue;
    }

    const difficulty = 1 + Math.min(0.45, state.elapsedSeconds / 240);
    mosquito.x += mosquito.vx * deltaSeconds * difficulty;
    mosquito.y += mosquito.vy * deltaSeconds * difficulty;

    if (random() < deltaSeconds * 0.55) {
      const turn = (random() - 0.5) * 1.15;
      const speed = Math.hypot(mosquito.vx, mosquito.vy);
      const angle = Math.atan2(mosquito.vy, mosquito.vx) + turn;
      mosquito.vx = Math.cos(angle) * speed;
      mosquito.vy = Math.sin(angle) * speed;
    }

    if (mosquito.x < mosquito.radius || mosquito.x > bounds.width - mosquito.radius) {
      mosquito.vx *= -1;
      mosquito.x = clamp(mosquito.x, mosquito.radius, bounds.width - mosquito.radius);
    }

    if (mosquito.y < mosquito.radius || mosquito.y > bounds.height - mosquito.radius) {
      mosquito.vy *= -1;
      mosquito.y = clamp(mosquito.y, mosquito.radius, bounds.height - mosquito.radius);
    }
  }

  state.mosquitoes = state.mosquitoes.filter((mosquito) => {
    if (mosquito.status === 'hit') {
      return mosquito.y < bounds.height + 90 && (mosquito.hitAge ?? 0) < 1.2;
    }
    return true;
  });
}

export function accumulateSpawn(state, deltaSeconds, bounds, random = Math.random) {
  if (state.phase !== 'playing') {
    return [];
  }

  state.spawnCarry += deltaSeconds * GAME_CONFIG.spawnPerSecond;
  const count = Math.min(2, Math.floor(state.spawnCarry));
  if (count <= 0) {
    return [];
  }

  state.spawnCarry -= count;
  return spawnMosquitoes(state, {
    count,
    playWidth: bounds.width,
    playHeight: bounds.height,
    random
  });
}

export function insertTopRun(existingRuns, run) {
  const runs = [...existingRuns, run]
    .sort((a, b) => b.score - a.score || new Date(a.playedAt) - new Date(b.playedAt))
    .slice(0, 10);
  const rankIndex = runs.findIndex((candidate) => candidate === run);

  return {
    runs,
    rank: rankIndex === -1 ? null : rankIndex + 1
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
