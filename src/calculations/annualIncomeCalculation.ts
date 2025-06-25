import { VerificationMethod, CalculationDetails, IncomeType } from '../types';
import { validateBonusIncome, validateInvestmentIncome, validatePositiveCalculation } from '../utils/businessRuleValidation';

export interface AnnualIncomeCalculationInput {
  incomeType: IncomeType.BONUS | IncomeType.INVESTMENT_SHARES | IncomeType.INVESTMENT_INTEREST;
  verificationMethod?: VerificationMethod; // Required for BONUS, not used for INVESTMENT
  currentFy: number;
  lastFy?: number; // Required for TWO_YEAR verification and all INVESTMENT
}

export interface AnnualIncomeCalculationResult {
  allowableAnnualIncome: number;
  calculationDetails: CalculationDetails;
  eligible: boolean;
}

/**
 * Unified calculation for BONUS and INVESTMENT income types
 * 
 * These income types share identical calculation patterns:
 * - Annual comparison logic (current FY vs historical)
 * - No employment duration requirements
 * - No pay cycle or base salary concepts
 * - Always eligible
 * 
 * Calculation Logic:
 * - ONE_YEAR (BONUS only): Use current FY amount
 * - TWO_YEAR (BONUS) / INVESTMENT: MIN(average of 2 years, current FY)
 */
export function calculateAnnualIncome(input: AnnualIncomeCalculationInput): AnnualIncomeCalculationResult {
  const {
    incomeType,
    verificationMethod,
    currentFy,
    lastFy
  } = input;

  // Validation based on income type
  if (incomeType === IncomeType.BONUS) {
    validateBonusIncome({
      incomeType,
      verificationMethod: verificationMethod!,
      lastFyBonus: lastFy
    });
  } else {
    // INVESTMENT_SHARES or INVESTMENT_INTEREST
    validateInvestmentIncome({
      incomeType,
      verificationMethod: undefined // INVESTMENT doesn't use verification method
    });
  }

  // Calculate based on verification method or income type
  let calculatedAmount: number;

  if (incomeType === IncomeType.BONUS) {
    if (verificationMethod === VerificationMethod.ONE_YEAR_VERIFICATION) {
      // ONE_YEAR_VERIFICATION: Simply use current FY bonus
      calculatedAmount = currentFy;
    } else if (verificationMethod === VerificationMethod.TWO_YEAR_VERIFICATION) {
      // TWO_YEAR_VERIFICATION: MIN(average of 2 years, current FY)
      const averageAmount = (currentFy + lastFy!) / 2;
      calculatedAmount = Math.min(averageAmount, currentFy);
    } else {
      throw new Error(`INVALID_COMBINATION: Verification method '${verificationMethod}' is not valid for income type 'BONUS'`);
    }
  } else {
    // INVESTMENT types always use TWO_YEAR logic: MIN(average of 2 years, current FY)
    if (lastFy === undefined) {
      throw new Error('Last FY amount is required for INVESTMENT income types');
    }
    const averageAmount = (currentFy + lastFy) / 2;
    calculatedAmount = Math.min(averageAmount, currentFy);
  }

  // Validate that calculation is not negative
  const calculationType = incomeType === IncomeType.BONUS ? 'bonusCalculation' : 'investmentCalculation';
  validatePositiveCalculation(calculatedAmount, calculationType);

  // Direct calculation (no override priority for annual income types)
  const finalAmount = Math.max(0, calculatedAmount);

  // Simple calculation details (no employment-based complexity)
  const calculationDetails: CalculationDetails = {
    annualBaseSalary: 0, // Not applicable for annual income types
    expectedYtdBaseSalary: 0, // Not applicable for annual income types
    daysPayCycleConversion: 0, // Not applicable for annual income types
    averageAmountPerPayCycle: 0, // Not applicable for annual income types
    averageAmountLessBaseIncomeAnnual: calculatedAmount, // The annual amount itself
    averageAmountLessBaseIncomeMonthly: calculatedAmount / 12
  };

  return {
    allowableAnnualIncome: finalAmount,
    calculationDetails,
    eligible: true // Annual income types are always eligible (no duration requirements)
  };
}

/**
 * Calculate BONUS income - delegates to unified annual calculation
 */
export function calculateBonusIncome(input: {
  verificationMethod: VerificationMethod;
  currentFyBonus: number;
  lastFyBonus?: number;
}): AnnualIncomeCalculationResult {
  return calculateAnnualIncome({
    incomeType: IncomeType.BONUS,
    verificationMethod: input.verificationMethod,
    currentFy: input.currentFyBonus,
    lastFy: input.lastFyBonus
  });
}

/**
 * Calculate INVESTMENT income - delegates to unified annual calculation
 */
export function calculateInvestmentIncome(input: {
  incomeType: IncomeType.INVESTMENT_SHARES | IncomeType.INVESTMENT_INTEREST;
  currentFy: number;
  lastFy: number;
}): AnnualIncomeCalculationResult {
  return calculateAnnualIncome({
    incomeType: input.incomeType,
    currentFy: input.currentFy,
    lastFy: input.lastFy
  });
}