import { SalaryFrequency, CalculationDetails, IncomeType, VerificationMethod } from '../types';
import { 
  getFrequencyMultiplier, 
  calculatePayCycles
} from './baseCalculations';
import { parseDate, getCurrentFyStartDate } from '../utils/dateUtils';
import { validateEmploymentBasedIncome, validatePayCycles, validatePositiveCalculation } from '../utils/businessRuleValidation';
import { BUSINESS_CONSTANTS } from '../config/businessConstants';

// Unified input interface that covers all income types
export interface UnifiedIncomeCalculationInput {
  incomeType: IncomeType;
  salaryFrequency: SalaryFrequency;
  endDateLatestPayslip: string;
  employmentStartDate: string;
  ytdAmountLatestPayslip: number;
  baseIncome?: number; // Required for OVERTIME/COMMISSIONS, not used for CASUAL/CONTRACT
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
  actualYtdCommission?: number; // Only for COMMISSIONS
  verificationMethod?: VerificationMethod; // Only for OVERTIME
}

// Configuration interface for income type-specific behavior
export interface IncomeCalculationConfig {
  incomeType: IncomeType;
  hasBaseIncome: boolean;
  lastFyRequiredMonths: number;
  priorityTiers: ('actualYtd' | 'override' | 'calculated')[];
  specialCalculation?: 'rolling12Month' | 'rolling6Month' | 'standard';
  allowsVerificationMethod: boolean;
}

// Unified result interface
export interface UnifiedIncomeCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

// Employment-based income types that use unified calculation
type EmploymentBasedIncomeType = IncomeType.OVERTIME | IncomeType.CASUAL | IncomeType.CONTRACT_VARIABLE | IncomeType.COMMISSIONS;

// Configuration registry for employment-based income types
export const INCOME_CALCULATION_CONFIGS: Record<EmploymentBasedIncomeType, IncomeCalculationConfig> = {
  [IncomeType.OVERTIME]: {
    incomeType: IncomeType.OVERTIME,
    hasBaseIncome: true,
    lastFyRequiredMonths: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD,
    priorityTiers: ['override', 'calculated'],
    specialCalculation: 'rolling6Month',
    allowsVerificationMethod: true
  },
  [IncomeType.CASUAL]: {
    incomeType: IncomeType.CASUAL,
    hasBaseIncome: false,
    lastFyRequiredMonths: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD,
    priorityTiers: ['override', 'calculated'],
    specialCalculation: 'rolling6Month',
    allowsVerificationMethod: false
  },
  [IncomeType.CONTRACT_VARIABLE]: {
    incomeType: IncomeType.CONTRACT_VARIABLE,
    hasBaseIncome: false,
    lastFyRequiredMonths: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.STANDARD,
    priorityTiers: ['override', 'calculated'],
    specialCalculation: 'rolling6Month',
    allowsVerificationMethod: false
  },
  [IncomeType.COMMISSIONS]: {
    incomeType: IncomeType.COMMISSIONS,
    hasBaseIncome: true,
    lastFyRequiredMonths: BUSINESS_CONSTANTS.LAST_FY_REQUIRED_MONTHS.COMMISSIONS,
    priorityTiers: ['actualYtd', 'override', 'calculated'],
    specialCalculation: 'rolling12Month',
    allowsVerificationMethod: false
  },
  // Note: BONUS and INVESTMENT income types use separate annual income calculation
  // due to fundamentally different business logic (annual comparisons vs employment-based)
};

/**
 * Unified income calculation engine that handles all income types
 * through configuration-driven logic
 */
export function calculateIncomeUnified(
  input: UnifiedIncomeCalculationInput,
  config?: IncomeCalculationConfig
): UnifiedIncomeCalculationResult {
  // Use config from registry if not provided
  const calculationConfig = config || INCOME_CALCULATION_CONFIGS[input.incomeType as EmploymentBasedIncomeType];
  
  try {
    // Comprehensive business rule validation
    validateEmploymentBasedIncome({
      incomeType: input.incomeType,
      verificationMethod: calculationConfig.allowsVerificationMethod ? input.verificationMethod : undefined,
      endDateLatestPayslip: input.endDateLatestPayslip,
      employmentStartDate: input.employmentStartDate,
      lastFyAnnualIncome: input.lastFyAnnualIncome,
      annualOverrideAmount: input.annualOverrideAmount,
      requiredMonthsForLastFy: calculationConfig.lastFyRequiredMonths
    });

    // Core calculation steps (unified across all types)
    const coreCalculation = performCoreCalculation(input, calculationConfig);
    
    // Apply income type-specific calculation logic
    const finalCalculatedAmount = applySpecialCalculationLogic(
      input, 
      calculationConfig, 
      coreCalculation
    );
    
    // Apply priority order to determine final amount
    const finalAmount = applyPriorityOrder(input, calculationConfig, finalCalculatedAmount);

    return {
      allowableAnnualIncome: finalAmount,
      calculationDetails: coreCalculation.calculationDetails,
      eligible: finalAmount >= 0
    };
  } catch (error: any) {
    // Handle employment duration errors specially - return ineligible result instead of throwing
    if (error.message && error.message.includes('Employment duration')) {
      // Return ineligible result with zero income for employment duration issues
      return {
        allowableAnnualIncome: 0,
        calculationDetails: {
          annualBaseSalary: 0,
          expectedYtdBaseSalary: 0,
          daysPayCycleConversion: 0,
          averageAmountPerPayCycle: 0,
          averageAmountLessBaseIncomeAnnual: 0,
          averageAmountLessBaseIncomeMonthly: 0
        },
        eligible: false
      };
    }
    
    // Re-throw other validation errors
    throw error;
  }
}

/**
 * Core calculation logic shared across all income types
 */
function performCoreCalculation(
  input: UnifiedIncomeCalculationInput,
  config: IncomeCalculationConfig
) {
  const {
    salaryFrequency,
    endDateLatestPayslip,
    employmentStartDate,
    ytdAmountLatestPayslip,
    baseIncome = 0
  } = input;

  // Parse dates after validation
  const payslipDate = parseDate(endDateLatestPayslip);
  const employmentStart = parseDate(employmentStartDate);
  const currentFyStart = parseDate(getCurrentFyStartDate(endDateLatestPayslip));

  // Calculate base salary components
  const frequencyMultiplier = getFrequencyMultiplier(salaryFrequency);
  const annualBaseSalary = config.hasBaseIncome ? baseIncome * frequencyMultiplier : 0;

  // Calculate pay cycles from employment period
  const daysPayCycleConversion = calculatePayCycles(
    employmentStart,
    payslipDate,
    currentFyStart,
    salaryFrequency
  );

  // Validate pay cycles calculation
  validatePayCycles(daysPayCycleConversion, endDateLatestPayslip, employmentStartDate);

  // Calculate expected YTD base salary
  const expectedYtdBaseSalary = config.hasBaseIncome ? baseIncome * daysPayCycleConversion : 0;

  // Calculate average amount per pay cycle
  const averageAmountPerPayCycle = ytdAmountLatestPayslip / daysPayCycleConversion;

  // Calculate average amount less base income (annual)
  const averageAmountLessBaseIncomeAnnual = config.hasBaseIncome
    ? (averageAmountPerPayCycle - baseIncome) * frequencyMultiplier
    : averageAmountPerPayCycle * frequencyMultiplier;

  // Validate that calculation is not negative
  validatePositiveCalculation(averageAmountLessBaseIncomeAnnual, 'averageAmountLessBaseIncomeAnnual');

  // Calculate monthly equivalent
  const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;

  const calculationDetails: CalculationDetails = {
    annualBaseSalary,
    expectedYtdBaseSalary,
    daysPayCycleConversion,
    averageAmountPerPayCycle,
    averageAmountLessBaseIncomeAnnual,
    averageAmountLessBaseIncomeMonthly
  };

  return {
    calculationDetails,
    baseCalculatedAmount: averageAmountLessBaseIncomeAnnual,
    annualBaseSalary,
    payslipDate,
    currentFyStart: parseDate(getCurrentFyStartDate(endDateLatestPayslip))
  };
}

/**
 * Apply income type-specific calculation logic (e.g., 6-month or 12-month rolling aggregation)
 */
function applySpecialCalculationLogic(
  input: UnifiedIncomeCalculationInput,
  config: IncomeCalculationConfig,
  coreCalculation: any
): number {
  if (config.specialCalculation === 'rolling12Month') {
    // Apply 12-month rolling calculation (COMMISSIONS)
    return calculateRollingAggregation(
      input.endDateLatestPayslip,
      getCurrentFyStartDate(input.endDateLatestPayslip),
      coreCalculation.calculationDetails.averageAmountLessBaseIncomeMonthly!,
      input.lastFyAnnualIncome,
      coreCalculation.annualBaseSalary,
      12 // 12 months
    );
  }
  
  if (config.specialCalculation === 'rolling6Month') {
    // Apply 6-month rolling calculation (OVERTIME, CASUAL, CONTRACT_VARIABLE)
    return calculateRollingAggregation(
      input.endDateLatestPayslip,
      getCurrentFyStartDate(input.endDateLatestPayslip),
      coreCalculation.calculationDetails.averageAmountLessBaseIncomeMonthly!,
      input.lastFyAnnualIncome,
      coreCalculation.annualBaseSalary,
      6 // 6 months
    );
  }

  // Standard calculation - no Last FY constraint needed since aggregation provides sufficient historical data
  return coreCalculation.baseCalculatedAmount;
}

/**
 * Apply priority order based on income type configuration
 */
function applyPriorityOrder(
  input: UnifiedIncomeCalculationInput,
  config: IncomeCalculationConfig,
  calculatedAmount: number
): number {
  // Process priority tiers in order
  for (const tier of config.priorityTiers) {
    switch (tier) {
      case 'actualYtd':
        if (input.actualYtdCommission !== undefined && input.actualYtdCommission > 0) {
          return input.actualYtdCommission;
        }
        break;
      
      case 'override':
        if (input.annualOverrideAmount !== undefined && input.annualOverrideAmount > 0) {
          return input.annualOverrideAmount;
        }
        break;
      
      case 'calculated':
        return Math.max(0, calculatedAmount);
    }
  }

  // Fallback to calculated amount
  return Math.max(0, calculatedAmount);
}

/**
 * Calculate rolling aggregation for specified number of months
 * Used for both 6-month (OVERTIME/CASUAL/CONTRACT) and 12-month (COMMISSIONS) calculations
 */
function calculateRollingAggregation(
  payslipDateStr: string,
  currentFyStartStr: string,
  currentFyMonthlyAmount: number,
  lastFyAnnualIncome?: number,
  annualBaseSalary?: number,
  numberOfMonths: number = 12
): number {
  const payslipDate = parseDate(payslipDateStr);
  const currentFyStart = parseDate(currentFyStartStr);
  
  // Generate period ending with month prior to payslip month
  const endMonth = new Date(payslipDate);
  endMonth.setDate(1);
  endMonth.setMonth(endMonth.getMonth() - 1);
  
  const startMonth = new Date(endMonth);
  startMonth.setMonth(startMonth.getMonth() - (numberOfMonths - 1));
  
  let rollingSum = 0;
  const currentMonth = new Date(startMonth);
  
  for (let i = 0; i < numberOfMonths; i++) {
    if (currentMonth >= currentFyStart) {
      // Month is in current FY - use calculated monthly amount
      rollingSum += currentFyMonthlyAmount;
    } else {
      // Month is in prior FY - use last FY data
      if (lastFyAnnualIncome !== undefined && annualBaseSalary !== undefined) {
        const lastFyAdjustedAnnual = Math.max(0, lastFyAnnualIncome - annualBaseSalary);
        const lastFyMonthlyAmount = lastFyAdjustedAnnual / 12;
        rollingSum += lastFyMonthlyAmount;
      }
      // If no last FY data, month contributes 0 to rolling sum
    }
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  // Annualize the result
  const annualizationFactor = 12 / numberOfMonths;
  return rollingSum * annualizationFactor;
}

// Note: getMonthsSinceFyStart function removed as Last FY constraint logic is no longer needed