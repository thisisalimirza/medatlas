import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Check if user is admin (you can expand this logic as needed)
const isAdmin = (user: any) => {
  return user?.email === 'admin@medatlas.com' || user?.email?.includes('@medatlas.com')
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let query = supabaseAdmin
      .from('school_suggestions')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: suggestions, error } = await query

    if (error) {
      console.error('Error fetching school suggestions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suggestions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('Admin school suggestions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, status, admin_notes } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be approved or rejected' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (admin_notes) {
      updateData.admin_notes = admin_notes
    }

    const { data: suggestion, error } = await supabaseAdmin
      .from('school_suggestions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating school suggestion:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      suggestion
    })

  } catch (error) {
    console.error('Admin school suggestion update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}