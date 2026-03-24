import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase-server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { contractText, userEmail } = await request.json()

    if (!contractText || contractText.length < 50) {
      return NextResponse.json({ error: 'Please provide at least 50 characters of contract text.' }, { status: 400 })
    }

    if (contractText.length > 15000) {
      return NextResponse.json({ error: 'Contract text must be under 15,000 characters. Paste the most important sections.' }, { status: 400 })
    }

    // Verify user is paid
    if (userEmail) {
      const { data: user } = await supabaseAdmin
        .from('user_profiles')
        .select('is_paid')
        .eq('email', userEmail)
        .single()

      if (!user?.is_paid) {
        return NextResponse.json({ error: 'This feature requires a Pro account.' }, { status: 403 })
      }
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a physician contract analysis assistant. Analyze the following physician employment contract excerpt and provide:

1. **Key Terms Summary** - Bullet points of the most important terms (compensation, duration, termination, etc.)
2. **Red Flags** - Any concerning clauses that could be unfavorable to the physician (be specific about why each is a concern)
3. **Green Flags** - Positive clauses that favor the physician
4. **Negotiation Recommendations** - Top 3-5 specific things to negotiate, ranked by importance
5. **Overall Assessment** - Brief 2-3 sentence summary of how this contract compares to typical physician contracts

Keep your response concise and actionable. Use markdown formatting.

Contract text:
${contractText}`
        }
      ]
    })

    const content = message.content[0]
    const analysisText = content.type === 'text' ? content.text : ''

    return NextResponse.json({ analysis: analysisText })
  } catch (error: unknown) {
    console.error('Contract analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Analysis failed: ${errorMessage}` }, { status: 500 })
  }
}
