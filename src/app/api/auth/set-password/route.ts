import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Find the user in our database
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (findError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update the user's password in Supabase Auth
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      { password }
    )

    if (passwordError) {
      console.error('Password update error:', passwordError)
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Update the user's stage if provided
    if (stage) {
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          stage,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('Stage update error:', updateError)
        // Don't fail the whole request if stage update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}