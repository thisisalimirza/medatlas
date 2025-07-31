export default function MinimalPage() {
  return (
    <html>
      <head>
        <title>MedAtlas - Minimal Test</title>
        <style>{`
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
          }
          .container { 
            max-width: 600px; 
            margin: 50px auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            text-align: center;
          }
          .status { 
            color: #16a34a; 
            font-weight: bold; 
            margin: 10px 0; 
          }
          .button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🏥 MedAtlas - Minimal Test</h1>
          <div className="status">✅ Basic routing is working!</div>
          <div className="status">✅ Next.js is deployed correctly!</div>
          <div className="status">✅ This page loaded successfully!</div>
          
          <p>If you can see this page, the fundamental Next.js deployment is working.</p>
          
          <div>
            <a href="/api/health" className="button">Test API</a>
            <a href="/" className="button">Try Main App</a>
          </div>
          
          <div style={{marginTop: '30px', fontSize: '14px', color: '#666'}}>
            <p><strong>Environment:</strong> {process.env.NODE_ENV || 'unknown'}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
        </div>
      </body>
    </html>
  )
}