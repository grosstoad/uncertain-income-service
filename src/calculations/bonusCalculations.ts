import { VerificationMethod, CalculationDetails, IncomeType } from '../types';
import { validateBonusIncome, validatePositiveCalculation } from '../utils/businessRuleValidation';

export interface BonusCalculationInput {
  verificationMethod: VerificationMethod;
  currentFyBonus: number;
  lastFyBonus?: number;
}

export interface BonusCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

/**
 * Calculate allowable BONUS income amount
 * 
 * Calculation Logic (DIRECT - No priority tiers):
 * - Calculated Amount based on verification method (no override)
 * 
 * Verification Methods:
 * - ONE_YEAR_VERIFICATION: Use current FY bonus only
 * - TWO_YEAR_VERIFICATION: Use minimum of (average of 2 years, current FY)
 * 
 * Business Rules:
 * - No employment duration requirement (different from other income types)
 * - TWO_YEAR_VERIFICATION requires lastFyBonus
 * - Always eligible (no duration restrictions)
 */
export function calculateBonusIncome(input: BonusCalculationInput): BonusCalculationResult {
  const {
    verificationMethod,
    currentFyBonus,
    lastFyBonus
  } = input;

  // Comprehensive business rule validation for BONUS income
  validateBonusIncome({
    incomeType: IncomeType.BONUS,
    verificationMethod,
    lastFyBonus
  });

  // Calculate based on verification method
  let calculatedAmount: number;

  if (verificationMethod === VerificationMethod.ONE_YEAR_VERIFICATION) {
    // ONE_YEAR_VERIFICATION: Simply use current FY bonus
    calculatedAmount = currentFyBonus;
  } else if (verificationMethod === VerificationMethod.TWO_YEAR_VERIFICATION) {
    // TWO_YEAR_VERIFICATION: MIN(average of 2 years, current FY)
    // Note: lastFyBonus validation is now handled by validateBonusIncome above
    const averageBonus = (currentFyBonus + lastFyBonus!) / 2;
    calculatedAmount = Math.min(averageBonus, currentFyBonus);
  } else {
    // This should never happen due to validation above, but keeping for safety
    throw new Error(`INVALID_COMBINATION: Verification method '${verificationMethod}' is not valid for income type 'BONUS'`);
  }

  // Validate that bonus calculation is not negative
  validatePositiveCalculation(calculatedAmount, 'bonusCalculation');

  // Direct calculation (no override priority)
  const finalAmount = Math.max(0, calculatedAmount);

  // BONUS calculations don't have complex calculation details like OVERTIME/COMMISSIONS
  // But we still need to provide the structure for consistency
  const calculationDetails: CalculationDetails = {
    annualBaseSalary: 0, // Not applicable for BONUS
    expectedYtdBaseSalary: 0, // Not applicable for BONUS
    daysPayCycleConversion: 0, // Not applicable for BONUS
    averageAmountPerPayCycle: 0, // Not applicable for BONUS
    averageAmountLessBaseIncomeAnnual: calculatedAmount, // The bonus amount itself
    averageAmountLessBaseIncomeMonthly: calculatedAmount / 12
  };

  return {
    allowableAnnualIncome: finalAmount,
    calculationDetails,
    eligible: true // BONUS is always eligible (no duration requirements)
  };
} 