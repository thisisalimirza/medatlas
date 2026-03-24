'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'

type ExamType = 'step1' | 'step2'
type Phase = { name: string; weeks: number; focus: string; resources: string[]; dailyHours: number; tips: string }

interface StudyPlan {
  phases: Phase[]
  totalWeeks: number
  examDate: string
  startDate: string
  weeklySchedule: { day: string; focus: string; hours: number }[]
}

const RESOURCES = {
  step1: {
    primary: [
      { name: 'First Aid for USMLE Step 1', type: 'Review Book', cost: 'free-with-school', description: 'The gold standard review book. Annotate it heavily throughout your studies.', url: '' },
      { name: 'Pathoma', type: 'Video + Book', cost: '$100/yr', description: 'Dr. Sattar\'s pathology course. Essential for understanding disease mechanisms.', url: '' },
      { name: 'Sketchy Medical', type: 'Video', cost: '$250/yr', description: 'Visual mnemonics for Microbiology, Pharmacology, and Pathology.', url: '' },
      { name: 'Boards & Beyond', type: 'Video', cost: '$200/yr', description: 'Comprehensive video library covering all Step 1 topics by Dr. Jason Ryan.', url: '' },
    ],
    qbanks: [
      { name: 'UWorld Step 1', type: 'QBank', cost: '$400-600', description: 'The #1 question bank. Do it 1-2x. Detailed explanations are as valuable as the questions.', url: '' },
      { name: 'AMBOSS Step 1', type: 'QBank + Library', cost: '$230/yr', description: 'Strong question bank with integrated learning library and AI features.', url: '' },
    ],
    flashcards: [
      { name: 'AnKing Deck (Anki)', type: 'Flashcards', cost: 'Free', description: 'Comprehensive deck tagged to First Aid, Pathoma, and Sketchy. Use with spaced repetition.', url: '' },
    ],
    practice: [
      { name: 'NBME Practice Exams', type: 'Practice Test', cost: '$60-70 each', description: 'Official NBME self-assessments. Take 3-5 during dedicated study period for score prediction.', url: '' },
      { name: 'UWorld Self-Assessments', type: 'Practice Test', cost: 'Included with UWorld', description: 'Two full-length practice exams with score prediction. Take in final 2 weeks.', url: '' },
      { name: 'Free 120', type: 'Practice Test', cost: 'Free', description: 'Official USMLE practice test. Take 1 week before exam. Most predictive of actual score.', url: '' },
    ]
  },
  step2: {
    primary: [
      { name: 'UWorld Step 2 CK', type: 'QBank', cost: '$400-600', description: 'The single most important resource for Step 2 CK. Complete 1-2 passes.', url: '' },
      { name: 'AMBOSS Step 2 CK', type: 'QBank + Library', cost: '$230/yr', description: 'Excellent supplementary question bank with clinical reasoning focus.', url: '' },
      { name: 'Online MedEd', type: 'Video', cost: 'Free', description: 'Dr. Williams\' video lectures covering all clinical topics by organ system.', url: '' },
      { name: 'Divine Intervention Podcasts', type: 'Audio', cost: 'Free', description: 'High-yield podcast episodes for Step 2 CK and Shelf exam review.', url: '' },
    ],
    qbanks: [
      { name: 'UWorld Step 2 CK', type: 'QBank', cost: '$400-600', description: 'Primary question bank. Focus on understanding clinical reasoning, not memorization.', url: '' },
    ],
    flashcards: [
      { name: 'AnKing Step 2 Deck', type: 'Flashcards', cost: 'Free', description: 'Spaced repetition deck for clinical topics. Tag-based for shelf-specific study.', url: '' },
      { name: 'Cheesy Dorian Deck', type: 'Flashcards', cost: 'Free', description: 'Popular Step 2 deck organized by specialty with clinical vignettes.', url: '' },
    ],
    practice: [
      { name: 'NBME Practice Exams', type: 'Practice Test', cost: '$60-70 each', description: 'Official self-assessments. Take 2-3 during study period.', url: '' },
      { name: 'UWorld Self-Assessment', type: 'Practice Test', cost: 'Included', description: 'Full-length practice exam with score prediction.', url: '' },
      { name: 'Free 120', type: 'Practice Test', cost: 'Free', description: 'Official USMLE practice test. Take in final week.', url: '' },
    ]
  }
}

function generateStudyPlan(examType: ExamType, examDate: string, currentScore: number, targetScore: number, hoursPerDay: number): StudyPlan {
  const exam = new Date(examDate)
  const today = new Date()
  const totalDays = Math.max(1, Math.floor((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const totalWeeks = Math.max(1, Math.floor(totalDays / 7))
  const gap = targetScore - currentScore

  const startDate = today.toISOString().split('T')[0]

  let phases: Phase[] = []

  if (examType === 'step1') {
    if (totalWeeks >= 12) {
      // Long prep (3+ months)
      const foundationWeeks = Math.floor(totalWeeks * 0.4)
      const integrationWeeks = Math.floor(totalWeeks * 0.3)
      const dedicatedWeeks = totalWeeks - foundationWeeks - integrationWeeks
      phases = [
        {
          name: 'Foundation Building',
          weeks: foundationWeeks,
          focus: 'Build core knowledge base. Watch Boards & Beyond / Pathoma alongside coursework. Start AnKing cards for topics covered.',
          resources: ['Boards & Beyond', 'Pathoma', 'AnKing Deck (Anki)', 'First Aid'],
          dailyHours: Math.min(hoursPerDay, 4),
          tips: 'Focus on understanding, not memorization. Mature 50-100 new Anki cards daily. Read corresponding First Aid sections.'
        },
        {
          name: 'Integration & QBank',
          weeks: integrationWeeks,
          focus: 'Begin UWorld in tutor mode by system. Unsuspend remaining Anki cards. Review Sketchy for Micro/Pharm.',
          resources: ['UWorld Step 1', 'Sketchy Medical', 'AnKing Deck', 'First Aid'],
          dailyHours: Math.min(hoursPerDay, 6),
          tips: 'Do 40 UWorld questions/day. Thoroughly review every explanation. Annotate First Aid with UWorld pearls.'
        },
        {
          name: 'Dedicated Study',
          weeks: dedicatedWeeks,
          focus: 'Full-time study. Finish UWorld, take NBMEs every 1-2 weeks. Hammer weak areas. Review incorrects.',
          resources: ['UWorld (2nd pass)', 'NBME Practice Exams', 'First Aid', 'Free 120'],
          dailyHours: hoursPerDay,
          tips: `Take NBME every ${Math.max(1, Math.floor(dedicatedWeeks / 4))} weeks. Free 120 in final week. ${gap > 30 ? 'Focus heavily on weak areas.' : 'Maintain strengths while targeting gaps.'}`
        }
      ]
    } else {
      // Short prep (<3 months)
      const qbankWeeks = Math.floor(totalWeeks * 0.6)
      const reviewWeeks = totalWeeks - qbankWeeks
      phases = [
        {
          name: 'Intensive QBank',
          weeks: qbankWeeks,
          focus: 'Hammer UWorld hard. 80-120 questions/day. Review Pathoma and Sketchy for weak areas.',
          resources: ['UWorld Step 1', 'Pathoma', 'Sketchy Medical', 'First Aid'],
          dailyHours: hoursPerDay,
          tips: 'Prioritize UWorld above all else. For weak topics, watch the corresponding Pathoma or Sketchy videos.'
        },
        {
          name: 'Review & Practice Tests',
          weeks: reviewWeeks,
          focus: 'Review UWorld incorrects/marked. Take NBMEs. Rapid First Aid review. Free 120 last week.',
          resources: ['UWorld Incorrects', 'NBME Practice Exams', 'First Aid', 'Free 120'],
          dailyHours: hoursPerDay,
          tips: 'Focus on your weak areas identified by NBMEs. Don\'t start new resources at this point.'
        }
      ]
    }
  } else {
    // Step 2 CK
    if (totalWeeks >= 8) {
      const clinicalWeeks = Math.floor(totalWeeks * 0.5)
      const dedicatedWeeks = totalWeeks - clinicalWeeks
      phases = [
        {
          name: 'Clinical Integration',
          weeks: clinicalWeeks,
          focus: 'UWorld in tutor mode by system. Supplement with Online MedEd videos. Listen to Divine Intervention during commute.',
          resources: ['UWorld Step 2 CK', 'Online MedEd', 'Divine Intervention', 'AnKing Step 2 Deck'],
          dailyHours: Math.min(hoursPerDay, 5),
          tips: 'Do 40-60 questions/day. Focus on clinical reasoning — Step 2 rewards knowing "next best step" rather than pure facts.'
        },
        {
          name: 'Dedicated Review',
          weeks: dedicatedWeeks,
          focus: 'Finish UWorld, review incorrects, take practice tests. Focus on management algorithms and clinical guidelines.',
          resources: ['UWorld (2nd pass)', 'NBME Practice Exams', 'Divine Intervention', 'Free 120'],
          dailyHours: hoursPerDay,
          tips: 'Step 2 is more about clinical decision-making than Step 1. Think like a resident managing patients.'
        }
      ]
    } else {
      phases = [
        {
          name: 'Rapid UWorld + Review',
          weeks: totalWeeks,
          focus: 'Complete UWorld as fast as possible. 80+ questions/day. Take 1-2 NBMEs. Free 120 last week.',
          resources: ['UWorld Step 2 CK', 'Divine Intervention', 'Free 120'],
          dailyHours: hoursPerDay,
          tips: 'With limited time, UWorld is your only priority. Skip supplementary resources.'
        }
      ]
    }
  }

  const weeklySchedule = [
    { day: 'Monday', focus: 'QBank (hard topics)', hours: hoursPerDay },
    { day: 'Tuesday', focus: 'QBank + video review', hours: hoursPerDay },
    { day: 'Wednesday', focus: 'QBank + weak area review', hours: hoursPerDay },
    { day: 'Thursday', focus: 'QBank + Anki catch-up', hours: hoursPerDay },
    { day: 'Friday', focus: 'QBank + First Aid review', hours: hoursPerDay },
    { day: 'Saturday', focus: 'Practice test OR review day', hours: Math.min(hoursPerDay, 6) },
    { day: 'Sunday', focus: 'Light review + rest', hours: Math.max(2, hoursPerDay - 4) },
  ]

  return { phases, totalWeeks, examDate, startDate, weeklySchedule }
}

export default function BoardPrepPlannerPage() {
  const [examType, setExamType] = useState<ExamType>('step1')
  const [examDate, setExamDate] = useState('')
  const [currentScore, setCurrentScore] = useState(200)
  const [targetScore, setTargetScore] = useState(240)
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'planner' | 'resources' | 'schedule'>('planner')

  const resources = RESOURCES[examType]

  const handleGenerate = () => {
    if (!examDate) return
    const generated = generateStudyPlan(examType, examDate, currentScore, targetScore, hoursPerDay)
    setPlan(generated)
    setActiveTab('schedule')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">📖 Board Exam Study Planner</h1>
          <p className="text-red-100 text-sm md:text-base max-w-2xl">
            Generate a personalized USMLE Step 1 or Step 2 CK study plan based on your exam date, current
            score, and available study time. Includes resource recommendations and weekly scheduling.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Personalized Timeline', 'Resource Guide', 'Score Prediction', 'Weekly Schedule', 'Practice Test Strategy'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* Tab nav */}
        <nav className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto max-w-full mb-6">
          {[
            { id: 'planner' as const, label: 'Study Planner', icon: '📋' },
            { id: 'resources' as const, label: 'Resource Guide', icon: '📚' },
            { id: 'schedule' as const, label: 'My Study Plan', icon: '📅' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Planner Tab */}
        {activeTab === 'planner' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Configure Your Study Plan</h2>

              <div className="space-y-6">
                {/* Exam Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Which exam are you studying for?</label>
                  <div className="flex gap-3">
                    {(['step1', 'step2'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setExamType(type)}
                        className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                          examType === type ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-bold">{type === 'step1' ? 'Step 1' : 'Step 2 CK'}</div>
                        <div className="text-xs text-gray-500 mt-1">{type === 'step1' ? 'Basic Sciences' : 'Clinical Knowledge'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Current Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Practice Test Score (estimate if no practice test yet)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={150}
                      max={280}
                      value={currentScore}
                      onChange={(e) => setCurrentScore(Number(e.target.value))}
                      className="flex-1 accent-red-600"
                    />
                    <span className="text-lg font-bold text-gray-900 w-12 text-right">{currentScore}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>150</span>
                    <span>200</span>
                    <span>230</span>
                    <span>260</span>
                    <span>280</span>
                  </div>
                </div>

                {/* Target Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Score</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={180}
                      max={280}
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="flex-1 accent-red-600"
                    />
                    <span className="text-lg font-bold text-gray-900 w-12 text-right">{targetScore}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {targetScore >= 260 ? '🔥 Elite — top surgical subspecialties' :
                     targetScore >= 245 ? '💪 Competitive — most specialties' :
                     targetScore >= 230 ? '✅ Solid — primary care + moderate specialties' :
                     '📈 Building — focus on fundamentals'}
                  </div>
                </div>

                {/* Hours Per Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Study Hours Per Day</label>
                  <div className="flex gap-2">
                    {[4, 6, 8, 10, 12].map(h => (
                      <button
                        key={h}
                        onClick={() => setHoursPerDay(h)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          hoursPerDay === h ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!examDate}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/25"
                >
                  Generate My Study Plan →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            <div className="flex gap-3 mb-4">
              {(['step1', 'step2'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setExamType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    examType === type ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'step1' ? 'Step 1 Resources' : 'Step 2 CK Resources'}
                </button>
              ))}
            </div>

            {[
              { title: 'Primary Resources', items: resources.primary, emoji: '📕' },
              { title: 'Question Banks', items: resources.qbanks, emoji: '❓' },
              { title: 'Flashcards', items: resources.flashcards, emoji: '🗂️' },
              { title: 'Practice Tests', items: resources.practice, emoji: '📝' },
            ].map(section => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>{section.emoji}</span> {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map(resource => (
                    <div key={resource.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-red-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{resource.name}</h3>
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                          {resource.cost}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{resource.type}</span>
                      <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* SEO content */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">How to Study for {examType === 'step1' ? 'USMLE Step 1' : 'USMLE Step 2 CK'}</h2>
              <div className="text-sm text-gray-600 space-y-3">
                {examType === 'step1' ? (
                  <>
                    <p>USMLE Step 1 tests foundational science knowledge across anatomy, physiology, biochemistry, pharmacology, pathology, and microbiology. Since becoming pass/fail in January 2022, the focus has shifted from score optimization to ensuring a solid pass.</p>
                    <p>The most effective approach combines a primary video resource (Boards & Beyond or Pathoma), a question bank (UWorld), and spaced repetition flashcards (Anki). Most students need 6-12 weeks of dedicated study after completing their preclinical curriculum.</p>
                  </>
                ) : (
                  <>
                    <p>USMLE Step 2 CK is now the primary scored exam for residency applications. It tests clinical knowledge and decision-making across all major specialties. A strong Step 2 CK score can significantly strengthen your ERAS application.</p>
                    <p>The most effective approach centers on UWorld Step 2 CK as the primary resource, supplemented by Online MedEd videos and Divine Intervention podcasts. Most students need 4-8 weeks of dedicated study, ideally taken after completing core clerkships.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            {!plan ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No study plan generated yet</h3>
                <p className="text-gray-600 text-sm mb-4">Go to the Study Planner tab to configure your plan</p>
                <button onClick={() => setActiveTab('planner')} className="text-red-600 text-sm font-medium hover:underline">
                  → Go to Study Planner
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your {examType === 'step1' ? 'Step 1' : 'Step 2 CK'} Study Plan</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Total Weeks</div>
                      <div className="text-xl font-bold text-gray-900">{plan.totalWeeks}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Exam Date</div>
                      <div className="text-sm font-bold text-gray-900">{new Date(plan.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Current → Target</div>
                      <div className="text-sm font-bold text-gray-900">{currentScore} → {targetScore}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Daily Hours</div>
                      <div className="text-xl font-bold text-gray-900">{hoursPerDay}h</div>
                    </div>
                  </div>
                </div>

                {/* Phases */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Study Phases</h3>
                  {plan.phases.map((phase, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                          <h4 className="font-bold text-gray-900">{phase.name}</h4>
                        </div>
                        <span className="text-sm text-red-700 font-medium">{phase.weeks} weeks · {phase.dailyHours}h/day</span>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-700 mb-4">{phase.focus}</p>

                        <div className="mb-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Resources</div>
                          <div className="flex flex-wrap gap-2">
                            {phase.resources.map(r => (
                              <span key={r} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">{r}</span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="text-xs font-semibold text-yellow-800 mb-1">💡 Pro Tip</div>
                          <p className="text-sm text-yellow-700">{phase.tips}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weekly Schedule */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Weekly Schedule</h3>
                  <div className="space-y-2">
                    {plan.weeklySchedule.map(day => (
                      <div key={day.day} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold w-24 ${day.day === 'Sunday' ? 'text-green-600' : 'text-gray-900'}`}>{day.day}</span>
                          <span className="text-sm text-gray-600">{day.focus}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{day.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 mt-8 text-center text-xs text-gray-400">
          <p>This is a study planning tool, not medical advice. Consult your school&apos;s academic advisors for personalized guidance.</p>
        </div>
      </div>
    </div>
  )
}
