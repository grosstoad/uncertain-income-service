import { BusinessLogicError } from './BusinessLogicError';
import { parseDate, getCurrentFyStartDate, daysBetween, addMonthsToDate } from './dateUtils';
import { IncomeType, VerificationMethod } from '../types';
import { BUSINESS_CONSTANTS } from '../config/businessConstants';

/**
 * Centralized business rule validation utilities
 * Ensures consistent validation across all income types
 */

export interface DateValidationInput {
  endDateLatestPayslip: string;
  employmentStartDate?: string;
}

export interface EmploymentDurationInput {
  employmentStartDate: string;
  endDateLatestPayslip: string;
  annualOverrideAmount?: number;
}

export interface LastFyIncomeRequirementInput {
  endDateLatestPayslip: string;
  lastFyAnnualIncome?: number;
  requiredMonths: number; // 6 for most types, 12 for COMMISSIONS
}

/**
 * Validate date fields for business rules
 */
export function validateDates(input: DateValidationInput): void {
  const payslipDate = parseDate(input.endDateLatestPayslip);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  // Check if payslip date is in the future
  if (payslipDate > today) {
    throw BusinessLogicError.futureDate('endDateLatestPayslip', input.endDateLatestPayslip);
  }

  // Check employment start date if provided
  if (input.employmentStartDate) {
    const employmentStart = parseDate(input.employmentStartDate);
    
    // Check if employment start date is in the future
    if (employmentStart > today) {
      throw BusinessLogicError.futureDate('employmentStartDate', input.employmentStartDate);
    }

    // Check if payslip date is before employment start date
    if (payslipDate < employmentStart) {
      throw BusinessLogicError.invalidDateRange(input.endDateLatestPayslip, input.employmentStartDate);
    }
  }
}

/**
 * Validate employment duration requirement (≥ minimum days)
 */
export function validateEmploymentDuration(input: EmploymentDurationInput): void {
  const durationDays = daysBetween(input.employmentStartDate, input.endDateLatestPayslip);
  const REQUIRED_DAYS = BUSINESS_CONSTANTS.MINIMUM_EMPLOYMENT_DAYS;
  
  // If employment duration is insufficient and no override amount provided
  if (durationDays < REQUIRED_DAYS && (!input.annualOverrideAmount || input.annualOverrideAmount <= 0)) {
    throw BusinessLogicError.insufficientEmploymentDuration(durationDays);
  }
}

/**
 * Validate Last FY Income requirement based on payslip timing
 */
export function validateLastFyIncomeRequirement(input: LastFyIncomeRequirementInput): void {
  const currentFyStart = getCurrentFyStartDate(input.endDateLatestPayslip);
  
  // Calculate required date threshold
  const requiredDate = addMonthsToDate(currentFyStart, input.requiredMonths);
  
  // If payslip is before required threshold and no last FY income provided
  if (input.endDateLatestPayslip < requiredDate && input.lastFyAnnualIncome === undefined) {
    const daysIntoFy = daysBetween(currentFyStart, input.endDateLatestPayslip);
    throw BusinessLogicError.missingLastFyIncome(daysIntoFy, input.requiredMonths);
  }
}

/**
 * Validate Last FY Bonus requirement for two-year verification
 */
export function validateLastFyBonusRequirement(verificationMethod?: VerificationMethod, lastFyBonus?: number): void {
  if (verificationMethod === VerificationMethod.TWO_YEAR_VERIFICATION && lastFyBonus === undefined) {
    throw BusinessLogicError.missingLastFyBonus();
  }
}

/**
 * Validate income type and verification method combination
 */
export function validateIncomeTypeVerificationMethodCombination(
  incomeType: IncomeType, 
  verificationMethod?: VerificationMethod
): void {
  const validCombinations: Record<IncomeType, VerificationMethod[] | undefined> = {
    [IncomeType.OVERTIME]: [VerificationMethod.NON_ESSENTIAL_SERVICES, VerificationMethod.ESSENTIAL_SERVICES],
    [IncomeType.BONUS]: [VerificationMethod.ONE_YEAR_VERIFICATION, VerificationMethod.TWO_YEAR_VERIFICATION],
    [IncomeType.CASUAL]: undefined, // No verification method required
    [IncomeType.CONTRACT_VARIABLE]: undefined, // No verification method required
    [IncomeType.COMMISSIONS]: undefined, // No verification method required
    [IncomeType.INVESTMENT_SHARES]: undefined, // No verification method required
    [IncomeType.INVESTMENT_INTEREST]: undefined, // No verification method required
  };

  const allowedMethods = validCombinations[incomeType];
  
  // If income type requires verification method but none provided
  if (allowedMethods && !verificationMethod) {
    throw BusinessLogicError.invalidCombination('undefined', incomeType);
  }
  
  // If income type doesn't allow verification method but one provided
  if (!allowedMethods && verificationMethod) {
    throw BusinessLogicError.invalidCombination(verificationMethod, incomeType);
  }
  
  // If verification method provided but not valid for income type
  if (allowedMethods && verificationMethod && !allowedMethods.includes(verificationMethod)) {
    throw BusinessLogicError.invalidCombination(verificationMethod, incomeType);
  }
}

/**
 * Validate that calculated pay cycles is not zero
 */
export function validatePayCycles(payCycles: number, endDate: string, startDate: string): void {
  if (payCycles === 0) {
    throw BusinessLogicError.zeroPayCycles(endDate, startDate);
  }
}

/**
 * Validate that calculated values are not negative where positive expected
 */
export function validatePositiveCalculation(value: number, calculationType: string): void {
  if (value < 0) {
    throw BusinessLogicError.negativeCalculatedValue(calculationType, value);
  }
}

/**
 * Comprehensive validation for employment-based income types
 * (OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS)
 */
export function validateEmploymentBasedIncome(input: {
  incomeType: IncomeType;
  verificationMethod?: VerificationMethod;
  endDateLatestPayslip: string;
  employmentStartDate: string;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
  requiredMonthsForLastFy: number;
}): void {
  // Validate income type and verification method combination
  validateIncomeTypeVerificationMethodCombination(input.incomeType, input.verificationMethod);
  
  // Validate date fields
  validateDates({
    endDateLatestPayslip: input.endDateLatestPayslip,
    employmentStartDate: input.employmentStartDate
  });
  
  // Validate employment duration
  validateEmploymentDuration({
    employmentStartDate: input.employmentStartDate,
    endDateLatestPayslip: input.endDateLatestPayslip,
    annualOverrideAmount: input.annualOverrideAmount
  });
  
  // Validate Last FY Income requirement
  validateLastFyIncomeRequirement({
    endDateLatestPayslip: input.endDateLatestPayslip,
    lastFyAnnualIncome: input.lastFyAnnualIncome,
    requiredMonths: input.requiredMonthsForLastFy
  });
}

/**
 * Comprehensive validation for bonus income types
 */
export function validateBonusIncome(input: {
  incomeType: IncomeType;
  verificationMethod: VerificationMethod;
  lastFyBonus?: number;
}): void {
  // Validate income type and verification method combination
  validateIncomeTypeVerificationMethodCombination(input.incomeType, input.verificationMethod);
  
  // Validate Last FY Bonus requirement
  validateLastFyBonusRequirement(input.verificationMethod, input.lastFyBonus);
}

/**
 * Comprehensive validation for investment income types
 */
export function validateInvestmentIncome(input: {
  incomeType: IncomeType;
  verificationMethod?: VerificationMethod;
}): void {
  // Validate income type and verification method combination (should be none)
  validateIncomeTypeVerificationMethodCombination(input.incomeType, input.verificationMethod);
} 