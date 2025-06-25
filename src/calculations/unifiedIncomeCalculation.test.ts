import { 
  calculateIncomeUnified, 
  UnifiedIncomeCalculationInput,
  INCOME_CALCULATION_CONFIGS 
} from './unifiedIncomeCalculation';
import { IncomeType, VerificationMethod, SalaryFrequency } from '../types';

describe('Unified Income Calculation', () => {
  describe('OVERTIME Income', () => {
    it('should calculate overtime income correctly with 6-month aggregation', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.OVERTIME,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        baseIncome: 2000,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 150000,
        verificationMethod: VerificationMethod.ESSENTIAL_SERVICES
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.OVERTIME]);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      expect(result.calculationDetails.annualBaseSalary).toBe(52000);
    });

    it('should handle annual override amount priority', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.OVERTIME,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        baseIncome: 2000,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 150000,
        annualOverrideAmount: 75000,
        verificationMethod: VerificationMethod.ESSENTIAL_SERVICES
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.OVERTIME]);
      
      expect(result.allowableAnnualIncome).toBe(75000);
    });
  });

  describe('CASUAL Income', () => {
    it('should calculate casual income correctly with 6-month aggregation', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.CASUAL,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 50000
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.CASUAL]);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      expect(result.calculationDetails.annualBaseSalary).toBe(0); // No base salary for casual
    });

    it('should be ineligible if employment duration < 180 days and no override', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.CASUAL,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-02-01',  // Only ~150 days from start
        employmentStartDate: '2024-09-01',
        ytdAmountLatestPayslip: 50000
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.CASUAL]);
      
      expect(result.eligible).toBe(false);
      expect(result.allowableAnnualIncome).toBe(0);
    });
  });

  describe('CONTRACT_VARIABLE Income', () => {
    it('should calculate contract variable income correctly', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.CONTRACT_VARIABLE,
        salaryFrequency: SalaryFrequency.MONTHLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 120000
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.CONTRACT_VARIABLE]);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      expect(result.calculationDetails.annualBaseSalary).toBe(0); // No base salary for contract
    });
  });

  describe('COMMISSIONS Income', () => {
    it('should calculate commissions income with 12-month rolling aggregation', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.COMMISSIONS,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        baseIncome: 2000,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 150000,
        lastFyAnnualIncome: 120000
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.COMMISSIONS]);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBeGreaterThan(0);
      expect(result.calculationDetails.annualBaseSalary).toBe(52000);
    });

    it('should prioritize actual YTD commission over calculated amount', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.COMMISSIONS,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        baseIncome: 2000,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 150000,
        lastFyAnnualIncome: 120000, // Required for COMMISSIONS validation
        actualYtdCommission: 85000
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.COMMISSIONS]);
      
      expect(result.allowableAnnualIncome).toBe(85000);
    });
  });

  describe('6-Month Aggregation Logic Verification', () => {
    it('should calculate 6-month aggregation correctly for overtime (no Last FY constraint)', () => {
      // Test case: Monthly frequency, 2000 base, 2024-12-01 payslip, 88000 YTD
      // Expected: 6 months (June 2024 to Nov 2024), annualized = 177000
      // Note: Last FY constraint removed - aggregation provides sufficient historical data
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.OVERTIME,
        salaryFrequency: SalaryFrequency.MONTHLY,
        baseIncome: 2000,
        endDateLatestPayslip: '2024-12-01',
        employmentStartDate: '2024-01-01', // Well before 6 months
        ytdAmountLatestPayslip: 88000,
        lastFyAnnualIncome: 150000, // Still required for validation but doesn't constrain result
        verificationMethod: VerificationMethod.ESSENTIAL_SERVICES
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.OVERTIME]);
      
      expect(result.eligible).toBe(true);
      
      // Verify base salary calculations
      expect(result.calculationDetails.annualBaseSalary).toBe(24000); // 2000 * 12
      
      // The 6-month aggregation should produce 177000 (no constraint applied)
      // June 2024 to Nov 2024 = 88,500 total × 2 = 177,000
      expect(result.allowableAnnualIncome).toBe(177000);
      
      console.log('Test result:', {
        allowableAnnualIncome: result.allowableAnnualIncome,
        annualBaseSalary: result.calculationDetails.annualBaseSalary,
        averageAmountLessBaseIncomeAnnual: result.calculationDetails.averageAmountLessBaseIncomeAnnual,
        averageAmountLessBaseIncomeMonthly: result.calculationDetails.averageAmountLessBaseIncomeMonthly
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero YTD amount', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.CASUAL,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2025-06-01',
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 0
      };

      const result = calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.CASUAL]);
      
      expect(result.eligible).toBe(true);
      expect(result.allowableAnnualIncome).toBe(0);
    });

    it('should throw error for invalid date range', () => {
      const input: UnifiedIncomeCalculationInput = {
        incomeType: IncomeType.CASUAL,
        salaryFrequency: SalaryFrequency.FORTNIGHTLY,
        endDateLatestPayslip: '2024-06-30',  // Before employment start
        employmentStartDate: '2024-07-01',
        ytdAmountLatestPayslip: 50000,
        annualOverrideAmount: 50000
      };

      expect(() => calculateIncomeUnified(input, INCOME_CALCULATION_CONFIGS[IncomeType.CASUAL]))
        .toThrow('End date on latest payslip');
    });
  });
});