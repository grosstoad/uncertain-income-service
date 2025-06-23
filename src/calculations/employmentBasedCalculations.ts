import { SalaryFrequency, CalculationDetails, IncomeType } from '../types';
import { 
  getFrequencyMultiplier, 
  calculatePayCycles
} from './baseCalculations';
import { parseDate } from '../utils/dateUtils';
import { getCurrentFyStartDate } from '../utils/dateUtils';
import { validateEmploymentBasedIncome, validatePayCycles, validatePositiveCalculation } from '../utils/businessRuleValidation';
import { BUSINESS_CONSTANTS } from '../config/businessConstants';

export interface EmploymentBasedCalculationInput {
  incomeType: IncomeType.CASUAL | IncomeType.CONTRACT_VARIABLE;
  salaryFrequency: SalaryFrequency;
  endDateLatestPayslip: string;
  employmentStartDate: string;
  ytdAmountLatestPayslip: number;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
}

export interface EmploymentBasedCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

/**
 * Unified calculation for CASUAL and CONTRACT_VARIABLE income types
 * 
 * These income types share identical business logic:
 * - Priority Order: Annual Override Amount → Calculated Amount
 * - No actualYtdAmount override (unlike COMMISSIONS)
 * - No base salary (unlike OVERTIME)
 * - Same employment duration requirements (≥ 180 days)
 * - Same Last FY Income requirements (< 6 months into FY)
 * 
 * Business Rules:
 * - Employment duration must be ≥ 180 days OR annualOverrideAmount provided
 * - Last FY income required if payslip < 6 months into FY
 * - Entire YTD amount is allowable income (no base salary deduction)
 */
export function calculateEmploymentBasedIncome(input: EmploymentBasedCalculationInput): EmploymentBasedCalculationResult {
  const {
    incomeType,
    salaryFrequency,
    endDateLatestPayslip,
    employmentStartDate,
    ytdAmountLatestPayslip,
    lastFyAnnualIncome,
    annualOverrideAmount
  } = input;

  // Comprehensive business rule validation
  validateEmploymentBasedIncome({
    incomeType,
    verificationMethod: undefined, // These types don't use verification method
    endDateLatestPayslip,
    employmentStartDate,
    lastFyAnnualIncome,
    annualOverrideAmount,
    requiredMonthsForLastFy: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD
  });

  // Parse dates after validation (using simplified date utils)
  const payslipDate = parseDate(endDateLatestPayslip);
  const employmentStart = parseDate(employmentStartDate);
  const currentFyStart = parseDate(getCurrentFyStartDate(endDateLatestPayslip));

  // Get frequency multiplier
  const frequencyMultiplier = getFrequencyMultiplier(salaryFrequency);

  // Calculate pay cycles from employment period
  const daysPayCycleConversion = calculatePayCycles(
    employmentStart,
    payslipDate,
    currentFyStart,
    salaryFrequency
  );

  // Validate pay cycles calculation
  validatePayCycles(daysPayCycleConversion, endDateLatestPayslip, employmentStartDate);

  // Calculate average amount per pay cycle
  const averageAmountPerPayCycle = ytdAmountLatestPayslip / daysPayCycleConversion;

  // For these income types, the entire amount is allowable (no base salary to subtract)
  const averageAmountLessBaseIncomeAnnual = averageAmountPerPayCycle * frequencyMultiplier;
  
  // Validate that calculation is not negative
  validatePositiveCalculation(averageAmountLessBaseIncomeAnnual, 'averageAmountLessBaseIncomeAnnual');
  
  const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;

  // Calculate final annual amount using priority order
  let calculatedAnnualAmount = averageAmountLessBaseIncomeAnnual;

  // Apply Last FY Income constraint if applicable (< standard months into FY and lastFyAnnualIncome provided)
  const requiredMonthsIntoFy = parseDate(getCurrentFyStartDate(endDateLatestPayslip));
  requiredMonthsIntoFy.setMonth(requiredMonthsIntoFy.getMonth() + BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD);
  
  if (payslipDate < requiredMonthsIntoFy && lastFyAnnualIncome !== undefined) {
    // Use the lower of calculated amount or last FY amount
    calculatedAnnualAmount = Math.min(calculatedAnnualAmount, lastFyAnnualIncome);
  }

  // Apply priority order: Override → Calculated (NO actualYtdAmount for these types)
  let finalAmount: number;
  
  if (annualOverrideAmount !== undefined && annualOverrideAmount > 0) {
    finalAmount = annualOverrideAmount;
  } else {
    finalAmount = Math.max(0, calculatedAnnualAmount);
  }

  return {
    allowableAnnualIncome: finalAmount,
    calculationDetails: {
      annualBaseSalary: 0, // No base salary for these income types
      expectedYtdBaseSalary: 0, // No base salary for these income types
      daysPayCycleConversion,
      averageAmountPerPayCycle,
      averageAmountLessBaseIncomeAnnual,
      averageAmountLessBaseIncomeMonthly
    },
    eligible: true
  };
}

/**
 * Calculate CASUAL income - delegates to unified function
 */
export function calculateCasualIncome(input: Omit<EmploymentBasedCalculationInput, 'incomeType'>): EmploymentBasedCalculationResult {
  return calculateEmploymentBasedIncome({ ...input, incomeType: IncomeType.CASUAL });
}

/**
 * Calculate CONTRACT_VARIABLE income - delegates to unified function
 */
export function calculateContractVariableIncome(input: Omit<EmploymentBasedCalculationInput, 'incomeType'>): EmploymentBasedCalculationResult {
  return calculateEmploymentBasedIncome({ ...input, incomeType: IncomeType.CONTRACT_VARIABLE });
} 