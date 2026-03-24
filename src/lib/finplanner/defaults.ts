import { Assumptions, PathConfig } from "./types";

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  personal: {
    currentAge: 26,
    medSchoolYear: 2,
    yearsRemainingInMedSchool: 2,
    analysisHorizon: 30,
    modelStartYear: 2026,
  },
  education: {
    year1Tuition: 65000,
    year2Tuition: 42000,
    year3Tuition: 42000,
    year4Tuition: 42000,
    annualLivingExpensesMedSchool: 40000,
    tuitionInflationRate: 0.03,
  },
  loans: {
    federalDirectRate: 0.07,
    gradPlusRate: 0.08,
    blendedRate: 0.072,
    standardRepaymentTerm: 20,
    pslfForgivenessYear: 10,
    ibrPaymentPercent: 0.10,
    ibrPovertyLineBase: 15060,
    ibrPovertyMultiplier: 1.5,
    refinanceRate: 0.05,
  },
  tax: {
    brackets: [
      { upperLimit: 11600, rate: 0.10 },
      { upperLimit: 47150, rate: 0.12 },
      { upperLimit: 100525, rate: 0.22 },
      { upperLimit: 191950, rate: 0.24 },
      { upperLimit: 243725, rate: 0.32 },
      { upperLimit: 609350, rate: 0.35 },
      { upperLimit: 999999999, rate: 0.37 },
    ],
    standardDeduction: 14600,
    stateLocalTaxRate: 0.06,
    ficaRate: 0.0765,
    ficaCap: 168600,
    additionalMedicareTax: 0.009,
    additionalMedicareThreshold: 200000,
  },
  lifestyle: {
    livingCostResidency: 48000,
    livingCostAttendingHighCOL: 72000,
    livingCostAttendingLowCOL: 48000,
    colInflation: 0.03,
    healthInsurance: 8000,
    disabilityInsurance: 5000,
    retirementContributionPercent: 0.15,
    retirementStartAge: 30,
    expectedInvestmentReturn: 0.07,
    inflationRate: 0.03,
    discountRate: 0.05,
    colRegion: 1,
  },
  business: {
    enabled: false,
    startupCapital: 50000,
    year1Revenue: 30000,
    year2Revenue: 75000,
    year3Revenue: 150000,
    year4Revenue: 250000,
    year5PlusGrowthRate: 0.15,
    revenueCeiling: 1000000,
    opexPercentOfRevenue: 0.40,
    ownersDrawPercent: 0.80,
    failureProbability: 0.30,
    pivotSalary: 120000,
    sideBusinessRevYear1: 10000,
    sideBusinessGrowthRate: 0.25,
    sideBusinessHoursPerWeek: 10,
  },
};

export const DEFAULT_PATHS: PathConfig[] = [
  {
    id: "path-1",
    label: "Emergency Medicine",
    specialtyKey: "emergency-medicine",
    includeBusiness: false,
  },
  {
    id: "path-2",
    label: "Cardiology",
    specialtyKey: "cardiology",
    includeBusiness: false,
  },
];

export function createNewPath(index: number): PathConfig {
  return {
    id: `path-${Date.now()}-${index}`,
    label: `Path ${index}`,
    specialtyKey: "internal-medicine",
    includeBusiness: false,
  };
}
