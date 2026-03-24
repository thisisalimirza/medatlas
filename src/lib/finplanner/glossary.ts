// Plain-language explanations for every financial term in the app.
// Written for a medical student who has never taken a finance class.

export const TIPS = {
  // Dashboard metrics
  npv: "Net Present Value — Think of it like this: a dollar today is worth more than a dollar 10 years from now (because you could invest it). NPV converts all your future earnings and expenses into \"today's dollars\" so you can fairly compare paths that pay off at different times. Higher = better.",
  netWorth: "Everything you own (savings, investments, retirement accounts) minus everything you owe (loans, debt). This is the single best number for tracking your overall financial health.",
  breakEvenAge: "The age when your net worth crosses $0 — meaning you've fully paid off your debt and your savings exceed what you owe. The earlier this happens, the sooner you're building real wealth.",
  investmentPortfolio: "The total value of your retirement and investment accounts. This grows over time through compound interest — the earlier you start contributing, the more powerful the growth.",
  disposableIncome: "What's left after taxes, living expenses, loan payments, insurance, and retirement contributions. This is the money you can actually spend or save however you want.",
  effectiveTaxRate: "The actual percentage of your income that goes to taxes. It's lower than your \"tax bracket\" because only the income within each bracket is taxed at that rate.",
  grossIncome: "Your total earnings before any taxes or deductions come out. This includes your medical salary, moonlighting, signing bonuses, and any business income.",
  cumulativeDisposable: "The running total of your disposable income over the years. When this is negative, you've spent more than you've earned so far. When it turns positive, you're in the clear.",

  // Loan terms
  standardRepayment: "The default federal loan plan: fixed monthly payments over 20 years. You'll pay more total interest, but your balance always goes down. This is the simplest option.",
  pslf: "Public Service Loan Forgiveness — If you work at a nonprofit hospital (most academic medical centers qualify) and make 10 years of income-based payments, the remaining balance is forgiven tax-free. This can save you hundreds of thousands of dollars.",
  ibr: "Income-Based Repayment — Your monthly payment is capped at 10% of your \"discretionary income\" (income above 150% of the poverty line). During residency, this means very low payments. The remaining balance is forgiven after 10 years under PSLF.",
  blendedRate: "Your loans probably have different interest rates (Direct Unsubsidized vs Grad PLUS). This is the weighted average rate across all your loans. If you're not sure, 7% is a reasonable estimate for 2026 graduates.",
  refinanceRate: "If you refinance your federal loans with a private lender, you might get a lower rate — but you lose access to PSLF and IBR. Only worth it if you're sure you won't pursue PSLF.",
  loanBalance: "How much you still owe on your student loans. This starts high (often $300-400K+ after med school) and goes down as you make payments — unless you're on IBR during residency, where your payments may not cover the interest.",

  // Income terms
  attendingSalary: "Your starting salary as a fully-trained physician. This varies hugely by specialty — primary care is typically $250-300K, while surgical subspecialties can be $600K+.",
  salaryCap: "The maximum salary you're likely to reach in this specialty. Salaries grow with experience and inflation but eventually plateau. This keeps the model realistic.",
  salaryGrowth: "How fast your salary increases each year (typically 3%, roughly matching inflation). Some specialties have faster growth early in your career.",
  moonlighting: "Extra shifts you pick up during residency/fellowship for additional pay. EM residents can moonlight a lot ($15K+/yr), while surgical residents typically can't.",
  signingBonus: "A one-time payment when you sign your first attending contract. Ranges from $10K (primary care) to $100K+ (neurosurgery, rural areas).",
  malpractice: "Malpractice insurance you pay as an attending. During training, your hospital covers this. Costs vary dramatically — $8K for psychiatry vs $50K+ for OB/GYN or CT surgery.",

  // Business terms
  sideBusiness: "Income from a business you run alongside your medical career. This could be anything: a medical education company, consulting, real estate, an app, a clinic, etc. Many physicians build significant side income this way.",
  businessRevenue: "The total money your business brings in before expenses. The model assumes you keep a percentage as profit after operating costs.",
  startupCapital: "The initial money you invest to start your business. Could be as low as a few thousand for an online business, or $50K+ for something like opening a clinic.",
  opexPercent: "What percentage of your revenue goes to running the business (employees, software, rent, supplies, etc.). 40% is typical for a service business. Lower means more profit for you.",
  ownersDrawPercent: "What percentage of the business profit you actually pay yourself. The rest stays in the business for growth. 80% is common for small businesses.",
  revenueCeiling: "The maximum annual revenue your business can realistically generate. This prevents the model from projecting unrealistic growth forever.",
  sideBusinessRevYear1: "How much revenue your side business makes in its first year. Start conservative — most side businesses make $5K-$20K in year one.",
  sideBusinessGrowth: "How fast your side business revenue grows year-over-year. 25% is aggressive but achievable if you're reinvesting time and money.",

  // Lifestyle terms
  livingCostResidency: "Your annual living expenses during residency — rent, food, transportation, etc. $48K/yr is average for a single resident in a mid-cost city.",
  livingCostHighCOL: "Your annual living expenses as an attending in a high cost-of-living area (NYC, SF, Boston, etc.). Lifestyle inflation is real — most attendings spend $72K-100K+/yr.",
  livingCostLowCOL: "Your annual living expenses as an attending in a lower cost-of-living area. If you practice in a smaller city or rural area, your money goes much further.",
  colRegion: "Where you plan to practice. This dramatically affects how far your salary goes. A $350K salary in rural Ohio gives you much more spending power than the same salary in Manhattan.",
  healthInsurance: "Annual health insurance cost you pay out of pocket as an attending. During training, your program typically covers this. Estimate $8K/yr for a single person.",
  disabilityInsurance: "Insurance that pays you if you can't practice medicine due to injury or illness. This is critical for physicians — your ability to work is your biggest financial asset. ~$5K/yr.",
  retirementPercent: "What percentage of your gross income you put into retirement accounts (401K, IRA, etc.) each year. 15% is the standard recommendation. Even 10% makes a huge difference over 30 years thanks to compound growth.",
  retirementStartAge: "When you start contributing to retirement. Earlier is dramatically better — starting at 30 vs 35 can mean hundreds of thousands more by retirement.",
  investmentReturn: "The average annual return on your investments. 7% is the historical average for a diversified stock portfolio. Don't count on more than this.",
  discountRate: "Used to calculate NPV — this is how much you value money today vs. the future. 5% is standard. You generally don't need to change this.",
  inflationRate: "How fast prices rise each year. 3% is the long-run average. Your salary and expenses both grow roughly at this rate.",

  // Tax terms
  standardDeduction: "The amount of income that's automatically tax-free. For 2026, it's about $14,600 for a single filer. You don't need to change this unless tax law changes.",
  stateLocalTax: "The percentage your state and city take in income tax. This varies hugely — 0% in Texas/Florida, up to 13% in California. 6% is a reasonable average.",
  ficaCap: "Social Security tax only applies to the first ~$169K of income. Above that, you only pay the Medicare portion (1.45%). This is set by the government each year.",

  // Phase terms
  medSchool: "You're still in medical school — no income, accumulating debt. Every year here adds roughly $80-100K in loans (tuition + living expenses + interest).",
  residency: "You've graduated med school and are training in your specialty. You earn a salary (~$63K starting) but it's modest relative to your debt and hours.",
  fellowship: "Additional subspecialty training after residency. Pay is slightly higher than residency (~$75K) but you're delaying the much higher attending salary.",
  attending: "You're a fully-trained physician! This is when the real money starts — but also when lifestyle inflation, taxes, and financial decisions matter most.",
} as const;
