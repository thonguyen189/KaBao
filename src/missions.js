export const DAILY_MISSIONS = {
  daily_login: {
    id: 'daily_login',
    title: 'Điểm danh hôm nay',
    target: 1,
    reward: 10,
    unit: 'lần'
  },
  play_one_match: {
    id: 'play_one_match',
    title: 'Chơi một trận',
    target: 1,
    reward: 15,
    unit: 'trận'
  },
  hit_20_mosquitoes: {
    id: 'hit_20_mosquitoes',
    title: 'Đập 20 muỗi',
    target: 20,
    reward: 20,
    unit: 'muỗi'
  },
  roll_dice: {
    id: 'roll_dice',
    title: 'Tung xúc xắc',
    target: 1,
    reward: 10,
    unit: 'lần'
  }
};

export const DAILY_MISSION_IDS = [
  'daily_login',
  'play_one_match',
  'hit_20_mosquitoes',
  'roll_dice'
];

export function createMissionState(date, existing = {}) {
  const progress = {};
  const claimed = {};

  for (const id of DAILY_MISSION_IDS) {
    progress[id] = clampProgress(existing.progress?.[id] ?? 0, DAILY_MISSIONS[id].target);
    claimed[id] = existing.claimed?.[id] === true;
  }

  return {
    date,
    progress,
    claimed,
    updatedAt: existing.updatedAt ?? ''
  };
}

export function applyMissionProgress(state, missionId, amount = 1) {
  if (!DAILY_MISSIONS[missionId]) {
    return state;
  }

  const mission = DAILY_MISSIONS[missionId];
  return createMissionState(state.date, {
    ...state,
    progress: {
      ...state.progress,
      [missionId]: clampProgress((state.progress?.[missionId] ?? 0) + amount, mission.target)
    },
    claimed: state.claimed
  });
}

export function claimMissionReward(state, missionId) {
  const mission = DAILY_MISSIONS[missionId];
  if (!mission) {
    return { ok: false, reason: 'unknown', reward: 0, state };
  }

  const progress = state.progress?.[missionId] ?? 0;
  if (state.claimed?.[missionId]) {
    return { ok: false, reason: 'claimed', reward: 0, state };
  }

  if (progress < mission.target) {
    return { ok: false, reason: 'incomplete', reward: 0, state };
  }

  const nextState = createMissionState(state.date, {
    ...state,
    progress: state.progress,
    claimed: {
      ...state.claimed,
      [missionId]: true
    }
  });

  return { ok: true, reason: null, reward: mission.reward, state: nextState };
}

export function getClaimableMissionIds(state) {
  return DAILY_MISSION_IDS.filter((id) => {
    const mission = DAILY_MISSIONS[id];
    return !state.claimed?.[id] && (state.progress?.[id] ?? 0) >= mission.target;
  });
}

function clampProgress(value, target) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }
  return Math.min(number, target);
}
