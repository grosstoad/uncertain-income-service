/**
 * Comprehensive error codes for uncertain income calculation API
 * Based on income_calculation_requirements.md specification
 */

export enum ErrorCodes {
  // Schema Validation Errors (HTTP 400)
  INVALID_JSON_SYNTAX = 'INVALID_JSON_SYNTAX',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATA_TYPE = 'INVALID_DATA_TYPE',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_ENUM_VALUE = 'INVALID_ENUM_VALUE',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  INVALID_DECIMAL_PRECISION = 'INVALID_DECIMAL_PRECISION',
  
  // Business Logic Errors (HTTP 422)
  FUTURE_DATE = 'FUTURE_DATE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  MISSING_LAST_FY_INCOME = 'MISSING_LAST_FY_INCOME',
  MISSING_LAST_FY_BONUS = 'MISSING_LAST_FY_BONUS',
  INSUFFICIENT_EMPLOYMENT_DURATION = 'INSUFFICIENT_EMPLOYMENT_DURATION',
  ZERO_PAY_CYCLES = 'ZERO_PAY_CYCLES',
  NEGATIVE_CALCULATED_VALUE = 'NEGATIVE_CALCULATED_VALUE',
  INVALID_COMBINATION = 'INVALID_COMBINATION',
  EXCESSIVE_DECIMAL_PRECISION = 'EXCESSIVE_DECIMAL_PRECISION',
  
  // System Errors (HTTP 500)
  CALCULATION_ENGINE_ERROR = 'CALCULATION_ENGINE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  FINANCIAL_YEAR_CONFIG_ERROR = 'FINANCIAL_YEAR_CONFIG_ERROR',
  VERSION_MISMATCH_ERROR = 'VERSION_MISMATCH_ERROR',
  
  // Generic fallbacks
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export const ErrorMessages = {
  [ErrorCodes.INVALID_JSON_SYNTAX]: 'Invalid JSON syntax in request body',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: (field: string) => `Required field '${field}' is missing or empty`,
  [ErrorCodes.INVALID_DATA_TYPE]: (field: string, expected: string, actual: string) => 
    `Field '${field}' must be of type ${expected}, received ${actual}`,
  [ErrorCodes.INVALID_DATE_FORMAT]: (field: string) => `Date field '${field}' must be in YYYY-MM-DD format`,
  [ErrorCodes.INVALID_ENUM_VALUE]: (field: string, value: string, validValues: string[]) => 
    `Invalid value '${value}' for field '${field}'. Must be one of: ${validValues.join(', ')}`,
  [ErrorCodes.OUT_OF_RANGE]: (field: string, value: number, min: number, max: number) => 
    `Value ${value} for field '${field}' must be between ${min} and ${max}`,
  [ErrorCodes.INVALID_DECIMAL_PRECISION]: (field: string) => `Field '${field}' must have maximum 2 decimal places`,
  
  [ErrorCodes.FUTURE_DATE]: (field: string) => `Date '${field}' cannot be in the future`,
  [ErrorCodes.INVALID_DATE_RANGE]: (endDate: string, startDate: string) => 
    `End date on latest payslip (${endDate}) must be on or after employment start date (${startDate})`,
  [ErrorCodes.MISSING_LAST_FY_INCOME]: (days: number, requiredMonths: number) => 
    `Last FY Annual Income required as end date on latest payslip is ${days} days into new financial year (less than ${requiredMonths} months)`,
  [ErrorCodes.MISSING_LAST_FY_BONUS]: () => 'Last FY Bonus required for two-year verification method',
  [ErrorCodes.INSUFFICIENT_EMPLOYMENT_DURATION]: (days: number) => 
    `Employment duration of ${days} days is less than required 180 days. Annual override amount required for eligibility`,
  [ErrorCodes.ZERO_PAY_CYCLES]: (endDate: string, startDate: string) => 
    `Calculated pay cycles resulted in zero. Verify payslip date (${endDate}) is after employment start date (${startDate}) and within current financial year`,
  [ErrorCodes.NEGATIVE_CALCULATED_VALUE]: (calculationType: string) => 
    `Calculation error: ${calculationType} resulted in negative value. Check input data validity`,
  [ErrorCodes.INVALID_COMBINATION]: (verificationMethod: string, incomeType: string) => 
    `Verification method '${verificationMethod}' is not valid for income type '${incomeType}'`,
  
  [ErrorCodes.CALCULATION_ENGINE_ERROR]: (requestId: string) => `Internal calculation error occurred. Request ID: ${requestId}`,
  [ErrorCodes.FINANCIAL_YEAR_CONFIG_ERROR]: () => 'Financial year configuration error. Contact support',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: () => 'An unexpected error occurred'
}; 