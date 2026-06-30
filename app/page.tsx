import { Suspense } from 'react'
export const dynamic = 'force-dynamic'

async function SlowData() {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return (
    <div id="revealed" style={{
      background: '#d4edda',
      border: '1px solid #28a745',
      borderRadius: '4px',
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <strong>✅ Suspense boundary revealed!</strong>
      <br />Loaded at: {new Date().toISOString()}
    </div>
  )
}

export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>react#36741 — Hidden-tab Suspense reveal bug</h1>
      <Suspense fallback={
        <div id="fallback" style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          ⏳ Loading… (3-second delay)
        </div>
      }>
        <SlowData />
      </Suspense>
    </main>
  )
}
