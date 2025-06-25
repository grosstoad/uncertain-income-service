import { 
  calculateAnnualIncome, 
  calculateBonusIncome, 
  calculateInvestmentIncome,
  AnnualIncomeCalculationInput 
} from './annualIncomeCalculation';
import { IncomeType, VerificationMethod } from '../types';

describe('Annual Income Calculation', () => {
  describe('BONUS Income', () => {
    it('should calculate bonus with ONE_YEAR verification', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.BONUS,
        verificationMethod: VerificationMethod.ONE_YEAR_VERIFICATION,
        currentFy: 50000
      };

      const result = calculateAnnualIncome(input);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBe(50000);
      expect(result.calculationDetails.averageAmountLessBaseIncomeAnnual).toBe(50000);
    });

    it('should calculate bonus with TWO_YEAR verification', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.BONUS,
        verificationMethod: VerificationMethod.TWO_YEAR_VERIFICATION,
        currentFy: 60000,
        lastFy: 40000
      };

      const result = calculateAnnualIncome(input);
      
      expect(result.eligible).toBe(true);
      // MIN(average of 50000, current of 60000) = 50000
      expect(result.allowableAnnualIncome).toBe(50000);
    });

    it('should use current FY when it is lower than average', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.BONUS,
        verificationMethod: VerificationMethod.TWO_YEAR_VERIFICATION,
        currentFy: 30000,
        lastFy: 60000
      };

      const result = calculateAnnualIncome(input);
      
      // MIN(average of 45000, current of 30000) = 30000
      expect(result.allowableAnnualIncome).toBe(30000);
    });

    it('should work with legacy calculateBonusIncome wrapper', () => {
      const result = calculateBonusIncome({
        verificationMethod: VerificationMethod.ONE_YEAR_VERIFICATION,
        currentFyBonus: 45000
      });
      
      expect(result.allowableAnnualIncome).toBe(45000);
    });
  });

  describe('INVESTMENT Income', () => {
    it('should calculate INVESTMENT_SHARES income correctly', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.INVESTMENT_SHARES,
        currentFy: 80000,
        lastFy: 60000
      };

      const result = calculateAnnualIncome(input);
      
      expect(result.eligible).toBe(true);
      // MIN(average of 70000, current of 80000) = 70000
      expect(result.allowableAnnualIncome).toBe(70000);
    });

    it('should calculate INVESTMENT_INTEREST income correctly', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.INVESTMENT_INTEREST,
        currentFy: 25000,
        lastFy: 35000
      };

      const result = calculateAnnualIncome(input);
      
      expect(result.eligible).toBe(true);
      // MIN(average of 30000, current of 25000) = 25000
      expect(result.allowableAnnualIncome).toBe(25000);
    });

    it('should work with legacy calculateInvestmentIncome wrapper', () => {
      const result = calculateInvestmentIncome({
        incomeType: IncomeType.INVESTMENT_SHARES,
        currentFy: 90000,
        lastFy: 70000
      });
      
      // MIN(average of 80000, current of 90000) = 80000
      expect(result.allowableAnnualIncome).toBe(80000);
    });

    it('should throw error when lastFy is missing for investment', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.INVESTMENT_SHARES,
        currentFy: 50000
        // lastFy missing
      };

      expect(() => calculateAnnualIncome(input))
        .toThrow('Last FY amount is required for INVESTMENT income types');
    });
  });

  describe('Validation', () => {
    it('should validate negative amounts', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.BONUS,
        verificationMethod: VerificationMethod.ONE_YEAR_VERIFICATION,
        currentFy: -5000
      };

      expect(() => calculateAnnualIncome(input))
        .toThrow();
    });

    it('should handle zero amounts', () => {
      const input: AnnualIncomeCalculationInput = {
        incomeType: IncomeType.BONUS,
        verificationMethod: VerificationMethod.ONE_YEAR_VERIFICATION,
        currentFy: 0
      };

      const result = calculateAnnualIncome(input);
      
      expect(result.allowableAnnualIncome).toBe(0);
      expect(result.eligible).toBe(true);
    });
  });
});