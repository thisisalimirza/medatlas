import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, stage } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user exists in Supabase
    const { data: user, error: findError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()
    
    if (findError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update the user's password in Supabase Auth
    const { error: passwordError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password
    })

    if (passwordError) {
      console.error('Password update error:', passwordError)
      return NextResponse.json(
        { success: false, error: 'Failed to set password' },
        { status: 500 }
      )
    }

    // Update user's stage if provided
    if (stage) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          stage: stage,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update stage error:', updateError)
        // Don't fail the whole process if stage update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password set successfully'
    })
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set password' },
      { status: 500 }
    )
  }
}