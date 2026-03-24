import { Assumptions, PathConfig, PathResult, YearData } from "./types";
import { SPECIALTIES } from "./specialties";

function calculateFederalTax(taxableIncome: number, assumptions: Assumptions): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let prevLimit = 0;
  for (const bracket of assumptions.tax.brackets) {
    const taxableInBracket = Math.min(taxableIncome, bracket.upperLimit) - prevLimit;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
    prevLimit = bracket.upperLimit;
    if (taxableIncome <= bracket.upperLimit) break;
  }
  return tax;
}

function calculateFICA(grossIncome: number, assumptions: Assumptions): number {
  if (grossIncome <= 0) return 0;
  const ssTax = Math.min(grossIncome, assumptions.tax.ficaCap) * 0.062;
  const medicareTax = grossIncome * 0.0145;
  const additionalMedicare =
    grossIncome > assumptions.tax.additionalMedicareThreshold
      ? (grossIncome - assumptions.tax.additionalMedicareThreshold) * assumptions.tax.additionalMedicareTax
      : 0;
  return ssTax + medicareTax + additionalMedicare;
}

function calculateTotalDebtAtGraduation(assumptions: Assumptions): number {
  const { education, loans } = assumptions;
  const rate = loans.blendedRate;
  let debt = 0;
  const tuitions = [education.year1Tuition, education.year2Tuition, education.year3Tuition, education.year4Tuition];
  const living = education.annualLivingExpensesMedSchool;
  // For already-completed years, debt has been accumulating
  // Simplified: assume all remaining years contribute to debt
  for (let y = 0; y < 4; y++) {
    const yearCost = tuitions[y] * Math.pow(1 + education.tuitionInflationRate, y) + living;
    const yearsOfInterest = 4 - y;
    debt += yearCost * Math.pow(1 + rate, yearsOfInterest);
  }
  // Simplify to match the spreadsheet's approach
  // Total debt = sum of (tuition + living) with interest accrual
  return debt;
}

function calculateStandardLoanPayment(principal: number, rate: number, years: number): number {
  if (principal <= 0 || rate <= 0 || years <= 0) return 0;
  const n = years;
  const payment = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  return payment;
}

export function runProjection(
  pathConfig: PathConfig,
  assumptions: Assumptions
): PathResult {
  const specialty = SPECIALTIES[pathConfig.specialtyKey];
  if (!specialty) throw new Error(`Unknown specialty: ${pathConfig.specialtyKey}`);

  const { personal, loans, lifestyle, tax: _tax, business } = assumptions;
  const horizon = personal.analysisHorizon;
  const ageAtGraduation = personal.currentAge + personal.yearsRemainingInMedSchool;

  // Merge overrides
  const attendingSalaryYear1 = pathConfig.overrides?.attendingSalaryYear1 ?? specialty.attendingSalaryYear1;
  const attendingSalaryGrowthRate = pathConfig.overrides?.attendingSalaryGrowthRate ?? specialty.attendingSalaryGrowthRate;
  const attendingSalaryCap = pathConfig.overrides?.attendingSalaryCap ?? specialty.attendingSalaryCap;
  const moonlightingIncome = pathConfig.overrides?.moonlightingIncome ?? specialty.moonlightingIncome;
  const signingBonus = pathConfig.overrides?.signingBonus ?? specialty.signingBonus;
  const malpracticeInsurance = pathConfig.overrides?.malpracticeInsurance ?? specialty.malpracticeInsurance;

  const totalDebt = calculateTotalDebtAtGraduation(assumptions);
  const residencyYears = specialty.residencyYears;
  const fellowshipYears = specialty.fellowshipYears;
  const totalTrainingYears = specialty.totalTrainingYears;
  const isBusinessOnly = pathConfig.specialtyKey === "business-only";

  // Standard loan payment: starts at graduation, 20yr term
  const standardPayment = calculateStandardLoanPayment(totalDebt, loans.blendedRate, loans.standardRepaymentTerm);

  const livingCostAttending =
    lifestyle.colRegion === 1 ? lifestyle.livingCostAttendingHighCOL : lifestyle.livingCostAttendingLowCOL;

  const years: YearData[] = [];

  let cumulativeDisposableStd = 0;
  let cumulativeDisposablePslf = 0;
  let prevInvestmentEOY = 0;

  // Loan tracking
  let loanBalStd = totalDebt;
  let loanBalPslf = totalDebt;
  let ibrQualifyingCount = 0;
  let pslfForgiven = false;
  let stdLoanDone = false;

  // Business revenue tracking
  let businessRevenue = 0;

  for (let y = 1; y <= horizon; y++) {
    const calendarYear = personal.modelStartYear + y - 1;
    const age = personal.currentAge + y - 1;
    const yearsSinceGrad = age - ageAtGraduation;

    // Determine phase
    let phase: YearData["phase"];
    if (yearsSinceGrad < 0) {
      phase = "Med School";
    } else if (yearsSinceGrad < residencyYears) {
      phase = "Residency";
    } else if (yearsSinceGrad < totalTrainingYears) {
      phase = "Fellowship";
    } else {
      phase = "Attending";
    }

    // INCOME
    let medicalSalary = 0;
    let moonlighting = 0;
    let signing = 0;
    let businessIncome = 0;

    if (phase === "Residency") {
      const resYear = yearsSinceGrad;
      medicalSalary = specialty.residentSalaryYear1 * Math.pow(1 + specialty.residentAnnualRaise, resYear);
      moonlighting = moonlightingIncome;
    } else if (phase === "Fellowship") {
      const fellowYear = yearsSinceGrad - residencyYears;
      medicalSalary = specialty.fellowSalaryYear1 * Math.pow(1 + specialty.residentAnnualRaise, fellowYear);
    } else if (phase === "Attending") {
      const attendingYear = yearsSinceGrad - totalTrainingYears;
      if (attendingYear === 0) signing = signingBonus;
      medicalSalary = Math.min(
        attendingSalaryYear1 * Math.pow(1 + attendingSalaryGrowthRate, attendingYear),
        attendingSalaryCap
      );
    }

    // Business income
    if (pathConfig.includeBusiness || isBusinessOnly) {
      const businessStartYear = isBusinessOnly
        ? personal.yearsRemainingInMedSchool // starts right after med school
        : personal.yearsRemainingInMedSchool; // side biz starts during residency

      const bizYearIndex = y - businessStartYear; // 1-indexed year of business

      if (isBusinessOnly && bizYearIndex >= 1) {
        // Full business path
        if (bizYearIndex === 1) businessRevenue = business.year1Revenue;
        else if (bizYearIndex === 2) businessRevenue = business.year2Revenue;
        else if (bizYearIndex === 3) businessRevenue = business.year3Revenue;
        else if (bizYearIndex === 4) businessRevenue = business.year4Revenue;
        else {
          businessRevenue = Math.min(
            businessRevenue * (1 + business.year5PlusGrowthRate),
            business.revenueCeiling
          );
        }
        const netProfit = businessRevenue * (1 - business.opexPercentOfRevenue);
        businessIncome = netProfit * business.ownersDrawPercent;
      } else if (!isBusinessOnly && pathConfig.includeBusiness) {
        // Side business
        if (bizYearIndex >= 1) {
          if (bizYearIndex === 1) {
            businessRevenue = business.sideBusinessRevYear1;
          } else {
            businessRevenue = businessRevenue * (1 + business.sideBusinessGrowthRate);
          }
          // During training, it's limited. As attending, it can grow more.
          const netProfit = businessRevenue * (1 - business.opexPercentOfRevenue);
          businessIncome = netProfit * business.ownersDrawPercent;
        }
      }
    }

    const totalGrossIncome = medicalSalary + moonlighting + signing + businessIncome;

    // TAXES
    const taxableIncome = Math.max(0, totalGrossIncome - assumptions.tax.standardDeduction);
    const federalTax = calculateFederalTax(taxableIncome, assumptions);
    const stateLocalTax = taxableIncome * assumptions.tax.stateLocalTaxRate;
    const fica = calculateFICA(totalGrossIncome, assumptions);
    const totalTaxes = federalTax + stateLocalTax + fica;
    const effectiveTaxRate = totalGrossIncome > 0 ? totalTaxes / totalGrossIncome : 0;
    const netIncomeAfterTax = totalGrossIncome - totalTaxes;

    // EXPENSES
    const inflationFactor = Math.pow(1 + lifestyle.colInflation, y - 1);
    let livingExpenses: number;
    if (phase === "Med School") {
      livingExpenses = lifestyle.livingCostResidency * inflationFactor;
    } else if (phase === "Residency" || phase === "Fellowship") {
      livingExpenses = lifestyle.livingCostResidency * inflationFactor;
    } else {
      livingExpenses = livingCostAttending * inflationFactor;
    }

    const malpractice = phase === "Attending" ? malpracticeInsurance * inflationFactor : 0;
    const healthIns = (phase === "Attending" || (isBusinessOnly && yearsSinceGrad >= 0))
      ? lifestyle.healthInsurance * inflationFactor
      : 0;
    const disabilityIns = (phase === "Residency" || phase === "Fellowship" || phase === "Attending")
      ? lifestyle.disabilityInsurance * inflationFactor
      : 0;

    // Business startup costs
    let businessStartupCosts = 0;
    if (pathConfig.includeBusiness || isBusinessOnly) {
      const businessStartYear = personal.yearsRemainingInMedSchool;
      if (y === businessStartYear + 1) {
        businessStartupCosts = isBusinessOnly ? business.startupCapital : business.startupCapital * 0.3;
      }
    }

    const totalExpenses = livingExpenses + malpractice + healthIns + disabilityIns + businessStartupCosts;

    // LOAN REPAYMENT - Standard
    const loanBalanceBOYStd = loanBalStd;
    const interestStd = loanBalStd > 0 ? loanBalStd * loans.blendedRate : 0;
    let paymentStd = 0;
    if (yearsSinceGrad >= 0 && !stdLoanDone) {
      paymentStd = standardPayment;
      const newBal = loanBalStd + interestStd - paymentStd;
      if (newBal <= 0) {
        paymentStd = loanBalStd + interestStd;
        loanBalStd = 0;
        stdLoanDone = true;
      } else {
        loanBalStd = newBal;
      }
    } else {
      loanBalStd = loanBalStd + interestStd;
    }
    const loanBalanceEOYStd = loanBalStd;

    // LOAN REPAYMENT - PSLF/IBR
    const loanBalanceBOYPslf = loanBalPslf;
    const interestPslf = loanBalPslf > 0 ? loanBalPslf * loans.blendedRate : 0;
    let ibrPayment = 0;
    let pslfForgivenessEvent = 0;

    if (yearsSinceGrad >= 0 && !pslfForgiven && loanBalPslf > 0) {
      ibrQualifyingCount++;
      // IBR payment = 10% of (AGI - 150% poverty line)
      const discretionaryIncome = totalGrossIncome - loans.ibrPovertyLineBase * loans.ibrPovertyMultiplier;
      ibrPayment = Math.max(0, discretionaryIncome * loans.ibrPaymentPercent);

      // Cap IBR payment at standard payment
      ibrPayment = Math.min(ibrPayment, standardPayment);

      if (ibrQualifyingCount >= loans.pslfForgivenessYear) {
        // PSLF forgiveness!
        pslfForgivenessEvent = loanBalPslf + interestPslf - ibrPayment;
        loanBalPslf = 0;
        pslfForgiven = true;
        ibrPayment = ibrPayment; // last payment
      } else {
        loanBalPslf = loanBalPslf + interestPslf - ibrPayment;
      }
    } else if (!pslfForgiven) {
      loanBalPslf = loanBalPslf + interestPslf;
    }
    const loanBalanceEOYPslf = loanBalPslf;

    // RETIREMENT & INVESTMENT
    let retirementContribution = 0;
    if (age >= lifestyle.retirementStartAge && totalGrossIncome > 0) {
      retirementContribution = totalGrossIncome * lifestyle.retirementContributionPercent;
    }

    const investmentBOY = prevInvestmentEOY;
    const investmentEOY = (investmentBOY + retirementContribution) * (1 + lifestyle.expectedInvestmentReturn);
    prevInvestmentEOY = investmentEOY;

    // CASH FLOW
    const disposableStd = netIncomeAfterTax - totalExpenses - paymentStd - retirementContribution;
    const disposablePslf = netIncomeAfterTax - totalExpenses - ibrPayment - retirementContribution;
    cumulativeDisposableStd += disposableStd;
    cumulativeDisposablePslf += disposablePslf;

    // NET WORTH
    const netWorthStd = investmentEOY + cumulativeDisposableStd - loanBalanceEOYStd;
    const netWorthPslf = investmentEOY + cumulativeDisposablePslf - loanBalanceEOYPslf;

    // DCF
    const discountFactor = Math.pow(1 + lifestyle.discountRate, y);
    const dcfStd = disposableStd / discountFactor;
    const dcfPslf = disposablePslf / discountFactor;

    years.push({
      yearOfAnalysis: y,
      calendarYear,
      age,
      phase,
      medicalSalary,
      moonlightingIncome: moonlighting,
      signingBonus: signing,
      businessIncome,
      totalGrossIncome,
      taxableIncome,
      federalIncomeTax: federalTax,
      stateLocalTax,
      fica,
      totalTaxes,
      effectiveTaxRate,
      netIncomeAfterTax,
      livingExpenses,
      malpracticeInsurance: malpractice,
      healthInsurance: healthIns,
      disabilityInsurance: disabilityIns,
      businessStartupCosts,
      totalExpenses,
      loanBalanceBOYStd: loanBalanceBOYStd,
      interestAccruedStd: interestStd,
      loanPaymentStd: paymentStd,
      loanBalanceEOYStd: loanBalanceEOYStd,
      loanBalanceBOYPslf: loanBalanceBOYPslf,
      ibrQualifyingCount: yearsSinceGrad >= 0 ? ibrQualifyingCount : 0,
      ibrPayment,
      pslfForgivenessEvent,
      loanBalanceEOYPslf: loanBalanceEOYPslf,
      retirementContribution,
      investmentPortfolioBOY: investmentBOY,
      investmentPortfolioEOY: investmentEOY,
      disposableIncomeStd: disposableStd,
      disposableIncomePslf: disposablePslf,
      cumulativeDisposableStd,
      cumulativeDisposablePslf,
      netWorthStd,
      netWorthPslf,
      dcfStd,
      dcfPslf,
    });
  }

  // Summary metrics
  const npvStd = years.reduce((sum, y) => sum + y.dcfStd, 0);
  const npvPslf = years.reduce((sum, y) => sum + y.dcfPslf, 0);

  const yr10 = years[9];
  const yr20 = years[19];
  const yr30 = years[horizon - 1];

  const totalGrossEarnings = years.reduce((s, y) => s + y.totalGrossIncome, 0);
  const totalTaxesPaid = years.reduce((s, y) => s + y.totalTaxes, 0);
  const totalLoanPaymentsStd = years.reduce((s, y) => s + y.loanPaymentStd, 0);
  const totalLoanPaymentsPslf = years.reduce((s, y) => s + y.ibrPayment, 0);
  const pslfForgivenessAmount = years.reduce((s, y) => s + y.pslfForgivenessEvent, 0);

  // Break-even: first year net worth goes positive (std)
  let breakEvenYearStd: number | null = null;
  let breakEvenAgeStd: number | null = null;
  for (const y of years) {
    if (y.netWorthStd > 0 && breakEvenYearStd === null) {
      breakEvenYearStd = y.yearOfAnalysis;
      breakEvenAgeStd = y.age;
      break;
    }
  }

  return {
    config: pathConfig,
    years,
    npvStd,
    npvPslf,
    netWorth10Std: yr10?.netWorthStd ?? 0,
    netWorth20Std: yr20?.netWorthStd ?? 0,
    netWorth30Std: yr30?.netWorthStd ?? 0,
    netWorth10Pslf: yr10?.netWorthPslf ?? 0,
    netWorth20Pslf: yr20?.netWorthPslf ?? 0,
    netWorth30Pslf: yr30?.netWorthPslf ?? 0,
    totalGrossEarnings,
    totalTaxesPaid,
    totalLoanPaymentsStd,
    totalLoanPaymentsPslf,
    pslfForgivenessAmount,
    investmentPortfolioFinal: yr30?.investmentPortfolioEOY ?? 0,
    breakEvenYearStd,
    breakEvenAgeStd,
  };
}
