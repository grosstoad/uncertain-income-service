import { IncomeType } from './incomeType';
import { VerificationMethod } from './verificationMethod';
import { SalaryFrequency } from './salaryFrequency';

export interface BaseUncertainIncomeRequest {
  incomeType: IncomeType;
}

export interface OvertimeRequest extends BaseUncertainIncomeRequest {
  incomeType: IncomeType.OVERTIME;
  verificationMethod: VerificationMethod.NON_ESSENTIAL_SERVICES | VerificationMethod.ESSENTIAL_SERVICES;
  salaryFrequency: SalaryFrequency;
  baseIncome: number;
  endDateLatestPayslip: string; // YYYY-MM-DD format
  employmentStartDate: string; // YYYY-MM-DD format
  ytdAmountLatestPayslip: number;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
}

export interface CasualRequest extends BaseUncertainIncomeRequest {
  incomeType: IncomeType.CASUAL;
  salaryFrequency: SalaryFrequency;
  endDateLatestPayslip: string; // YYYY-MM-DD format
  employmentStartDate: string; // YYYY-MM-DD format
  ytdAmountLatestPayslip: number;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
}

export interface ContractVariableRequest extends BaseUncertainIncomeRequest {
  incomeType: IncomeType.CONTRACT_VARIABLE;
  salaryFrequency: SalaryFrequency;
  endDateLatestPayslip: string; // YYYY-MM-DD format
  employmentStartDate: string; // YYYY-MM-DD format
  ytdAmountLatestPayslip: number;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
}

export interface CommissionsRequest extends BaseUncertainIncomeRequest {
  incomeType: IncomeType.COMMISSIONS;
  salaryFrequency: SalaryFrequency;
  baseIncome: number;
  endDateLatestPayslip: string; // YYYY-MM-DD format
  employmentStartDate: string; // YYYY-MM-DD format
  ytdAmountLatestPayslip: number;
  lastFyAnnualIncome?: number;
  annualOverrideAmount?: number;
  actualYtdCommission?: number;
}

export interface BonusRequest extends BaseUncertainIncomeRequest {
  incomeType: IncomeType.BONUS;
  verificationMethod: VerificationMethod.ONE_YEAR_VERIFICATION | VerificationMethod.TWO_YEAR_VERIFICATION;
  currentFyBonus: number;
  lastFyBonus?: number;
}

export interface InvestmentRequest extends BaseUncertainIncomeRequest {
  incomeType: IncomeType.INVESTMENT_SHARES | IncomeType.INVESTMENT_INTEREST;
  currentFy: number;
  lastFy: number;
}

export type UncertainIncomeRequest = 
  | OvertimeRequest 
  | CasualRequest 
  | ContractVariableRequest 
  | CommissionsRequest 
  | BonusRequest 
  | InvestmentRequest; 