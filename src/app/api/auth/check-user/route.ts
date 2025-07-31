import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, stage, display_name, is_paid, created_at')
      .eq('email', email)
      .single()

    // If no user found or error (user doesn't exist)
    if (error || !user) {
      return NextResponse.json({
        success: true,
        userExists: false,
        isPaid: false,
        message: "New user - will create account after payment"
      })
    }

    return NextResponse.json({
      success: true,
      userExists: true,
      isPaid: !!user.is_paid,
      user: {
        id: user.id,
        email: user.email,
        stage: user.stage,
        display_name: user.display_name,
        is_paid: !!user.is_paid
      },
      message: user.is_paid 
        ? "Existing paid user - please enter password to login"
        : "User exists but hasn't paid - will upgrade account after payment"
    })
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}