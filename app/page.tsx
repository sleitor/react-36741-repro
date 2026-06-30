import { Suspense } from 'react'
import SlowData from './slow-content'

export default function Home() {
  return (
    <main>
      <h1>react#36741 — Hidden-tab Suspense reveal bug</h1>
      
      <h2>How to reproduce</h2>
      <ol>
        <li>Middle-click this link (or right-click → Open in New Tab) <strong>without switching to the new tab</strong></li>
        <li>Wait ~5 seconds while staying on another tab</li>
        <li>Switch back to this tab</li>
      </ol>

      <h2>Expected</h2>
      <p>The green box below should appear when you switch to the tab (content was streamed in the background).</p>

      <h2>Actual (without fix)</h2>
      <p>The green box never appears — the Suspense boundary stays in "pending" state forever because <code>requestAnimationFrame</code> never fires in hidden tabs, and <code>$RT</code> is never initialized, so <code>completeBoundary</code> never schedules the reveal.</p>

      <hr />

      <Suspense fallback={
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '4px', 
          padding: '1rem',
          marginTop: '1rem'
        }}>
          ⏳ Loading… (3-second delay simulates slow server data)
        </div>
      }>
        <SlowData />
      </Suspense>

      <hr style={{ marginTop: '2rem' }} />
      <small>
        Fix: <a href="https://github.com/react/react/pull/36751">facebook/react#36751</a> — 
        initialise <code>$RT</code> synchronously when tab is hidden and via <code>visibilitychange</code> fallback
      </small>
    </main>
  )
}
