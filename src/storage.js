import { insertTopRun } from './gameCore.js';

const STORAGE_KEYS = {
  totalCoins: 'kabao.totalCoins',
  topRuns: 'kabao.topRuns',
  playedMatches: 'kabao.playedMatches'
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
    latestRank: ranked.rank
  };

  storage.setItem(STORAGE_KEYS.totalCoins, String(nextStats.totalCoins));
  storage.setItem(STORAGE_KEYS.topRuns, JSON.stringify(nextStats.topRuns));
  storage.setItem(STORAGE_KEYS.playedMatches, String(nextStats.playedMatches));

  return nextStats;
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
