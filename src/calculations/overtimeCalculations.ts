import { OvertimeRequest, CalculationDetails, IncomeType } from '../types';
import { 
  getFrequencyMultiplier, 
  calculateAnnualBaseSalary, 
  calculateDaysPayCycleConversion 
} from './baseCalculations';
import { monthsSinceFyStart } from '../utils/dateUtils';
import { validateEmploymentBasedIncome, validatePayCycles, validatePositiveCalculation } from '../utils/businessRuleValidation';
import { BUSINESS_CONSTANTS } from '../config/businessConstants';

interface OvertimeCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

/**
 * Calculate allowable OVERTIME income amount
 * 
 * Priority Order (CORRECTED):
 * 1. Annual Override Amount (if provided)
 * 2. Calculated Amount (formula-based)
 * 
 * Note: OVERTIME income does NOT have actualYtdAmount override
 */
export function calculateOvertimeIncome(request: OvertimeRequest): OvertimeCalculationResult {
  const {
    salaryFrequency,
    baseIncome,
    endDateLatestPayslip,
    employmentStartDate,
    ytdAmountLatestPayslip,
    lastFyAnnualIncome,
    annualOverrideAmount,
    verificationMethod
  } = request;

  // Comprehensive business rule validation for OVERTIME income
  validateEmploymentBasedIncome({
    incomeType: IncomeType.OVERTIME,
    verificationMethod,
    endDateLatestPayslip,
    employmentStartDate,
    lastFyAnnualIncome,
    annualOverrideAmount,
    requiredMonthsForLastFy: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD
  });

  // Step 1: Calculate annual base salary
  const annualBaseSalary = calculateAnnualBaseSalary(baseIncome, salaryFrequency);

  // Step 2: Calculate days pay cycle conversion
  const daysPayCycleConversion = calculateDaysPayCycleConversion(
    endDateLatestPayslip,
    employmentStartDate,
    salaryFrequency,
  );

  // Validate pay cycles calculation
  validatePayCycles(daysPayCycleConversion, endDateLatestPayslip, employmentStartDate);

  // Step 3: Calculate expected YTD base salary
  const expectedYtdBaseSalary = baseIncome * daysPayCycleConversion;

  // Step 4: Calculate average amount per pay cycle
  const averageAmountPerPayCycle = daysPayCycleConversion > 0 
    ? ytdAmountLatestPayslip / daysPayCycleConversion 
    : 0;

  // Step 5: Calculate average amount less base income (annual)
  const frequencyMultiplier = getFrequencyMultiplier(salaryFrequency);
  const averageAmountLessBaseIncomeAnnual = (averageAmountPerPayCycle - baseIncome) * frequencyMultiplier;

  // Validate that overtime calculation is not negative
  validatePositiveCalculation(averageAmountLessBaseIncomeAnnual, 'averageAmountLessBaseIncomeAnnual');

  // Step 6: Calculate average amount less base income (monthly)
  const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;

  // Step 7: Apply priority order for final calculation (CORRECTED - No actualYtdAmount)
  let allowableAnnualIncome: number;

  // Priority 1: Annual Override Amount
  if (annualOverrideAmount && annualOverrideAmount > 0) {
    allowableAnnualIncome = annualOverrideAmount;
  }
  // Priority 2: Calculated Amount with Last FY constraint check
  else {
    let calculatedAmount = averageAmountLessBaseIncomeAnnual;

    // Check if Last FY Annual Income is required and constrains the result
    const monthsIntoFy = monthsSinceFyStart(endDateLatestPayslip);
    const isLastFyRequired = monthsIntoFy < BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD;

    if (isLastFyRequired && lastFyAnnualIncome !== undefined) {
      const lastFyAdjustedAmount = Math.max(0, lastFyAnnualIncome - annualBaseSalary);
      if (lastFyAdjustedAmount < calculatedAmount) {
        calculatedAmount = lastFyAdjustedAmount;
      }
    }

    allowableAnnualIncome = Math.max(0, calculatedAmount);
  }

  // Step 8: Determine eligibility
  // Basic eligibility check - more comprehensive checks would be in eligibilityRules.ts
  const eligible = allowableAnnualIncome >= 0;

  const calculationDetails: CalculationDetails = {
    annualBaseSalary,
    expectedYtdBaseSalary,
    daysPayCycleConversion,
    averageAmountPerPayCycle,
    averageAmountLessBaseIncomeAnnual,
    averageAmountLessBaseIncomeMonthly,
  };

  return {
    allowableAnnualIncome,
    calculationDetails,
    eligible,
  };
} 