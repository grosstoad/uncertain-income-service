import {
  UncertainIncomeRequest,
  UncertainIncomeSuccessResponse,
  IncomeType,
} from './types';
import { apiVersion, logicVersion } from './versions.config';
import { calculateOvertimeIncome } from './calculations/overtimeCalculations';
import { calculateCasualIncome, calculateContractVariableIncome } from './calculations/employmentBasedCalculations';
import { calculateCommissionsIncome } from './calculations/commissionsCalculations';
import { calculateBonusIncome } from './calculations/bonusCalculations';
import { calculateInvestmentIncome } from './calculations/investmentCalculations';
import { InvalidInputError } from './utils/InvalidInputError';

export function calculateUncertainIncome(request: UncertainIncomeRequest): UncertainIncomeSuccessResponse {
  try {
    let result;
    
    switch (request.incomeType) {
      case IncomeType.OVERTIME: {
        result = calculateOvertimeIncome(request);
        break;
      }
      
      case IncomeType.CASUAL: {
        result = calculateCasualIncome(request);
        break;
      }
      
      case IncomeType.CONTRACT_VARIABLE: {
        result = calculateContractVariableIncome(request);
        break;
      }
      
      case IncomeType.COMMISSIONS: {
        result = calculateCommissionsIncome(request);
        break;
      }
      
      case IncomeType.BONUS: {
        result = calculateBonusIncome(request);
        break;
      }
      
      case IncomeType.INVESTMENT_SHARES:
      case IncomeType.INVESTMENT_INTEREST: {
        result = calculateInvestmentIncome({
          ...request,
          incomeType: request.incomeType
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