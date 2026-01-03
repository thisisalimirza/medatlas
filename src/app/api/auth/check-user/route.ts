import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

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
    const supabaseAdmin = getSupabaseAdmin()
    const { data: existingUser, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, is_paid, stage')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking user:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    const userExists = !!existingUser
    const isPaid = existingUser?.is_paid || false

    let message = ''
    if (!userExists) {
      message = 'Create your MedAtlas Pro account to access all features.'
    } else if (!isPaid) {
      message = 'Upgrade to MedAtlas Pro to access all premium features.'
    } else {
      message = 'Welcome back! We\'ll send you a secure login link.'
    }

    return NextResponse.json({
      success: true,
      userExists,
      isPaid,
      message,
      stage: existingUser?.stage || 'premed'
    })

  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}