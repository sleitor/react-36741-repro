// Server component with artificial 3-second delay
async function SlowData() {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return (
    <div style={{ 
      background: '#d4edda', 
      border: '1px solid #28a745', 
      borderRadius: '4px', 
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <strong>✅ Suspense boundary revealed!</strong>
      <br />
      Loaded at: {new Date().toISOString()}
      <br />
      <em>If this never appeared while the tab was hidden, that's the bug.</em>
    </div>
  )
}

export default SlowData
