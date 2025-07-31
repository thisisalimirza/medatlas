import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }

    // Test Supabase connection
    let supabaseTest = { connected: false, error: null as string | null, placesCount: 0 }
    
    try {
      const supabase = createServerClient()
      const { data, error, count } = await supabase
        .from('places')
        .select('id', { count: 'exact' })
        .limit(1)

      if (error) {
        supabaseTest.error = error.message
      } else {
        supabaseTest.connected = true
        supabaseTest.placesCount = count || 0
      }
    } catch (dbError: any) {
      supabaseTest.error = dbError.message
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVariables: envCheck,
      supabase: supabaseTest,
      message: "Debug endpoint working"
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}