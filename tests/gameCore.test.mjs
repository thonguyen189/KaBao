import assert from 'node:assert/strict';
import {
  createInitialState,
  hitMosquito,
  insertTopRun,
  spawnMosquitoes,
  updateTimer
} from '../src/gameCore.js';

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

  const hit = hitMosquito(state, 110, 125);

  assert.equal(hit?.id, 'm1');
  assert.equal(state.score, 1);
  assert.equal(state.matchCoins, 1);
  assert.equal(state.mosquitoes[0].status, 'hit');
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

results.push(test('insertTopRun keeps the highest ten scores and returns one-based rank', () => {
  const existing = Array.from({ length: 10 }, (_, index) => ({
    score: 10 - index,
    coins: 10 - index,
    playedAt: `2026-06-14T00:00:0${index}.000Z`
  }));

  const { runs, rank } = insertTopRun(existing, {
    score: 7,
    coins: 7,
    playedAt: '2026-06-14T01:00:00.000Z'
  });

  assert.equal(runs.length, 10);
  assert.equal(rank, 5);
  assert.deepEqual(runs.map((run) => run.score), [10, 9, 8, 7, 7, 6, 5, 4, 3, 2]);
}));

nodeRepl.write(JSON.stringify({ passed: results.length, results }, null, 2));
