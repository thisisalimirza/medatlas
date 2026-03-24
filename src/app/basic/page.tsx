export default function BasicPage() {
  return (
    <div>
      <h1>🏥 MedStack - Basic Test</h1>
      <p>✅ This page has its own layout with no AuthProvider</p>
      <p>✅ Zero external dependencies</p>
      <p>✅ Pure HTML/CSS only</p>
      <p>If you can see this, Next.js App Router is working!</p>
      
      <div style={{marginTop: '20px'}}>
        <a href="/api/health" style={{color: '#dc2626', textDecoration: 'underline'}}>
          Test API Health
        </a>
      </div>
    </div>
  )
}