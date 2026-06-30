# react#36741 — Hidden-tab Suspense reveal repro

Minimal repro for [react#36741](https://github.com/react/react/issues/36741): Suspense boundaries streamed while the browser tab is hidden **never reveal** — the page shows a loading spinner forever.

## The bug (React 19.3.0-canary, main branch)

When a page with streaming Suspense loads in a **hidden/background tab**:

1. Shell script `requestAnimationFrame(function(){$RT=performance.now()})` never fires → `$RT` stays `undefined`
2. Server streams resolved content; `$RC` runs: sees `typeof $RT !== 'number'` → schedules `requestAnimationFrame($RV.bind(null,$RB))`
3. That rAF also never fires in a hidden tab → `$RV` (reveal) never runs
4. Boundary comment stays `"$~"` (pending), content stays in a hidden `<div>` — **forever**

## Verified with Playwright (automated)

```
After 5s (hidden tab):
  $RT:                   undefined      ← rAF never fired
  $RB.length:            2              ← boundary stuck in queue
  rAF callbacks queued:  2              ← never dispatched
  fallbackVisible:       true           ← user sees spinner
  revealedVisible:       false          ← content in hidden <div>
  boundary comment:      "$~"           ← pending, not "$"

✅ BUG CONFIRMED
```

## Run the repro

```bash
git clone https://github.com/sleitor/react-36741-repro
cd react-36741-repro
npm install
npm run dev   # Next.js 15 + React 19.3.0-canary (commit 92f4fda3, pre-fix)
```

Open [http://localhost:3000](http://localhost:3000), middle-click a link to open it as a **background tab**, wait 5s, switch to it — spinner never goes away.

## The fix

[facebook/react#36751](https://github.com/react/react/pull/36751): when `document.visibilityState === 'hidden'` at shell parse time, set `$RT = performance.now()` immediately (no rAF). Add a `visibilitychange` listener as fallback for Case B (tab goes hidden after shell load but before the rAF fires).

## Affected versions

React canary / main branch builds that include the `$RT` timing mechanism (introduced after 19.1.0, targeting 19.2+). React 19.1.0 stable is not affected because it uses a different reveal path without `$RT`.
