import { insertTopRun } from './gameCore.js';
import { DEFAULT_ITEM_ID, ITEM_CATALOG, isKnownItem } from './items.js';

const STORAGE_KEYS = {
  totalCoins: 'kabao.totalCoins',
  topRuns: 'kabao.topRuns',
  playedMatches: 'kabao.playedMatches',
  soundMuted: 'kabao.soundMuted',
  nickname: 'kabao.nickname',
  inventory: 'kabao.inventory',
  equippedItem: 'kabao.equippedItem',
  tutorialSeen: 'kabao.tutorialSeen',
  lastRoomCode: 'kabao.lastRoomCode'
};

export function loadStats(storage = window.localStorage) {
  return {
    totalCoins: readNumber(storage, STORAGE_KEYS.totalCoins),
    topRuns: readJson(storage, STORAGE_KEYS.topRuns, []),
    playedMatches: readNumber(storage, STORAGE_KEYS.playedMatches)
  };
}

export function saveMatchResult(result, storage = window.localStorage) {
  const stats = loadStats(storage);
  const previousBestScore = stats.topRuns[0]?.score ?? 0;
  const run = {
    score: result.score,
    coins: result.coins,
    playedAt: result.playedAt ?? new Date().toISOString()
  };
  const ranked = insertTopRun(stats.topRuns, run);
  const nextStats = {
    totalCoins: stats.totalCoins + result.coins,
    topRuns: ranked.runs,
    playedMatches: stats.playedMatches + 1,
    latestRank: ranked.rank,
    previousBestScore,
    isNewRecord: result.score > previousBestScore
  };

  storage.setItem(STORAGE_KEYS.totalCoins, String(nextStats.totalCoins));
  storage.setItem(STORAGE_KEYS.topRuns, JSON.stringify(nextStats.topRuns));
  storage.setItem(STORAGE_KEYS.playedMatches, String(nextStats.playedMatches));

  return nextStats;
}

export function awardBonusCoins(amount, storage = window.localStorage) {
  const stats = loadStats(storage);
  const bonus = Math.max(0, Math.floor(amount));
  const nextStats = {
    ...stats,
    totalCoins: stats.totalCoins + bonus
  };

  storage.setItem(STORAGE_KEYS.totalCoins, String(nextStats.totalCoins));
  return nextStats;
}

export function spendCoins(amount, storage = window.localStorage) {
  const stats = loadStats(storage);
  const cost = Math.max(0, Math.floor(amount));
  if (stats.totalCoins < cost) {
    return { ok: false, reason: 'coins', totalCoins: stats.totalCoins };
  }

  const totalCoins = stats.totalCoins - cost;
  storage.setItem(STORAGE_KEYS.totalCoins, String(totalCoins));
  return { ok: true, reason: null, totalCoins };
}

export function loadInventory(storage = window.localStorage) {
  const saved = readJson(storage, STORAGE_KEYS.inventory, []);
  const inventory = Array.isArray(saved)
    ? saved.filter((itemId, index, array) =>
        typeof itemId === 'string' && isKnownItem(itemId) && array.indexOf(itemId) === index
      )
    : [];

  return inventory.includes(DEFAULT_ITEM_ID)
    ? inventory
    : [DEFAULT_ITEM_ID, ...inventory];
}

export function saveInventory(inventory, storage = window.localStorage) {
  const normalized = Array.isArray(inventory)
    ? inventory.filter((itemId, index, array) =>
        typeof itemId === 'string' && isKnownItem(itemId) && array.indexOf(itemId) === index
      )
    : [];
  const nextInventory = normalized.includes(DEFAULT_ITEM_ID)
    ? normalized
    : [DEFAULT_ITEM_ID, ...normalized];
  storage.setItem(STORAGE_KEYS.inventory, JSON.stringify(nextInventory));
  return nextInventory;
}

export function loadEquippedItem(storage = window.localStorage) {
  const inventory = loadInventory(storage);
  const equipped = storage.getItem(STORAGE_KEYS.equippedItem);
  return inventory.includes(equipped) && isKnownItem(equipped) ? equipped : DEFAULT_ITEM_ID;
}

export function saveEquippedItem(itemId, storage = window.localStorage) {
  const inventory = loadInventory(storage);
  const value = inventory.includes(itemId) && isKnownItem(itemId) ? itemId : DEFAULT_ITEM_ID;
  storage.setItem(STORAGE_KEYS.equippedItem, value);
  return value;
}

export function purchaseItem(itemId, storage = window.localStorage, catalog = ITEM_CATALOG) {
  if (!isKnownItem(itemId)) {
    return { ok: false, reason: 'unknown', totalCoins: loadStats(storage).totalCoins };
  }

  const inventory = loadInventory(storage);
  if (inventory.includes(itemId)) {
    return { ok: false, reason: 'owned', totalCoins: loadStats(storage).totalCoins };
  }

  const item = catalog?.[itemId] ?? null;
  const cost = item?.price ?? 0;
  const spent = spendCoins(cost, storage);
  if (!spent.ok) {
    return { ok: false, reason: 'coins', totalCoins: spent.totalCoins };
  }

  saveInventory([...inventory, itemId], storage);
  return { ok: true, reason: null, totalCoins: spent.totalCoins };
}

export function loadTutorialSeen(storage = window.localStorage) {
  return storage.getItem(STORAGE_KEYS.tutorialSeen) === 'true';
}

export function saveTutorialSeen(seen, storage = window.localStorage) {
  storage.setItem(STORAGE_KEYS.tutorialSeen, seen ? 'true' : 'false');
}

export function loadLastRoomCode(storage = window.localStorage) {
  return storage.getItem(STORAGE_KEYS.lastRoomCode) ?? '';
}

export function saveLastRoomCode(roomCode, storage = window.localStorage) {
  const value = String(roomCode ?? '').trim().toUpperCase();
  storage.setItem(STORAGE_KEYS.lastRoomCode, value);
  return value;
}

export function loadSoundMuted(storage = window.localStorage) {
  return storage.getItem(STORAGE_KEYS.soundMuted) === 'true';
}

export function saveSoundMuted(isMuted, storage = window.localStorage) {
  storage.setItem(STORAGE_KEYS.soundMuted, isMuted ? 'true' : 'false');
}

export function loadNickname(storage = window.localStorage) {
  return storage.getItem(STORAGE_KEYS.nickname) ?? '';
}

export function saveNickname(nickname, storage = window.localStorage) {
  const value = String(nickname ?? '').trim();
  storage.setItem(STORAGE_KEYS.nickname, value);
  return value;
}

function readNumber(storage, key) {
  const value = Number(storage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function readJson(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
