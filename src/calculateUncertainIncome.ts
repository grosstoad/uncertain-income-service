import {
  UncertainIncomeRequest,
  UncertainIncomeSuccessResponse,
  IncomeType,
} from './types';
import { apiVersion, logicVersion } from './versions.config';
import { 
  calculateIncomeUnified, 
  UnifiedIncomeCalculationInput, 
  INCOME_CALCULATION_CONFIGS 
} from './calculations/unifiedIncomeCalculation';
import { calculateBonusIncome, calculateInvestmentIncome } from './calculations/annualIncomeCalculation';
import { InvalidInputError } from './utils/InvalidInputError';

export function calculateUncertainIncome(request: UncertainIncomeRequest): UncertainIncomeSuccessResponse {
  try {
    let result;
    
    switch (request.incomeType) {
      case IncomeType.OVERTIME:
      case IncomeType.CASUAL:
      case IncomeType.CONTRACT_VARIABLE:
      case IncomeType.COMMISSIONS: {
        // Use unified income calculation engine for employment-based income types
        const unifiedInput: UnifiedIncomeCalculationInput = {
          incomeType: request.incomeType,
          salaryFrequency: request.salaryFrequency,
          endDateLatestPayslip: request.endDateLatestPayslip,
          employmentStartDate: request.employmentStartDate,
          ytdAmountLatestPayslip: request.ytdAmountLatestPayslip,
          baseIncome: 'baseIncome' in request ? request.baseIncome : undefined,
          lastFyAnnualIncome: request.lastFyAnnualIncome,
          annualOverrideAmount: request.annualOverrideAmount,
          actualYtdCommission: 'actualYtdCommission' in request ? request.actualYtdCommission : undefined,
          verificationMethod: 'verificationMethod' in request ? request.verificationMethod : undefined
        };
        
        result = calculateIncomeUnified(unifiedInput, INCOME_CALCULATION_CONFIGS[request.incomeType as keyof typeof INCOME_CALCULATION_CONFIGS]);
        break;
      }
      
      case IncomeType.BONUS: {
        result = calculateBonusIncome({
          verificationMethod: request.verificationMethod,
          currentFyBonus: request.currentFyBonus,
          lastFyBonus: request.lastFyBonus
        });
        break;
      }
      
      case IncomeType.INVESTMENT_SHARES:
      case IncomeType.INVESTMENT_INTEREST: {
        result = calculateInvestmentIncome({
          incomeType: request.incomeType,
          currentFy: request.currentFy,
          lastFy: request.lastFy
        });
        break;
      }
      
      default:
        // Exhaustive checking - TypeScript will error if new income types are added without handling
        return ((_exhaustiveCheck: never): never => {
          throw new InvalidInputError('Unsupported income type');
        })(request);
    }

    const response: UncertainIncomeSuccessResponse = {
      success: true,
      data: {
        incomeType: request.incomeType,
        verificationMethod: 'verificationMethod' in request ? request.verificationMethod : undefined,
        allowableAnnualIncome: result.allowableAnnualIncome,
        calculationDetails: result.calculationDetails,
        eligible: result.eligible,
      },
      versions: {
        api: apiVersion,
        logic: logicVersion,
      },
    };

    return response;
  } catch (error) {
    if (error instanceof InvalidInputError) {
      throw error;
    }
    
    throw new Error(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 