export interface PersonalInfo {
  currentAge: number;
  medSchoolYear: number;
  yearsRemainingInMedSchool: number;
  analysisHorizon: number;
  modelStartYear: number;
}

export interface EducationCosts {
  year1Tuition: number;
  year2Tuition: number;
  year3Tuition: number;
  year4Tuition: number;
  annualLivingExpensesMedSchool: number;
  tuitionInflationRate: number;
}

export interface LoanAssumptions {
  federalDirectRate: number;
  gradPlusRate: number;
  blendedRate: number;
  standardRepaymentTerm: number;
  pslfForgivenessYear: number;
  ibrPaymentPercent: number;
  ibrPovertyLineBase: number;
  ibrPovertyMultiplier: number;
  refinanceRate: number;
}

export interface TaxBracket {
  upperLimit: number;
  rate: number;
}

export interface TaxAssumptions {
  brackets: TaxBracket[];
  standardDeduction: number;
  stateLocalTaxRate: number;
  ficaRate: number;
  ficaCap: number;
  additionalMedicareTax: number;
  additionalMedicareThreshold: number;
}

export interface LifestyleAssumptions {
  livingCostResidency: number;
  livingCostAttendingHighCOL: number;
  livingCostAttendingLowCOL: number;
  colInflation: number;
  healthInsurance: number;
  disabilityInsurance: number;
  retirementContributionPercent: number;
  retirementStartAge: number;
  expectedInvestmentReturn: number;
  inflationRate: number;
  discountRate: number;
  colRegion: 1 | 2;
}

export interface BusinessAssumptions {
  enabled: boolean;
  startupCapital: number;
  year1Revenue: number;
  year2Revenue: number;
  year3Revenue: number;
  year4Revenue: number;
  year5PlusGrowthRate: number;
  revenueCeiling: number;
  opexPercentOfRevenue: number;
  ownersDrawPercent: number;
  failureProbability: number;
  pivotSalary: number;
  // Side biz (during training)
  sideBusinessRevYear1: number;
  sideBusinessGrowthRate: number;
  sideBusinessHoursPerWeek: number;
}

export interface PathConfig {
  id: string;
  label: string;
  specialtyKey: string;
  includeBusiness: boolean;
  // Allow per-path overrides
  overrides?: Partial<{
    attendingSalaryYear1: number;
    attendingSalaryGrowthRate: number;
    attendingSalaryCap: number;
    moonlightingIncome: number;
    signingBonus: number;
    malpracticeInsurance: number;
  }>;
}

export interface YearData {
  yearOfAnalysis: number;
  calendarYear: number;
  age: number;
  phase: "Med School" | "Residency" | "Fellowship" | "Attending";
  // Income
  medicalSalary: number;
  moonlightingIncome: number;
  signingBonus: number;
  businessIncome: number;
  totalGrossIncome: number;
  // Taxes
  taxableIncome: number;
  federalIncomeTax: number;
  stateLocalTax: number;
  fica: number;
  totalTaxes: number;
  effectiveTaxRate: number;
  // After tax
  netIncomeAfterTax: number;
  // Expenses
  livingExpenses: number;
  malpracticeInsurance: number;
  healthInsurance: number;
  disabilityInsurance: number;
  businessStartupCosts: number;
  totalExpenses: number;
  // Loans - Standard
  loanBalanceBOYStd: number;
  interestAccruedStd: number;
  loanPaymentStd: number;
  loanBalanceEOYStd: number;
  // Loans - PSLF
  loanBalanceBOYPslf: number;
  ibrQualifyingCount: number;
  ibrPayment: number;
  pslfForgivenessEvent: number;
  loanBalanceEOYPslf: number;
  // Retirement
  retirementContribution: number;
  investmentPortfolioBOY: number;
  investmentPortfolioEOY: number;
  // Cash flow
  disposableIncomeStd: number;
  disposableIncomePslf: number;
  cumulativeDisposableStd: number;
  cumulativeDisposablePslf: number;
  // Net worth
  netWorthStd: number;
  netWorthPslf: number;
  // DCF
  dcfStd: number;
  dcfPslf: number;
}

export interface PathResult {
  config: PathConfig;
  years: YearData[];
  // Summary metrics
  npvStd: number;
  npvPslf: number;
  netWorth10Std: number;
  netWorth20Std: number;
  netWorth30Std: number;
  netWorth10Pslf: number;
  netWorth20Pslf: number;
  netWorth30Pslf: number;
  totalGrossEarnings: number;
  totalTaxesPaid: number;
  totalLoanPaymentsStd: number;
  totalLoanPaymentsPslf: number;
  pslfForgivenessAmount: number;
  investmentPortfolioFinal: number;
  breakEvenYearStd: number | null;
  breakEvenAgeStd: number | null;
}

export interface Assumptions {
  personal: PersonalInfo;
  education: EducationCosts;
  loans: LoanAssumptions;
  tax: TaxAssumptions;
  lifestyle: LifestyleAssumptions;
  business: BusinessAssumptions;
}
