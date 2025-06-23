import { calculateCasualIncome } from './employmentBasedCalculations';
import { SalaryFrequency } from '../types';

describe('CASUAL Income Calculations', () => {
  
  describe('Basic Calculation Scenarios', () => {
    it('should calculate correct CASUAL income for fortnightly frequency', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',  // Well over 180 days
        ytdAmountLatestPayslip: 100000
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      
      // Verify calculation details
      expect(result.calculationDetails.annualBaseSalary).toBe(0); // No base salary for CASUAL
      expect(result.calculationDetails.expectedYtdBaseSalary).toBe(0);
      expect(result.calculationDetails.daysPayCycleConversion).toBeGreaterThan(0);
      expect(result.calculationDetails.averageAmountPerPayCycle).toBeGreaterThan(0);
      expect(result.calculationDetails.averageAmountLessBaseIncomeAnnual).toBeGreaterThan(0);
      expect(result.calculationDetails.averageAmountLessBaseIncomeMonthly).toBeGreaterThan(0);
    });

    it('should calculate correct CASUAL income for weekly frequency', () => {
      const input = {
        salaryFrequency: SalaryFrequency.WEEKLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-08-01',  // Well over 180 days
        ytdAmountLatestPayslip: 80000
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      
      // Weekly should have higher frequency multiplier (52)
      expect(result.calculationDetails.averageAmountLessBaseIncomeAnnual).toBeGreaterThan(0);
    });

    it('should calculate correct CASUAL income for monthly frequency', () => {
      const input = {
        salaryFrequency: SalaryFrequency.MONTHLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-09-01',  // Well over 180 days
        ytdAmountLatestPayslip: 120000
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      
      // Monthly should have lower frequency multiplier (12)
      expect(result.calculationDetails.averageAmountLessBaseIncomeAnnual).toBeGreaterThan(0);
    });
  });

  describe('Priority Order Logic', () => {
    const baseInput = {
      salaryFrequency: SalaryFrequency.FORTNIGHTLY,
      endDateLatestPayslip: '2025-06-01',
      employmentStartDate: '2024-07-01',
      ytdAmountLatestPayslip: 100000
    };

    it('should prioritize annualOverrideAmount over calculated amount', () => {
      const input = {
        ...baseInput,
        annualOverrideAmount: 75000  // Override amount
      };

      const result = calculateCasualIncome(input);
      
      expect(result.allowableAnnualIncome).toBe(75000);
      expect(result.eligible).toBe(true);
    });

    it('should use calculated amount when no override provided', () => {
      const input = {
        ...baseInput
      };

      const result = calculateCasualIncome(input);
      
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      expect(result.eligible).toBe(true);
      // Should be calculated amount, not override
      expect(result.allowableAnnualIncome).not.toBe(75000);
    });
  });

  describe('Employment Duration Rules', () => {
    it('should be ineligible if employment duration < 180 days and no override', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-02-01',  // Only ~150 days from start
        employmentStartDate: '2024-09-01',
        ytdAmountLatestPayslip: 50000
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(false);
      expect(result.allowableAnnualIncome).toBe(0);
    });

    it('should be eligible if employment duration < 180 days but annualOverrideAmount provided', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-02-01',  // Only ~150 days from start
        employmentStartDate: '2024-09-01',
        ytdAmountLatestPayslip: 50000,
        annualOverrideAmount: 80000  // Override bypasses duration requirement
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBe(80000);
    });
  });

  describe('Last FY Income Constraint', () => {
    it('should apply last FY constraint when payslip < 6 months into FY', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2024-10-01',  // Only 3 months into FY (July=1st month)
        employmentStartDate: '2024-01-01',  // Earlier start to ensure > 180 days employment
        ytdAmountLatestPayslip: 50000,
        lastFyAnnualIncome: 60000  // Lower than what would be calculated
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      // Should be constrained by lastFyAnnualIncome if it's lower
      expect(result.allowableAnnualIncome).toBeLessThanOrEqual(60000);
    });

    it('should not apply constraint when payslip >= 6 months into FY', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-03-01',  // 8 months into FY
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 150000,
        lastFyAnnualIncome: 60000  // Lower than what would be calculated
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      // Should not be constrained by lastFyAnnualIncome
      expect(result.allowableAnnualIncome).toBeGreaterThan(60000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero YTD amount', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 0
      };

      const result = calculateCasualIncome(input);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBe(0);
    });

    it('should throw error for zero pay cycles', () => {
      const input = {
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2024-06-30',  // Before employment start (previous FY)
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 50000,
        annualOverrideAmount: 50000  // Add override to bypass employment duration check
      };

      expect(() => calculateCasualIncome(input)).toThrow('ZERO_PAY_CYCLES');
    });
  });
}); 