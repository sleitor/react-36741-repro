/**
 * Automated bug reproduction test.
 * Requires: npx playwright install chromium
 *
 * Run: node test-hidden-tab.mjs
 * (Start the dev server first: npm run dev)
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();

// Simulate hidden tab: override visibilityState + block requestAnimationFrame
await page.addInitScript(() => {
  Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });
  Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
  window._rafCallbacks = [];
  const _origRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { window._rafCallbacks.push(cb); return 0; };
  window._origRaf = _origRaf;
});

const PORT = process.env.PORT || 3000;
await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
console.log('Shell received. Tab is simulated as "hidden". Waiting 5s for SlowData to resolve...');

await new Promise(r => setTimeout(r, 5000));

const state = await page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
  const comments = [];
  let node;
  while ((node = walker.nextNode())) comments.push(node.data);

  const revealed = document.getElementById('revealed');
  const fallback = document.getElementById('fallback');
  return {
    $RT: window.$RT,
    $RB_length: window.$RB ? window.$RB.length : 0,
    rafCallbacksQueued: window._rafCallbacks.length,
    fallbackVisible: !!fallback && !fallback.closest('[hidden]'),
    revealedVisible: !!revealed && !revealed.closest('[hidden]'),
    boundaryComments: comments,
  };
});

console.log('\nResults:');
console.table(state);

const bugConfirmed =
  typeof state['$RT'] === 'undefined' &&
  state.rafCallbacksQueued >= 1 &&
  !state.revealedVisible;

if (bugConfirmed) {
  console.log('\n✅ BUG CONFIRMED: $RT never set → $RV rAF stuck → fallback shown forever');
  process.exitCode = 1;
} else {
  console.log('\n✅ Not reproduced (may be running with fix applied)');
}

await browser.close();
