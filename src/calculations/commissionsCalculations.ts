import { SalaryFrequency, CalculationDetails, IncomeType } from '../types';
import { 
  getFrequencyMultiplier, 
  calculatePayCycles
} from './baseCalculations';
import { getCurrentFyStartDate, parseDate } from '../utils/dateUtils';
import { validateEmploymentBasedIncome, validatePayCycles, validatePositiveCalculation } from '../utils/businessRuleValidation';
import { BUSINESS_CONSTANTS } from '../config/businessConstants';

export interface CommissionsCalculationInput {
  salaryFrequency: SalaryFrequency;
  baseIncome: number;
  endDateLatestPayslip: string;
  employmentStartDate: string;
  ytdAmountLatestPayslip: number;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
  actualYtdCommission?: number; // ONLY income type with actual YTD field
}

export interface CommissionsCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

/**
 * Calculate allowable COMMISSIONS income amount
 * 
 * Priority Order (3-TIER - ONLY income type with actual YTD):
 * 1. Actual YTD Commission (if provided)
 * 2. Annual Override Amount (if provided)  
 * 3. Calculated Amount (12-month rolling calculation)
 * 
 * Business Rules:
 * - Employment duration must be ≥ 180 days OR annualOverrideAmount provided
 * - Last FY income required if payslip < 12 months into FY (more restrictive than others)
 * - 12-month rolling calculation across FY boundaries
 */
export function calculateCommissionsIncome(input: CommissionsCalculationInput): CommissionsCalculationResult {
  const {
    salaryFrequency,
    baseIncome,
    endDateLatestPayslip,
    employmentStartDate,
    ytdAmountLatestPayslip,
    lastFyAnnualIncome,
    annualOverrideAmount,
    actualYtdCommission
  } = input;

  // Comprehensive business rule validation for COMMISSIONS income
  validateEmploymentBasedIncome({
    incomeType: IncomeType.COMMISSIONS,
    verificationMethod: undefined, // COMMISSIONS doesn't use verification method
    endDateLatestPayslip,
    employmentStartDate,
    lastFyAnnualIncome,
    annualOverrideAmount,
    requiredMonthsForLastFy: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.COMMISSIONS
  });

  // Parse dates after validation (using simplified date utils)
  const payslipDate = parseDate(endDateLatestPayslip);
  const employmentStart = parseDate(employmentStartDate);
  const currentFyStart = parseDate(getCurrentFyStartDate(endDateLatestPayslip));

  // Calculate base salary components (same as OVERTIME)
  const frequencyMultiplier = getFrequencyMultiplier(salaryFrequency);
  const annualBaseSalary = baseIncome * frequencyMultiplier;

  // Calculate pay cycles from employment period 
  // Per requirement: Use "End date on latest payslip" as-is (not extend through month)
  const daysPayCycleConversion = calculatePayCycles(
    employmentStart,
    payslipDate,
    currentFyStart,
    salaryFrequency
  );

  // Validate pay cycles calculation
  validatePayCycles(daysPayCycleConversion, endDateLatestPayslip, employmentStartDate);

  // Calculate expected YTD base salary
  const expectedYtdBaseSalary = baseIncome * daysPayCycleConversion;

  // Calculate average amount per pay cycle
  const averageAmountPerPayCycle = ytdAmountLatestPayslip / daysPayCycleConversion;

  // Calculate commission component (amount less base income)
  const averageAmountLessBaseIncomeAnnual = (averageAmountPerPayCycle - baseIncome) * frequencyMultiplier;
  
  // Validate that commission calculation is not negative
  validatePositiveCalculation(averageAmountLessBaseIncomeAnnual, 'averageAmountLessBaseIncomeAnnual');
  
  const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;

  // COMMISSIONS-specific: 12-month rolling calculation
  const twelveMonthRollingSum = calculate12MonthRollingCommission(
    endDateLatestPayslip,
    getCurrentFyStartDate(endDateLatestPayslip),
    averageAmountLessBaseIncomeMonthly,
    lastFyAnnualIncome,
    annualBaseSalary
  );

  // Note: Last FY income requirement validation is now handled by validateEmploymentBasedIncome above

  // Apply 3-tier priority order: Actual YTD Commission → Override → Calculated
  let finalAmount: number;
  
  if (actualYtdCommission !== undefined && actualYtdCommission > 0) {
    // Priority 1: Actual YTD Commission (ONLY available for COMMISSIONS)
    finalAmount = actualYtdCommission;
  } else if (annualOverrideAmount !== undefined && annualOverrideAmount > 0) {
    // Priority 2: Annual Override Amount
    finalAmount = annualOverrideAmount;
  } else {
    // Priority 3: 12-month rolling calculation
    finalAmount = Math.max(0, twelveMonthRollingSum);
  }

  return {
    allowableAnnualIncome: finalAmount,
    calculationDetails: {
      annualBaseSalary,
      expectedYtdBaseSalary,
      daysPayCycleConversion,
      averageAmountPerPayCycle,
      averageAmountLessBaseIncomeAnnual,
      averageAmountLessBaseIncomeMonthly
    },
    eligible: true
  };
}

/**
 * Calculate 12-month rolling commission sum
 * This is the complex part specific to COMMISSIONS income type
 */
function calculate12MonthRollingCommission(
  payslipDateStr: string,
  currentFyStartStr: string,
  currentFyMonthlyCommission: number,
  lastFyAnnualIncome?: number,
  annualBaseSalary?: number
): number {
  // Convert strings to Date objects for calculation
  const payslipDate = parseDate(payslipDateStr);
  const currentFyStart = parseDate(currentFyStartStr);
  
  // Generate 12-month period ending with month prior to payslip month
  const endMonth = new Date(payslipDate);
  endMonth.setDate(1); // First day of payslip month
  endMonth.setMonth(endMonth.getMonth() - 1); // Move to prior month
  
  const startMonth = new Date(endMonth);
  startMonth.setMonth(startMonth.getMonth() - 11); // 12 months total
  
  let rollingSum = 0;
  
  // Iterate through each month in the 12-month period
  const currentMonth = new Date(startMonth);
  
  for (let i = 0; i < 12; i++) {
    if (currentMonth >= currentFyStart) {
      // Month is in current FY - use calculated monthly commission
      rollingSum += currentFyMonthlyCommission;
    } else {
      // Month is in prior FY - use last FY data
      if (lastFyAnnualIncome !== undefined && annualBaseSalary !== undefined) {
        const lastFyCommissionAnnual = Math.max(0, lastFyAnnualIncome - annualBaseSalary);
        const lastFyCommissionMonthly = lastFyCommissionAnnual / 12;
        rollingSum += lastFyCommissionMonthly;
      }
      // If no last FY data, month contributes 0 to rolling sum
    }
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  return rollingSum;
} 