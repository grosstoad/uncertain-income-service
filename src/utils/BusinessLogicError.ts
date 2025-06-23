import { InvalidInputError, ValidationError } from './InvalidInputError';
import { ErrorCodes } from './errorCodes';

/**
 * Business logic error class for validation errors that should return HTTP 422
 * These are not schema validation errors, but business rule violations
 */
export class BusinessLogicError extends InvalidInputError {
  constructor(message: string, errors?: ValidationError[]) {
    super(message, errors);
    this.name = 'BusinessLogicError';
  }

  static createSingle(field: string, code: ErrorCodes, message: string, value: any = null, path?: string): BusinessLogicError {
    return new BusinessLogicError(message, [{
      field,
      code,
      message,
      value,
      path: path || `$.${field}`
    }]);
  }

  static futureDate(field: string, value: string): BusinessLogicError {
    return BusinessLogicError.createSingle(
      field,
      ErrorCodes.FUTURE_DATE,
      `Date '${field}' cannot be in the future`,
      value
    );
  }

  static invalidDateRange(endDate: string, startDate: string): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'endDateLatestPayslip',
      ErrorCodes.INVALID_DATE_RANGE,
      `End date on latest payslip (${endDate}) must be on or after employment start date (${startDate})`,
      endDate
    );
  }

  static missingLastFyIncome(days: number, requiredMonths: number): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'lastFyAnnualIncome',
      ErrorCodes.MISSING_LAST_FY_INCOME,
      `Last FY Annual Income required as end date on latest payslip is ${days} days into new financial year (less than ${requiredMonths} months)`,
      null
    );
  }

  static missingLastFyBonus(): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'lastFyBonus',
      ErrorCodes.MISSING_LAST_FY_BONUS,
      'Last FY Bonus required for two-year verification method',
      null
    );
  }

  static insufficientEmploymentDuration(days: number): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'employmentDuration',
      ErrorCodes.INSUFFICIENT_EMPLOYMENT_DURATION,
      `Employment duration of ${days} days is less than required 180 days. Annual override amount required for eligibility`,
      days,
      '$.calculated.employmentDuration'
    );
  }

  static zeroPayCycles(endDate: string, startDate: string): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'payCycles',
      ErrorCodes.ZERO_PAY_CYCLES,
      `Calculated pay cycles resulted in zero. Verify payslip date (${endDate}) is after employment start date (${startDate}) and within current financial year`,
      0,
      '$.calculated.payCycles'
    );
  }

  static negativeCalculatedValue(calculationType: string, value: number): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'calculatedValue',
      ErrorCodes.NEGATIVE_CALCULATED_VALUE,
      `Calculation error: ${calculationType} resulted in negative value. Check input data validity`,
      value,
      `$.calculated.${calculationType}`
    );
  }

  static invalidCombination(verificationMethod: string, incomeType: string): BusinessLogicError {
    return BusinessLogicError.createSingle(
      'verificationMethod',
      ErrorCodes.INVALID_COMBINATION,
      `Verification method '${verificationMethod}' is not valid for income type '${incomeType}'`,
      verificationMethod
    );
  }
} 