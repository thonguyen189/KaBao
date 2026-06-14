# KaBao V1 HTML5 Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable mobile-first HTML5 Canvas prototype for "Đập muỗi cùng Ka Báo" V1.

**Architecture:** The app is a static browser game with testable pure game logic in `src/gameCore.js`, persistence helpers in `src/storage.js`, asset loading in `src/assets.js`, and browser orchestration in `src/main.js`. Canvas handles moving targets and effects; DOM handles menu, HUD, and result screens.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, Canvas 2D, Web Audio/HTMLAudioElement, LocalStorage, Python static server for local verification.

---

### Task 1: Core Game Logic

**Files:**
- Create: `src/gameCore.js`
- Test: `tests/gameCore.test.mjs`

- [ ] Write failing tests for mosquito spawn cap, hit scoring, timer completion, and top-10 ranking.
- [ ] Run tests with Node REPL dynamic import and verify failure due missing module.
- [ ] Implement `createInitialState`, `spawnMosquitoes`, `hitMosquito`, `updateTimer`, and `insertTopRun`.
- [ ] Re-run tests and verify pass.

### Task 2: Static App Shell

**Files:**
- Create: `index.html`
- Create: `src/styles.css`
- Create: `src/assets.js`
- Create: `src/storage.js`

- [ ] Add mobile-first app shell with main menu, gameplay HUD/canvas, and result screen.
- [ ] Wire `asset-manifest.json` through a loader that tolerates missing future assets.
- [ ] Add LocalStorage helpers for total coins, top runs, and played match count.

### Task 3: Canvas Gameplay

**Files:**
- Create: `src/main.js`
- Modify: `index.html`

- [ ] Load image/audio assets.
- [ ] Start a 120 second match from Play.
- [ ] Spawn up to two mosquitoes per second with a max of 20 alive.
- [ ] Move mosquitoes with delta time and bounce within the play area.
- [ ] Handle pointer taps, score +1, coins +1, hit burst, slipper, and coin feedback.
- [ ] End the match, save local results, and show result screen with replay/home actions.

### Task 4: Verification

**Files:**
- No production changes expected.

- [ ] Run logic tests through Node REPL.
- [ ] Serve the app with `python -m http.server`.
- [ ] Open the app in a browser and verify the menu renders, Play starts gameplay, canvas is nonblank, and clicking a mosquito updates score.
