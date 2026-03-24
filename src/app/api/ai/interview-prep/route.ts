import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase-server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { specialty, questionType, userEmail } = await request.json()

    if (!specialty) {
      return NextResponse.json({ error: 'Please select a specialty.' }, { status: 400 })
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

    const typeContext = questionType === 'behavioral'
      ? 'behavioral/situational interview questions (tell me about a time..., how would you handle..., what would you do if...)'
      : questionType === 'clinical'
      ? 'clinical scenario questions specific to the specialty'
      : questionType === 'program'
      ? 'questions about why this specialty, career goals, and program fit'
      : 'a mix of behavioral, clinical, and program-specific questions'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Generate 5 realistic residency interview questions for a ${specialty} residency applicant. Focus on ${typeContext}.

For each question, provide:
1. The question itself
2. A brief tip on how to approach the answer (2-3 sentences)
3. A common mistake to avoid (1 sentence)

Format as a numbered list with markdown. Make questions specific to ${specialty} where applicable.`
        }
      ]
    })

    const content = message.content[0]
    const questionsText = content.type === 'text' ? content.text : ''

    return NextResponse.json({ questions: questionsText })
  } catch (error: unknown) {
    console.error('Interview prep error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Generation failed: ${errorMessage}` }, { status: 500 })
  }
}
