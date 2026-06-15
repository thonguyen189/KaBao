const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCh1lG2cJWbK3zrkSEGhuir-Bg0AQbZtJs',
  authDomain: 'kabao-13f31.firebaseapp.com',
  databaseURL: 'https://kabao-13f31-default-rtdb.firebaseio.com',
  projectId: 'kabao-13f31',
  storageBucket: 'kabao-13f31.firebasestorage.app',
  messagingSenderId: '673444875085',
  appId: '1:673444875085:web:82d1bba9a3cbe625618504'
};

const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
const FIREBASE_AUTH_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
const FIREBASE_DATABASE_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
const NICKNAME_ERROR = 'Tên này chưa phù hợp, hãy chọn tên vui vẻ hơn nhé.';

const BLOCKED_TERMS = [
  'badword',
  'bad word',
  'fuck',
  'shit',
  'bitch',
  'damn',
  'sex',
  'sexy',
  'porn',
  'nude',
  'naked',
  'kill',
  'murder',
  'terrorist',
  'nazi',
  'racist',
  'stupid',
  'idiot',
  'do ngu',
  'mat day',
  'khon nan',
  'dam',
  'dit',
  'cac',
  'lon',
  'buoi',
  'hiep dam',
  'giet',
  'chet',
  'ma tuy',
  'phat xit'
];

let firebasePromise = null;

export function validateNickname(nickname) {
  const value = String(nickname ?? '').trim().replace(/\s+/g, ' ');

  if (!value) {
    return { ok: false, value: '', reason: 'empty' };
  }

  if (value.length < 2 || value.length > 16) {
    return { ok: false, value, reason: 'length' };
  }

  if (!/^[\p{L}\p{N}_ -]+$/u.test(value)) {
    return { ok: false, value, reason: 'characters' };
  }

  if (containsBlockedNicknameContent(normalizeNicknameForSafety(value))) {
    return { ok: false, value, reason: NICKNAME_ERROR };
  }

  return { ok: true, value, reason: null };
}

export function normalizeNicknameForSafety(nickname) {
  return String(nickname ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsBlockedNicknameContent(normalizedName) {
  const compactName = normalizedName.replace(/\s+/g, '');

  return BLOCKED_TERMS.some((term) => {
    const normalizedTerm = normalizeNicknameForSafety(term);
    const compactTerm = normalizedTerm.replace(/\s+/g, '');
    return normalizedName.includes(normalizedTerm) || compactName.includes(compactTerm);
  });
}

export function buildPlayerRunPayload(result, options = {}) {
  return {
    uid: options.uid,
    score: toSafeInteger(result.score),
    coins: toSafeInteger(result.coins),
    bestCombo: toSafeInteger(result.bestCombo ?? 0),
    playedAt: options.playedAt ?? result.playedAt ?? new Date().toISOString(),
    savedAt: options.savedAt ?? new Date().toISOString()
  };
}

export function buildPlayerProfilePayload(stats, options = {}) {
  const validation = validateNickname(options.nickname);
  const nickname = validation.ok
    ? validation.value
    : '';

  return {
    nickname,
    totalCoins: toSafeInteger(stats.totalCoins),
    playedMatches: toSafeInteger(stats.playedMatches),
    bestScore: toSafeInteger(stats.topRuns?.[0]?.score ?? stats.bestScore ?? 0),
    latestRank: stats.latestRank ?? null,
    updatedAt: options.updatedAt ?? new Date().toISOString()
  };
}

export function buildLeaderboardPayload(result, stats = {}, options = {}) {
  const validation = validateNickname(options.nickname);
  if (!validation.ok) {
    return null;
  }

  return {
    uid: options.uid,
    nickname: validation.value,
    score: toSafeInteger(result.score),
    coins: toSafeInteger(result.coins),
    bestCombo: toSafeInteger(result.bestCombo ?? 0),
    playedAt: options.playedAt ?? result.playedAt ?? new Date().toISOString(),
    savedAt: options.savedAt ?? new Date().toISOString()
  };
}

export function normalizeLeaderboardSnapshot(value, limit = 10) {
  return Object.entries(value ?? {})
    .map(([id, row]) => ({
      id,
      nickname: String(row.nickname ?? 'Bạn nhỏ'),
      score: toSafeInteger(row.score),
      coins: toSafeInteger(row.coins),
      bestCombo: toSafeInteger(row.bestCombo ?? 0),
      playedAt: row.playedAt ?? '',
      savedAt: row.savedAt ?? ''
    }))
    .sort((a, b) => b.score - a.score || new Date(a.playedAt) - new Date(b.playedAt))
    .slice(0, limit)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function savePlayerInfo(result, stats, options = {}) {
  const { uid, database, dbModule } = await getRealtimeDatabaseClient();
  const savedAt = options.savedAt ?? new Date().toISOString();
  const nickname = options.nickname;
  const profile = buildPlayerProfilePayload(stats, { nickname, updatedAt: savedAt });
  const run = buildPlayerRunPayload(result, { uid, savedAt });
  const leaderboard = buildLeaderboardPayload(result, stats, { uid, nickname, savedAt });

  await dbModule.update(dbModule.ref(database, `players/${uid}/profile`), profile);
  await dbModule.set(dbModule.push(dbModule.ref(database, `players/${uid}/runs`)), run);

  if (leaderboard) {
    await dbModule.set(dbModule.push(dbModule.ref(database, 'leaderboard')), leaderboard);
  }

  return { profile, run, leaderboard };
}

export async function savePlayerProfile(stats, options = {}) {
  const { uid, database, dbModule } = await getRealtimeDatabaseClient();
  const profile = buildPlayerProfilePayload(stats, {
    nickname: options.nickname,
    updatedAt: options.updatedAt
  });

  await dbModule.update(dbModule.ref(database, `players/${uid}/profile`), profile);
  return profile;
}

export async function loadGlobalLeaderboard(options = {}) {
  const limit = options.limit ?? 10;
  const { database, dbModule } = await getRealtimeDatabaseClient();
  const leaderboardRef = dbModule.query(
    dbModule.ref(database, 'leaderboard'),
    dbModule.orderByChild('score'),
    dbModule.limitToLast(limit)
  );
  const snapshot = await dbModule.get(leaderboardRef);
  return normalizeLeaderboardSnapshot(snapshot.val(), limit);
}

async function getRealtimeDatabaseClient() {
  if (!firebasePromise) {
    firebasePromise = Promise.all([
      import(FIREBASE_APP_URL),
      import(FIREBASE_AUTH_URL),
      import(FIREBASE_DATABASE_URL)
    ]).then(async ([appModule, authModule, dbModule]) => {
      const app = appModule.initializeApp(FIREBASE_CONFIG);
      const auth = authModule.getAuth(app);
      const credential = auth.currentUser
        ? { user: auth.currentUser }
        : await authModule.signInAnonymously(auth);
      const database = dbModule.getDatabase(app);

      return {
        uid: credential.user.uid,
        database,
        dbModule
      };
    });
  }

  return firebasePromise;
}

function toSafeInteger(value) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : 0;
}
