# react#36741 — Hidden-tab Suspense reveal repro

Minimal Next.js repro for [react#36741](https://github.com/react/react/issues/36741): Suspense boundaries streamed while the browser tab is hidden never reveal.

## The bug

When a page with streaming Suspense boundaries loads in a **background/hidden tab**:

1. The shell-time `requestAnimationFrame` never fires → `$RT` is never set
2. `completeBoundary` sees `typeof $RT !== 'number'` and calls `requestAnimationFrame(_reactRetry)` 
3. That rAF also never fires (tab is hidden)
4. Boundaries stay queued in `$RB` forever — even after the tab becomes visible

## Steps to reproduce

```bash
git clone https://github.com/sleitor/react-36741-repro
cd react-36741-repro
npm install
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in a browser
2. Middle-click the page link (or right-click → Open in New Tab) **without switching to the new tab**
3. Wait ~5 seconds while staying on another tab
4. Switch to the new tab

**Expected:** Green "✅ Suspense boundary revealed!" box appears immediately.  
**Actual (React 19.1.0, without fix):** Box never appears.

## The fix

[facebook/react#36751](https://github.com/react/react/pull/36751) — initialise `$RT` synchronously when `document.visibilityState === 'hidden'` and via a one-shot `visibilitychange` fallback, so `completeBoundary` always takes the `setTimeout` flush path in hidden tabs.

## Environment

- React: 19.1.0 (any 19.x with streaming SSR)
- Next.js: 15.x (App Router, streaming enabled by default)
- Browser: Any (Chromium / Firefox / Safari)
