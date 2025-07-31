import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Clear the Supabase session cookies
    const cookieStore = await cookies()
    
    // Clear all Supabase related cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-auth-token'
    ]

    cookiesToClear.forEach(cookieName => {
      cookieStore.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}