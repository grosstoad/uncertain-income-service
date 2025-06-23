import { CalculationDetails, IncomeType } from '../types';
import { validateInvestmentIncome, validatePositiveCalculation } from '../utils/businessRuleValidation';

export interface InvestmentCalculationInput {
  incomeType: IncomeType; // Added to support validation
  currentFy: number;
  lastFy: number;
}

export interface InvestmentCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

/**
 * Calculate allowable INVESTMENT income amount
 * 
 * Applies to both:
 * - INVESTMENT_SHARES 
 * - INVESTMENT_INTEREST
 * 
 * Calculation Logic (DIRECT - No priority tiers):
 * - Calculated Amount (MIN of average and current FY)
 * - Same as TWO_YEAR_VERIFICATION BONUS
 * - Use minimum of (average of 2 years, current FY)
 * - Conservative approach caps at current year performance
 * 
 * Business Rules:
 * - No employment duration requirement
 * - Always requires both currentFy and lastFy
 * - Always eligible (no restrictions)
 */
export function calculateInvestmentIncome(input: InvestmentCalculationInput): InvestmentCalculationResult {
  const {
    incomeType,
    currentFy,
    lastFy
  } = input;

  // Comprehensive business rule validation for INVESTMENT income
  validateInvestmentIncome({
    incomeType,
    verificationMethod: undefined // INVESTMENT doesn't use verification method
  });

  // Calculate using conservative approach (same as TWO_YEAR_VERIFICATION BONUS)
  const averageInvestmentIncome = (currentFy + lastFy) / 2;
  const calculatedAmount = Math.min(averageInvestmentIncome, currentFy);

  // Validate that investment calculation is not negative
  validatePositiveCalculation(calculatedAmount, 'investmentCalculation');

  // Direct calculation (no override priority)
  const finalAmount = Math.max(0, calculatedAmount);

  // INVESTMENT calculations are simpler than employment-based income types
  // But we still need to provide the structure for consistency
  const calculationDetails: CalculationDetails = {
    annualBaseSalary: 0, // Not applicable for INVESTMENT
    expectedYtdBaseSalary: 0, // Not applicable for INVESTMENT
    daysPayCycleConversion: 0, // Not applicable for INVESTMENT
    averageAmountPerPayCycle: 0, // Not applicable for INVESTMENT
    averageAmountLessBaseIncomeAnnual: calculatedAmount, // The investment income itself
    averageAmountLessBaseIncomeMonthly: calculatedAmount / 12
  };

  return {
    allowableAnnualIncome: finalAmount,
    calculationDetails,
    eligible: true // INVESTMENT is always eligible (no duration requirements)
  };
} 