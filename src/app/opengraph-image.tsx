import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MedStack - Medical School & Residency Explorer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              marginRight: '20px',
            }}
          >
            🏥
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            MedStack
          </div>
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#e0e0e0',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Medical School & Residency Explorer
        </div>
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '40px',
          }}
        >
          {['208+ Programs', 'Free Tools', 'Match Data', 'Board Prep'].map((item) => (
            <div
              key={item}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#ffffff',
                fontSize: '20px',
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '20px',
            color: '#888',
          }}
        >
          mymedstack.com
        </div>
      </div>
    ),
    { ...size }
  )
}
