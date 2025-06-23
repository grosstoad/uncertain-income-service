import { SalaryFrequency } from '../types';
import { getCurrentFyStartDate, daysBetween } from '../utils/dateUtils';
import { BUSINESS_CONSTANTS } from '../config/businessConstants';

export function getFrequencyMultiplier(frequency: SalaryFrequency): number {
  switch (frequency) {
    case SalaryFrequency.WEEKLY:
      return BUSINESS_CONSTANTS.FREQUENCY_MULTIPLIERS.WEEKLY;
    case SalaryFrequency.FORTNIGHTLY:
      return BUSINESS_CONSTANTS.FREQUENCY_MULTIPLIERS.FORTNIGHTLY;
    case SalaryFrequency.MONTHLY:
      return BUSINESS_CONSTANTS.FREQUENCY_MULTIPLIERS.MONTHLY;
    default:
      throw new Error(`Invalid salary frequency: ${frequency}`);
  }
}

export function calculateAnnualBaseSalary(baseIncome: number, frequency: SalaryFrequency): number {
  return baseIncome * getFrequencyMultiplier(frequency);
}

/**
 * Core pay cycle calculation logic with frequency-specific rounding rules
 * Extracted to eliminate code duplication
 */
function calculatePayCyclesCore(days: number, frequency: SalaryFrequency): number {
  const daysInYear = BUSINESS_CONSTANTS.DAYS_IN_YEAR;
  const frequencyMultiplier = getFrequencyMultiplier(frequency);
  
  let payCycles = (days / daysInYear) * frequencyMultiplier;
  
  // Apply frequency-specific rounding rules
  if (frequency === SalaryFrequency.MONTHLY) {
    // MONTHLY: Use configurable threshold - if decimal > threshold round up, if ≤ threshold round down
    const decimal = payCycles - Math.floor(payCycles);
    payCycles = decimal > BUSINESS_CONSTANTS.MONTHLY_ROUNDING_THRESHOLD 
      ? Math.ceil(payCycles) 
      : Math.floor(payCycles);
  } else {
    // FORTNIGHTLY/WEEKLY: Always round up
    payCycles = Math.ceil(payCycles);
  }
  
  return Math.max(0, payCycles);
}

/**
 * Calculate pay cycles from YYYY-MM-DD date strings (primary function)
 * Handles Australian Financial Year logic and employment period calculation
 */
export function calculateDaysPayCycleConversion(
  endDateLatestPayslip: string,
  employmentStartDate: string,
  frequency: SalaryFrequency,
): number {
  const currentFyStart = getCurrentFyStartDate(endDateLatestPayslip);
  
  // Determine start date - later of employment start or FY start
  const startDate = employmentStartDate > currentFyStart ? employmentStartDate : currentFyStart;
  const days = daysBetween(startDate, endDateLatestPayslip);
  
  return calculatePayCyclesCore(days, frequency);
}

/**
 * Calculate pay cycles from Date objects - convenience function for Date inputs
 * Efficiently converts to string processing then delegates to primary function
 */
export function calculatePayCycles(
  employmentStart: Date,
  payslipDate: Date,
  currentFyStart: Date,
  frequency: SalaryFrequency,
): number {
  // Convert Date objects to YYYY-MM-DD strings efficiently
  const employmentStartStr = employmentStart.toISOString().split('T')[0];
  const payslipDateStr = payslipDate.toISOString().split('T')[0];
  const currentFyStartStr = currentFyStart.toISOString().split('T')[0];
  
  // Determine start date - later of employment start or FY start
  const startDate = employmentStartStr > currentFyStartStr ? employmentStartStr : currentFyStartStr;
  const days = daysBetween(startDate, payslipDateStr);
  
  return calculatePayCyclesCore(days, frequency);
}

/**
 * Calculate annual amount from year-to-date figures
 */
export function calculateAnnualFromYtd(
  ytdAmount: number,
  payCycles: number,
  frequency: SalaryFrequency
): number {
  if (payCycles === 0) {
    return 0;
  }
  
  const averagePerCycle = ytdAmount / payCycles;
  const frequencyMultiplier = getFrequencyMultiplier(frequency);
  
  return averagePerCycle * frequencyMultiplier;
}

/**
 * Validate employment duration meets minimum requirements
 * Supports both string and Date inputs for flexibility
 */
export function validateEmploymentDuration(
  employmentStart: Date | string,
  endDate: Date | string,
  annualOverrideAmount?: number
): { eligible: boolean; durationDays: number } {
  // Convert to strings if needed for consistent processing
  const employmentStartStr = typeof employmentStart === 'string' 
    ? employmentStart 
    : employmentStart.toISOString().split('T')[0];
  const endDateStr = typeof endDate === 'string' 
    ? endDate 
    : endDate.toISOString().split('T')[0];
  
  const durationDays = daysBetween(employmentStartStr, endDateStr);
  const minimumDays = BUSINESS_CONSTANTS.MINIMUM_EMPLOYMENT_DAYS;
  
  // Eligible if duration >= minimum days OR override amount provided
  const eligible = durationDays >= minimumDays || (annualOverrideAmount !== undefined && annualOverrideAmount > 0);
  
  return { eligible, durationDays };
} 