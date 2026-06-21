import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calculateDiceBonus,
  calculateDifficulty,
  createInitialState,
  getMosquitoFrameKey,
  getMosquitoHitRadius,
  hitMosquito,
  insertTopRun,
  updateComboAfterHit,
  spawnMosquitoes,
  updateTimer
} from '../src/gameCore.js';
import { GAME_SETTINGS } from '../src/settings.js';
import {
  awardBonusCoins,
  loadEquippedItem,
  loadInventory,
  loadNickname,
  loadStats,
  loadTutorialSeen,
  purchaseItem,
  resetLocalAccountData,
  saveEquippedItem,
  saveMatchResult,
  saveNickname,
  saveTutorialSeen
} from '../src/storage.js';
import { ITEM_CATALOG } from '../src/items.js';
import {
  DAILY_MISSIONS,
  DAILY_MISSION_IDS,
  applyMissionProgress,
  claimMissionReward,
  createMissionState,
  getClaimableMissionIds,
  getMissionPanelStatus
} from '../src/missions.js';
import {
  buildLeaderboardPayload,
  buildPlayerProfilePayload,
  buildPlayerRunPayload,
  buildServerDateInfo,
  buildRoomLeaderboardPayload,
  containsBlockedNicknameContent,
  normalizeLeaderboardSnapshot,
  normalizeRoomCode,
  normalizeRoomLeaderboard,
  normalizeNicknameForSafety,
  validateRoomCode,
  validateNickname
} from '../src/firebaseScores.js';

function makeRandom(values) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

function test(name, fn) {
  fn();
  return name;
}

const results = [];

results.push(test('createInitialState uses the 30 second default from settings', () => {
  const state = createInitialState();

  assert.equal(GAME_SETTINGS.durationSeconds, 30);
  assert.equal(state.durationSeconds, 30);
  assert.equal(state.remainingSeconds, 30);
}));

results.push(test('calculateDifficulty stays easy for the first 30 percent and reaches max at the end', () => {
  assert.equal(calculateDifficulty(0, 30), 1);
  assert.equal(calculateDifficulty(9, 30), 1);
  assert.equal(calculateDifficulty(30, 30), GAME_SETTINGS.difficulty.maxMultiplier);
}));

results.push(test('getMosquitoHitRadius matches the rendered mosquito image radius', () => {
  assert.equal(getMosquitoHitRadius(30), 32.25);
}));

results.push(test('getMosquitoFrameKey cycles through all flying mosquito frames', () => {
  assert.equal(getMosquitoFrameKey({ status: 'flying', age: 0 }), 'mosquitoFlying01');
  assert.equal(getMosquitoFrameKey({ status: 'flying', age: 0.06 }), 'mosquitoFlying02');
  assert.equal(getMosquitoFrameKey({ status: 'flying', age: 0.3 }), 'mosquitoFlying06');
  assert.equal(getMosquitoFrameKey({ status: 'flying', age: 0.36 }), 'mosquitoFlying01');
}));

results.push(test('getMosquitoFrameKey plays hit frames before falling frames after a slap', () => {
  assert.equal(getMosquitoFrameKey({ status: 'hit', hitAge: 0 }), 'mosquitoHit01');
  assert.equal(getMosquitoFrameKey({ status: 'hit', hitAge: 0.08 }), 'mosquitoHit02');
  assert.equal(getMosquitoFrameKey({ status: 'hit', hitAge: 0.16 }), 'mosquitoHit03');
  assert.equal(getMosquitoFrameKey({ status: 'hit', hitAge: 0.24 }), 'mosquitoFalling01');
  assert.equal(getMosquitoFrameKey({ status: 'hit', hitAge: 0.4 }), 'mosquitoFalling03');
}));

results.push(test('spawnMosquitoes adds at most two per tick and caps alive mosquitoes at 20', () => {
  const state = createInitialState();
  const rng = makeRandom([0.25, 0.5, 0.75, 0.1, 0.9]);

  spawnMosquitoes(state, {
    count: 25,
    playWidth: 360,
    playHeight: 640,
    random: rng
  });

  assert.equal(state.mosquitoes.length, 20);
  assert.ok(state.mosquitoes.every((mosquito) => mosquito.status === 'flying'));
  assert.ok(state.mosquitoes.every((mosquito) => mosquito.x >= 32 && mosquito.x <= 328));
  assert.ok(state.mosquitoes.every((mosquito) => mosquito.y >= 32 && mosquito.y <= 608));
}));

results.push(test('hitMosquito marks one flying mosquito as hit and increments score and coins', () => {
  const state = createInitialState();
  state.mosquitoes.push({
    id: 'm1',
    x: 100,
    y: 120,
    radius: 32,
    vx: 20,
    vy: 15,
    status: 'flying',
    age: 0,
    rotation: 0
  });

  const hit = hitMosquito(state, 110, 125, { currentTimeSeconds: 1 });

  assert.equal(hit?.id, 'm1');
  assert.equal(state.score, 1);
  assert.equal(state.matchCoins, 1);
  assert.equal(state.combo.current, 1);
  assert.equal(state.combo.best, 1);
  assert.equal(state.mosquitoes[0].status, 'hit');
}));

results.push(test('hitMosquito awards coins equal to the current combo count', () => {
  const state = createInitialState();
  state.mosquitoes.push(
    {
      id: 'm1',
      x: 100,
      y: 120,
      radius: 32,
      vx: 20,
      vy: 15,
      status: 'flying',
      age: 0,
      rotation: 0
    },
    {
      id: 'm2',
      x: 180,
      y: 140,
      radius: 32,
      vx: 20,
      vy: 15,
      status: 'flying',
      age: 0,
      rotation: 0
    }
  );

  const firstHit = hitMosquito(state, 100, 120, { currentTimeSeconds: 1 });
  const secondHit = hitMosquito(state, 180, 140, { currentTimeSeconds: 1.4 });

  assert.equal(firstHit?.comboCount, 1);
  assert.equal(secondHit?.comboCount, 2);
  assert.equal(state.score, 2);
  assert.equal(state.matchCoins, 3);
}));

results.push(test('successful hits only create the impact image effect for the weapon visual', () => {
  const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.equal(mainSource.includes("effects.push({ type: 'weapon'"), false);
  assert.equal(mainSource.includes("effect.type === 'weapon'"), false);
  assert.equal(mainSource.includes("effects.push({ type: 'hit'"), true);
  assert.equal(mainSource.includes('life: 0.24'), true);
  assert.equal(mainSource.includes("effects.push({ type: 'coin'"), false);
  assert.equal(mainSource.includes("effect.type === 'coin'"), false);
}));

results.push(test('hitMosquito accepts taps inside the rendered image bounds', () => {
  const state = createInitialState();
  state.mosquitoes.push({
    id: 'm1',
    x: 100,
    y: 120,
    radius: 30,
    vx: 20,
    vy: 15,
    status: 'flying',
    age: 0,
    rotation: 0
  });

  const hit = hitMosquito(state, 132, 120, { currentTimeSeconds: 1 });

  assert.equal(hit?.id, 'm1');
  assert.equal(state.score, 1);
}));

results.push(test('updateComboAfterHit increments quick hits and resets after the combo window', () => {
  const state = createInitialState();

  assert.equal(updateComboAfterHit(state, 1), 1);
  assert.equal(updateComboAfterHit(state, 1.5), 2);
  assert.equal(updateComboAfterHit(state, 3), 1);
  assert.equal(state.combo.best, 2);
}));

results.push(test('hitMosquito ignores missed taps and already hit mosquitoes', () => {
  const state = createInitialState();
  state.mosquitoes.push({
    id: 'm1',
    x: 50,
    y: 60,
    radius: 24,
    vx: 0,
    vy: 0,
    status: 'hit',
    age: 0,
    rotation: 0
  });

  assert.equal(hitMosquito(state, 52, 62), null);
  assert.equal(hitMosquito(state, 300, 300), null);
  assert.equal(state.score, 0);
  assert.equal(state.matchCoins, 0);
}));

results.push(test('updateTimer counts down and ends the match at zero', () => {
  const state = createInitialState({ durationSeconds: 5 });

  updateTimer(state, 2);
  assert.equal(state.remainingSeconds, 3);
  assert.equal(state.phase, 'playing');

  updateTimer(state, 3.25);
  assert.equal(state.remainingSeconds, 0);
  assert.equal(state.phase, 'result');
}));

results.push(test('insertTopRun keeps the highest five scores and returns one-based rank', () => {
  const existing = Array.from({ length: 5 }, (_, index) => ({
    score: 5 - index,
    coins: 5 - index,
    playedAt: `2026-06-14T00:00:0${index}.000Z`
  }));

  const { runs, rank } = insertTopRun(existing, {
    score: 3,
    coins: 3,
    playedAt: '2026-06-14T01:00:00.000Z'
  });

  assert.equal(runs.length, 5);
  assert.equal(rank, 4);
  assert.deepEqual(runs.map((run) => run.score), [5, 4, 3, 3, 2]);
}));

results.push(test('calculateDiceBonus multiplies match coins by the dice face', () => {
  assert.equal(calculateDiceBonus(10, 4), 40);
  assert.equal(calculateDiceBonus(0, 6), 0);
}));

results.push(test('saveMatchResult tracks played matches, new record, and rank metadata', () => {
  const storage = makeStorage();
  saveMatchResult({ score: 5, coins: 5, playedAt: '2026-06-14T00:00:00.000Z' }, storage);

  const stats = saveMatchResult({ score: 8, coins: 8, playedAt: '2026-06-14T01:00:00.000Z' }, storage);

  assert.equal(stats.playedMatches, 2);
  assert.equal(stats.previousBestScore, 5);
  assert.equal(stats.isNewRecord, true);
  assert.equal(stats.latestRank, 1);
}));

results.push(test('awardBonusCoins only increases total coins and leaves top runs unchanged', () => {
  const storage = makeStorage();
  saveMatchResult({ score: 10, coins: 10, playedAt: '2026-06-14T00:00:00.000Z' }, storage);

  const stats = awardBonusCoins(40, storage);

  assert.equal(stats.totalCoins, 50);
  assert.equal(stats.playedMatches, 1);
  assert.equal(stats.topRuns.length, 1);
  assert.equal(stats.topRuns[0].score, 10);
}));

results.push(test('inventory falls back to slipper and buying items spends coins once', () => {
  const storage = makeStorage();
  storage.setItem('kabao.totalCoins', '100');
  storage.setItem('kabao.inventory', 'not-json');

  assert.deepEqual(loadInventory(storage), ['slipper']);
  assert.equal(loadEquippedItem(storage), 'slipper');
  assert.equal(ITEM_CATALOG.swatter.price, 80);

  const bought = purchaseItem('swatter', storage);
  assert.equal(bought.ok, true);
  assert.equal(bought.totalCoins, 20);
  assert.deepEqual(loadInventory(storage), ['slipper', 'swatter']);

  const duplicate = purchaseItem('swatter', storage);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.reason, 'owned');
  assert.equal(loadStats(storage).totalCoins, 20);
}));

results.push(test('equipped item only accepts owned catalog items and tutorial state persists', () => {
  const storage = makeStorage();
  storage.setItem('kabao.inventory', JSON.stringify(['slipper', 'notebook']));

  assert.equal(saveEquippedItem('phone', storage), 'slipper');
  assert.equal(saveEquippedItem('notebook', storage), 'notebook');
  assert.equal(loadEquippedItem(storage), 'notebook');
  assert.equal(loadTutorialSeen(storage), false);
  saveTutorialSeen(true, storage);
  assert.equal(loadTutorialSeen(storage), true);
}));

results.push(test('daily challenges expose two child-friendly goals and claim each reward once', () => {
  assert.deepEqual(DAILY_MISSION_IDS, ['play_one_match', 'hit_20_mosquitoes']);
  assert.equal(DAILY_MISSIONS.play_one_match.title, 'Khởi động nhanh');
  assert.equal(DAILY_MISSIONS.play_one_match.target, 1);
  assert.equal(DAILY_MISSIONS.play_one_match.reward, 15);
  assert.equal(DAILY_MISSIONS.hit_20_mosquitoes.title, 'Tay nhanh mắt sáng');
  assert.equal(DAILY_MISSIONS.hit_20_mosquitoes.target, 10);
  assert.equal(DAILY_MISSIONS.hit_20_mosquitoes.reward, 20);

  let challenges = createMissionState('2026-06-15');

  challenges = applyMissionProgress(challenges, 'hit_20_mosquitoes', 8);
  assert.deepEqual(getClaimableMissionIds(challenges), []);
  challenges = applyMissionProgress(challenges, 'hit_20_mosquitoes', 2);
  challenges = applyMissionProgress(challenges, 'play_one_match', 1);
  assert.deepEqual(getClaimableMissionIds(challenges), ['play_one_match', 'hit_20_mosquitoes']);

  const claimed = claimMissionReward(challenges, 'hit_20_mosquitoes');
  assert.equal(claimed.ok, true);
  assert.equal(claimed.reward, 20);
  assert.equal(claimed.state.claimed.hit_20_mosquitoes, true);
  assert.equal(claimMissionReward(claimed.state, 'hit_20_mosquitoes').ok, false);
}));

results.push(test('daily challenge panel keeps loading separate from offline error state', () => {
  assert.deepEqual(getMissionPanelStatus({ isLoading: true, isOnline: false, state: null }), {
    message: 'Đang tải thử thách...',
    showList: false
  });

  assert.deepEqual(getMissionPanelStatus({ isLoading: false, isOnline: false, state: null }), {
    message: 'Chưa tải được thử thách online. Bạn vẫn có thể chơi cá nhân.',
    showList: false
  });

  assert.deepEqual(getMissionPanelStatus({
    isLoading: false,
    isOnline: true,
    state: createMissionState('2026-06-15')
  }), {
    message: 'Hoàn thành thử thách nhỏ ngày 2026-06-15 để nhận xu.',
    showList: true
  });
}));

results.push(test('loadNickname and saveNickname persist a trimmed safe nickname', () => {
  const storage = makeStorage();

  saveNickname('  Bé Vui  ', storage);

  assert.equal(loadNickname(storage), 'Bé Vui');
}));

results.push(test('resetLocalAccountData clears profile progress and keeps sound preference', () => {
  const storage = makeStorage();
  storage.setItem('kabao.totalCoins', '100');
  storage.setItem('kabao.topRuns', JSON.stringify([{ score: 9, coins: 9 }]));
  storage.setItem('kabao.playedMatches', '4');
  storage.setItem('kabao.nickname', 'Bé Vui');
  storage.setItem('kabao.inventory', JSON.stringify(['slipper', 'swatter']));
  storage.setItem('kabao.equippedItem', 'swatter');
  storage.setItem('kabao.tutorialSeen', 'true');
  storage.setItem('kabao.lastRoomCode', 'KAB27');
  storage.setItem('kabao.soundMuted', 'true');
  storage.setItem('other.app', 'still-here');

  resetLocalAccountData(storage);

  assert.deepEqual(loadStats(storage), { totalCoins: 0, topRuns: [], playedMatches: 0 });
  assert.equal(loadNickname(storage), '');
  assert.deepEqual(loadInventory(storage), ['slipper']);
  assert.equal(loadEquippedItem(storage), 'slipper');
  assert.equal(loadTutorialSeen(storage), false);
  assert.equal(storage.getItem('kabao.lastRoomCode'), null);
  assert.equal(storage.getItem('kabao.soundMuted'), 'true');
  assert.equal(storage.getItem('other.app'), 'still-here');
}));

results.push(test('validateNickname accepts child-friendly Vietnamese and English names', () => {
  assert.deepEqual(validateNickname('Bao Nhi'), { ok: true, value: 'Bao Nhi', reason: null });
  assert.deepEqual(validateNickname('Ka_Bao'), { ok: true, value: 'Ka_Bao', reason: null });
  assert.deepEqual(validateNickname('Bé Vui'), { ok: true, value: 'Bé Vui', reason: null });
}));

results.push(test('validateNickname rejects empty, long, and unsupported character names', () => {
  assert.equal(validateNickname('   ').ok, false);
  assert.equal(validateNickname('TenNguoiChoiQuaDai').ok, false);
  assert.equal(validateNickname('Bao!').ok, false);
}));

results.push(test('nickname safety normalizes Vietnamese marks and blocks unsafe variants', () => {
  assert.equal(normalizeNicknameForSafety('Đồ  Ngu'), 'do ngu');
  assert.equal(containsBlockedNicknameContent(normalizeNicknameForSafety('đồ_n-g-u')), true);
  assert.equal(validateNickname('bad word').ok, false);
}));

results.push(test('buildPlayerRunPayload creates a Realtime Database run record', () => {
  const payload = buildPlayerRunPayload(
    { score: 12.9, coins: 9.8, bestCombo: 4.2, playedAt: '2026-06-15T02:00:00.000Z' },
    { uid: 'uid-1', savedAt: '2026-06-15T02:00:01.000Z' }
  );

  assert.deepEqual(payload, {
    uid: 'uid-1',
    score: 12,
    coins: 9,
    bestCombo: 4,
    playedAt: '2026-06-15T02:00:00.000Z',
    savedAt: '2026-06-15T02:00:01.000Z'
  });
}));

results.push(test('buildPlayerProfilePayload creates a safe profile summary', () => {
  const payload = buildPlayerProfilePayload(
    { totalCoins: 42.9, playedMatches: 3.2, topRuns: [{ score: 12 }], latestRank: 2 },
    { nickname: 'Bé Vui', updatedAt: '2026-06-15T02:00:01.000Z' }
  );

  assert.deepEqual(payload, {
    nickname: 'Bé Vui',
    totalCoins: 42,
    playedMatches: 3,
    bestScore: 12,
    latestRank: 2,
    updatedAt: '2026-06-15T02:00:01.000Z'
  });
}));

results.push(test('buildServerDateInfo derives the daily challenge date from server offset', () => {
  assert.deepEqual(buildServerDateInfo(60_000, Date.UTC(2026, 5, 20, 23, 59, 30)), {
    date: '2026-06-21',
    now: '2026-06-21T00:00:30.000Z'
  });
}));

results.push(test('buildLeaderboardPayload refuses unsafe nicknames and creates public rank data', () => {
  assert.equal(buildLeaderboardPayload({ score: 1, coins: 1 }, {}, { uid: 'uid-1', nickname: 'bad word' }), null);

  const payload = buildLeaderboardPayload(
    { score: 12, coins: 9, bestCombo: 4, playedAt: '2026-06-15T02:00:00.000Z' },
    {},
    { uid: 'uid-1', nickname: 'Bé Vui', savedAt: '2026-06-15T02:00:01.000Z' }
  );

  assert.deepEqual(payload, {
    uid: 'uid-1',
    nickname: 'Bé Vui',
    score: 12,
    coins: 9,
    bestCombo: 4,
    playedAt: '2026-06-15T02:00:00.000Z',
    savedAt: '2026-06-15T02:00:01.000Z'
  });
}));

results.push(test('normalizeLeaderboardSnapshot returns the top five scores in descending order by default', () => {
  const rows = normalizeLeaderboardSnapshot({
    a: { nickname: 'A', score: 5, coins: 5, playedAt: '2026-06-15T01:00:00.000Z' },
    b: { nickname: 'B', score: 12, coins: 9, playedAt: '2026-06-15T02:00:00.000Z' },
    c: { nickname: 'C', score: 12, coins: 8, playedAt: '2026-06-15T00:00:00.000Z' },
    d: { nickname: 'D', score: 7, coins: 7, playedAt: '2026-06-15T00:00:00.000Z' },
    e: { nickname: 'E', score: 6, coins: 6, playedAt: '2026-06-15T00:00:00.000Z' },
    f: { nickname: 'F', score: 4, coins: 4, playedAt: '2026-06-15T00:00:00.000Z' }
  });

  assert.equal(JSON.stringify(rows.map((row) => row.nickname)), JSON.stringify(['C', 'B', 'D', 'E', 'A']));
  assert.equal(JSON.stringify(rows.map((row) => row.rank)), JSON.stringify([1, 2, 3, 4, 5]));
}));

results.push(test('main UI requests and messages refer to top 5 leaderboards', () => {
  const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.equal(mainSource.includes('limit: 10'), false);
  assert.equal(mainSource.includes('top 10'), false);
  assert.equal(mainSource.includes('limit: 5'), true);
  assert.equal(mainSource.includes('top 5'), true);
}));

results.push(test('v1.2 account UI moves nickname creation to startup settings flow', () => {
  const htmlSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('id="accountScreen"'), true);
  assert.equal(htmlSource.includes('id="settingsScreen"'), true);
  assert.equal(htmlSource.includes('id="settingsButton"'), true);
  assert.equal(htmlSource.includes('id="settingsSoundButton"'), true);
  assert.equal(htmlSource.includes('id="resetAccountButton"'), true);
  assert.equal(mainSource.includes('ensureNicknameGate'), true);
  assert.equal(mainSource.includes('handleAccountSubmit'), true);
  assert.equal(mainSource.includes('handleResetAccount'), true);
  assert.equal(mainSource.includes('resetLocalAccountData'), true);
}));

results.push(test('v1.3 challenge UI replaces player-facing mission text', () => {
  const htmlSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('Thử thách'), true);
  assert.equal(htmlSource.includes('Nhiệm vụ'), false);
  assert.equal(mainSource.includes('thử thách'), true);
  assert.equal(mainSource.includes('nhiệm vụ online'), false);
  assert.equal(mainSource.includes('nhiệm vụ hằng ngày'), false);
}));

results.push(test('room codes normalize safely and room leaderboard keeps best entry per player', () => {
  assert.equal(normalizeRoomCode(' ab-12 '), 'AB12');
  assert.equal(validateRoomCode('AB12').ok, false);
  assert.equal(validateRoomCode('KAB27').ok, true);

  const payload = buildRoomLeaderboardPayload(
    { score: 12, coins: 9, bestCombo: 4, playedAt: '2026-06-15T02:00:00.000Z' },
    { uid: 'uid-1', nickname: 'Bé Vui', savedAt: '2026-06-15T02:00:01.000Z' }
  );

  assert.deepEqual(payload, {
    uid: 'uid-1',
    nickname: 'Bé Vui',
    score: 12,
    coins: 9,
    bestCombo: 4,
    playedAt: '2026-06-15T02:00:00.000Z',
    savedAt: '2026-06-15T02:00:01.000Z'
  });

  const rows = normalizeRoomLeaderboard({
    a: { nickname: 'A', score: 5, coins: 5, playedAt: '2026-06-15T01:00:00.000Z' },
    b: { nickname: 'B', score: 12, coins: 9, playedAt: '2026-06-15T02:00:00.000Z' }
  });
  assert.equal(rows[0].nickname, 'B');
  assert.equal(rows[0].rank, 1);
}));

results.push(test('Realtime Database rules protect leaderboard writes and keep score indexed', () => {
  const rules = JSON.parse(readFileSync(new URL('../database.rules.json', import.meta.url), 'utf8'));
  const leaderboard = rules.rules.leaderboard;
  const leaderboardRows = leaderboard.$scoreId;
  const rooms = rules.rules.rooms;
  const dailyMissions = rules.rules.players.$uid.dailyMissions;

  assert.equal(rules.rules['.read'], false);
  assert.equal(rules.rules['.write'], false);
  assert.equal(leaderboard['.read'], true);
  assert.equal(leaderboard['.indexOn'], 'score');
  assert.equal(leaderboardRows['.write'], "auth != null && !data.exists() && newData.child('uid').val() === auth.uid");
  assert.ok(leaderboardRows['.validate'].includes("newData.hasChildren(['uid', 'nickname', 'score', 'coins', 'bestCombo', 'playedAt', 'savedAt'])"));
  assert.ok(leaderboardRows.uid['.validate'].includes('auth.uid'));
  assert.ok(leaderboardRows.nickname['.validate'].includes('newData.val().length <= 16'));
  assert.ok(leaderboardRows.score['.validate'].includes('newData.val() >= 0'));
  assert.equal(rooms.$roomCode.leaderboard['.indexOn'], 'score');
  assert.ok(rooms.$roomCode.leaderboard.$uid['.write'].includes('auth.uid === $uid'));
  assert.ok(dailyMissions.$date['.write'].includes('auth.uid === $uid'));
}));

function makeStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

console.log(JSON.stringify({ passed: results.length, results }, null, 2));
