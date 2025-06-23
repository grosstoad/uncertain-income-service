import { CalculationDetails } from './calculationDetails';

export interface UncertainIncomeSuccessResponse {
  success: true;
  data: {
    incomeType: string;
    verificationMethod?: string;
    allowableAnnualIncome: number;
    calculationDetails: CalculationDetails;
    eligible: boolean;
  };
  versions: {
    api: string;
    logic: string;
  };
}

export interface ErrorDetail {
  field?: string;
  code: string;
  message: string;
  value?: string | number | null;
  path?: string;
}

export interface UncertainIncomeErrorResponse {
  success: false;
  errors: ErrorDetail[];
  timestamp: string;
  requestId: string;
}

export type UncertainIncomeResponse = UncertainIncomeSuccessResponse | UncertainIncomeErrorResponse; 