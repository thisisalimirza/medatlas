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
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()
    
    if (findError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update user's password and stage
    const updateData: any = {
      password_hash: hashedPassword,
      updated_at: new Date().toISOString()
    }

    // Include stage if provided
    if (stage) {
      updateData.stage = stage
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', email)

    if (updateError) {
      console.error('Update password error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to set password' },
        { status: 500 }
      )
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