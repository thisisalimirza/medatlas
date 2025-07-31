import { NextRequest, NextResponse } from 'next/server'
import { createUser, createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, stage, displayName } = body

    // Validation
    if (!email || !password || !stage) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and training stage are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const validStages = ['premed', 'ms1', 'ms2', 'ms3', 'ms4', 'resident', 'attending']
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { success: false, error: 'Invalid training stage' },
        { status: 400 }
      )
    }

    // Create user
    const result = await createUser({
      email,
      password,
      stage,
      display_name: displayName
    })

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Create JWT token
    const token = await createToken(result.user)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        stage: result.user.stage,
        display_name: result.user.display_name,
        is_paid: result.user.is_paid
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}