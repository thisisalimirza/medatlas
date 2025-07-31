export default function Page() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🏥 MedAtlas
        </h1>
        <div style={{ color: '#16a34a', fontSize: '18px', margin: '15px 0' }}>
          ✅ Next.js is working!
        </div>
        <div style={{ color: '#16a34a', fontSize: '18px', margin: '15px 0' }}>
          ✅ App Router is working!
        </div>
        <div style={{ color: '#16a34a', fontSize: '18px', margin: '15px 0' }}>
          ✅ Vercel deployment successful!
        </div>
        <p style={{ color: '#666', marginTop: '20px' }}>
          This is a minimal Next.js page with zero external dependencies.
        </p>
      </div>
    </main>
  )
}