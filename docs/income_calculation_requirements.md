# Uncertain Income Calculation API Requirements

## Overview

This API calculates allowable income amounts for various uncertain income types using Australian financial year (July 1 - June 30) calculations. All income types use a single endpoint with different request schemas based on the income type and verification method combination.

## Supported Income Types & Verification Methods

| Income Type | Verification Methods | Description |
|-------------|---------------------|-------------|
| **OVERTIME** | NON_ESSENTIAL_SERVICES, ESSENTIAL_SERVICES | Overtime and shift allowances |
| **CASUAL** | N/A | Casual employment income |
| **CONTRACT_VARIABLE** | N/A | Variable contract income |
| **COMMISSIONS** | N/A | Commission-based income |
| **BONUS** | ONE_YEAR_VERIFICATION, TWO_YEAR_VERIFICATION | Bonus income verification |
| **INVESTMENT_SHARES** | N/A | Share investment income |
| **INVESTMENT_INTEREST** | N/A | Interest investment income |

**Total Permutations:** 9 distinct calculation scenarios

## Single API Endpoint

**Endpoint:** `POST /api/uncertainIncome`

**Why Single Endpoint:** 
- Unified income calculation interface
- Consistent error handling and response format
- Simplified client implementation
- Single version management point
- Easier monitoring and analytics

The request schema varies based on `incomeType` and `verificationMethod` fields, but all responses follow the same structure.

## Common Data Types & Enums

```json
{
  "IncomeType": [
    "OVERTIME", "CASUAL", "CONTRACT_VARIABLE", 
    "COMMISSIONS", "BONUS", "INVESTMENT_SHARES", "INVESTMENT_INTEREST"
  ],
  "VerificationMethod": [
    "NON_ESSENTIAL_SERVICES", "ESSENTIAL_SERVICES",
    "ONE_YEAR_VERIFICATION", "TWO_YEAR_VERIFICATION"
  ],
  "SalaryFrequency": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]
}
```

**Date Format:** ISO 8601 (YYYY-MM-DD)  
**Currency Format:** Number with 2 decimal places (0.00 to 99,999,999.99)

## Request Schema

### Base Request Structure

```json
{
  "type": "object",
  "required": ["incomeType"],
  "properties": {
    "incomeType": {
      "type": "string",
      "enum": ["OVERTIME", "CASUAL", "CONTRACT_VARIABLE", "COMMISSIONS", "BONUS", "INVESTMENT_SHARES", "INVESTMENT_INTEREST"]
    }
  },
  "allOf": [
    // Conditional schemas based on incomeType
  ]
}
```

### Conditional Field Requirements

#### OVERTIME Income
```json
{
  "if": {"properties": {"incomeType": {"const": "OVERTIME"}}},
  "then": {
    "required": ["verificationMethod", "salaryFrequency", "baseIncome", "endDateLatestPayslip", "employmentStartDate", "ytdAmountLatestPayslip"],
    "properties": {
      "verificationMethod": {"enum": ["NON_ESSENTIAL_SERVICES", "ESSENTIAL_SERVICES"]},
      "salaryFrequency": {"enum": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]},
      "baseIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "endDateLatestPayslip": {"type": "string", "format": "date"},
      "employmentStartDate": {"type": "string", "format": "date"},
      "ytdAmountLatestPayslip": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyAnnualIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "annualOverrideAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### CASUAL / CONTRACT_VARIABLE Income
```json
{
  "if": {"properties": {"incomeType": {"enum": ["CASUAL", "CONTRACT_VARIABLE"]}}},
  "then": {
    "required": ["salaryFrequency", "endDateLatestPayslip", "employmentStartDate", "ytdAmountLatestPayslip"],
    "properties": {
      "salaryFrequency": {"enum": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]},
      "endDateLatestPayslip": {"type": "string", "format": "date"},
      "employmentStartDate": {"type": "string", "format": "date"},
      "ytdAmountLatestPayslip": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyAnnualIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "annualOverrideAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### COMMISSIONS Income
```json
{
  "if": {"properties": {"incomeType": {"const": "COMMISSIONS"}}},
  "then": {
    "required": ["salaryFrequency", "baseIncome", "endDateLatestPayslip", "employmentStartDate", "ytdAmountLatestPayslip"],
    "properties": {
      "salaryFrequency": {"enum": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]},
      "baseIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "endDateLatestPayslip": {"type": "string", "format": "date"},
      "employmentStartDate": {"type": "string", "format": "date"},
      "ytdAmountLatestPayslip": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyAnnualIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "annualOverrideAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdCommission": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### BONUS Income
```json
{
  "if": {"properties": {"incomeType": {"const": "BONUS"}}},
  "then": {
    "required": ["verificationMethod", "currentFyBonus"],
    "properties": {
      "verificationMethod": {"enum": ["ONE_YEAR_VERIFICATION", "TWO_YEAR_VERIFICATION"]},
      "currentFyBonus": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyBonus": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdBonus": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### INVESTMENT Income
```json
{
  "if": {"properties": {"incomeType": {"enum": ["INVESTMENT_SHARES", "INVESTMENT_INTEREST"]}}},
  "then": {
    "required": ["currentFy", "lastFy"],
    "properties": {
      "currentFy": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFy": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdInvestmentIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

## Response Schema

### Success Response (HTTP 200)
```json
{
  "type": "object",
  "required": ["success", "data", "versions"],
  "properties": {
    "success": {"type": "boolean", "const": true},
    "data": {
      "type": "object",
      "properties": {
        "incomeType": {"type": "string"},
        "verificationMethod": {"type": "string"},
        "allowableAnnualIncome": {"type": "number", "minimum": 0},
        "calculationDetails": {
          "type": "object",
          "properties": {
            "annualBaseSalary": {"type": "number"},
            "expectedYtdBaseSalary": {"type": "number"},
            "daysPayCycleConversion": {"type": "number"},
            "averageAmountPerPayCycle": {"type": "number"},
            "averageAmountLessBaseIncomeAnnual": {"type": "number"},
            "averageAmountLessBaseIncomeMonthly": {"type": "number"}
          }
        },
        "eligible": {"type": "boolean"}
      }
    },
    "versions": {
      "type": "object",
      "required": ["api", "logic"],
      "properties": {
        "api": {"type": "string"},
        "logic": {"type": "string"}
      }
    }
  }
}
```

### Error Response (HTTP 400/422/500)
```json
{
  "type": "object",
  "required": ["success", "errors", "timestamp", "requestId"],
  "properties": {
    "success": {"type": "boolean", "const": false},
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {"type": "string"},
          "code": {"type": "string"},
          "message": {"type": "string"},
          "value": {"type": ["string", "number", "null"]},
          "path": {"type": "string"}
        }
      }
    },
    "timestamp": {"type": "string", "format": "date-time"},
    "requestId": {"type": "string"}
  }
}
```

## Calculation Logic

### Priority Order (All Income Types)
1. **Actual YTD Amount** (user-provided actual figures)
2. **Annual Override Amount** (manual override)
3. **Calculated Amount** (formula-based calculation)

### Core Calculations

#### 1. OVERTIME (Essential & Non-Essential Services)

**Applies to:** `incomeType: "OVERTIME"`

**Base Calculations:**
```
Annual Base Salary = baseIncome × frequency_multiplier
- MONTHLY: × 12
- FORTNIGHTLY: × 26  
- WEEKLY: × 52

Days Pay Cycle Conversion = 
  (endDateLatestPayslip - MAX(employmentStartDate, current_FY_start)) / 365 × frequency_multiplier
- MONTHLY: × 12 (rounded to nearest month)
- FORTNIGHTLY: × 26 (rounded down)
- WEEKLY: × 52 (rounded down)

Average Amount Per Pay Cycle = ytdAmountLatestPayslip / daysPayCycleConversion

Average Amount Less Base Income (Annual) = 
  (averageAmountPerPayCycle - baseIncome) × frequency_multiplier
```

**Final Calculation:**
```
IF actualYtdAmount > 0: RETURN actualYtdAmount
ELSE IF annualOverrideAmount > 0: RETURN annualOverrideAmount  
ELSE IF lastFyAnnualIncome required AND (lastFyAnnualIncome - annualBaseSalary) < calculated:
    RETURN MAX(0, lastFyAnnualIncome - annualBaseSalary)
ELSE: RETURN averageAmountLessBaseIncomeAnnual
```

#### 2. CASUAL / CONTRACT_VARIABLE Income

**Applies to:** `incomeType: "CASUAL"` or `"CONTRACT_VARIABLE"`

**Calculation:** Same as OVERTIME but without `baseIncome` component
```
Average Amount (Annual) = ytdAmountLatestPayslip / daysPayCycleConversion × frequency_multiplier

Priority Order:
IF actualYtdAmount > 0: RETURN actualYtdAmount
ELSE IF annualOverrideAmount > 0: RETURN annualOverrideAmount
ELSE: RETURN calculated annual amount
```

#### 3. COMMISSIONS Income

**Applies to:** `incomeType: "COMMISSIONS"`

**12-Month Rolling Calculation:**
```
1. Generate 12-month period ending with month prior to payslip month
2. For months in current FY: use averageAmountLessBaseIncomeMonthly  
3. For months in prior FY: use MAX(0, lastFyAnnualIncome - annualBaseSalary) / 12
4. Sum all 12 months

Priority Order:
IF actualYtdCommission > 0: RETURN actualYtdCommission
ELSE IF annualOverrideAmount > 0: RETURN annualOverrideAmount
ELSE: RETURN 12-month rolling sum
```

#### 4. BONUS Income

**Applies to:** `incomeType: "BONUS"`

**One-Year Verification:**
```
IF actualYtdBonus > 0: RETURN actualYtdBonus
ELSE: RETURN currentFyBonus
```

**Two-Year Verification:**
```
IF actualYtdBonus > 0: RETURN actualYtdBonus  
ELSE: RETURN MIN(AVG(currentFyBonus, lastFyBonus), currentFyBonus)
```

#### 5. INVESTMENT Income

**Applies to:** `incomeType: "INVESTMENT_SHARES"` or `"INVESTMENT_INTEREST"`

**Calculation:**
```
IF actualYtdInvestmentIncome > 0: RETURN actualYtdInvestmentIncome
ELSE: RETURN MIN(AVG(currentFy, lastFy), currentFy)
```

### Business Rules

#### Employment Duration Eligibility
- **Rule:** Employment duration must be ≥ 180 days OR annualOverrideAmount provided
- **Applies to:** OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS
- **Exception:** Override amount bypasses duration requirement

#### Last FY Income Requirements
- **OVERTIME/CASUAL/CONTRACT_VARIABLE:** Required if payslip < 6 months into FY
- **COMMISSIONS:** Required if payslip < 12 months into FY  
- **BONUS:** Required for TWO_YEAR_VERIFICATION only
- **INVESTMENT:** Always required

#### Financial Year Boundaries
- **Start:** July 1
- **End:** June 30
- **Date calculations:** All relative to Australian FY cycle

## Error Handling

### Detailed Error Codes & Triggers

#### Schema Validation Errors (HTTP 400)

**INVALID_JSON_SYNTAX**
- **When triggered:** Request body contains malformed JSON
- **Message:** "Invalid JSON syntax in request body"
- **Example:** Missing comma, unclosed brackets, invalid escape sequences

**MISSING_REQUIRED_FIELD**
- **When triggered:** Required field is null, undefined, or empty string
- **Message:** "Required field '{fieldName}' is missing or empty"
- **Fields:** All fields marked as required based on incomeType and verificationMethod

**INVALID_DATA_TYPE**
- **When triggered:** Field value doesn't match expected type
- **Message:** "Field '{fieldName}' must be of type {expectedType}, received {actualType}"
- **Example:** String provided for number field, number for enum field

**INVALID_DATE_FORMAT**
- **When triggered:** Date string doesn't match YYYY-MM-DD pattern
- **Message:** "Date field '{fieldName}' must be in YYYY-MM-DD format"
- **Pattern:** `^\\d{4}-\\d{2}-\\d{2}# Uncertain Income Calculation API Requirements

## Overview

This API calculates allowable income amounts for various uncertain income types using Australian financial year (July 1 - June 30) calculations. All income types use a single endpoint with different request schemas based on the income type and verification method combination.

## Supported Income Types & Verification Methods

| Income Type | Verification Methods | Description |
|-------------|---------------------|-------------|
| **OVERTIME** | NON_ESSENTIAL_SERVICES, ESSENTIAL_SERVICES | Overtime and shift allowances |
| **CASUAL** | N/A | Casual employment income |
| **CONTRACT_VARIABLE** | N/A | Variable contract income |
| **COMMISSIONS** | N/A | Commission-based income |
| **BONUS** | ONE_YEAR_VERIFICATION, TWO_YEAR_VERIFICATION | Bonus income verification |
| **INVESTMENT_SHARES** | N/A | Share investment income |
| **INVESTMENT_INTEREST** | N/A | Interest investment income |

**Total Permutations:** 9 distinct calculation scenarios

## Single API Endpoint

**Endpoint:** `POST /api/uncertainIncome`

**Why Single Endpoint:** 
- Unified income calculation interface
- Consistent error handling and response format
- Simplified client implementation
- Single version management point
- Easier monitoring and analytics

The request schema varies based on `incomeType` and `verificationMethod` fields, but all responses follow the same structure.

## Common Data Types & Enums

```json
{
  "IncomeType": [
    "OVERTIME", "CASUAL", "CONTRACT_VARIABLE", 
    "COMMISSIONS", "BONUS", "INVESTMENT_SHARES", "INVESTMENT_INTEREST"
  ],
  "VerificationMethod": [
    "NON_ESSENTIAL_SERVICES", "ESSENTIAL_SERVICES",
    "ONE_YEAR_VERIFICATION", "TWO_YEAR_VERIFICATION"
  ],
  "SalaryFrequency": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]
}
```

**Date Format:** ISO 8601 (YYYY-MM-DD)  
**Currency Format:** Number with 2 decimal places (0.00 to 99,999,999.99)

## Request Schema

### Base Request Structure

```json
{
  "type": "object",
  "required": ["incomeType"],
  "properties": {
    "incomeType": {
      "type": "string",
      "enum": ["OVERTIME", "CASUAL", "CONTRACT_VARIABLE", "COMMISSIONS", "BONUS", "INVESTMENT_SHARES", "INVESTMENT_INTEREST"]
    }
  },
  "allOf": [
    // Conditional schemas based on incomeType
  ]
}
```

### Conditional Field Requirements

#### OVERTIME Income
```json
{
  "if": {"properties": {"incomeType": {"const": "OVERTIME"}}},
  "then": {
    "required": ["verificationMethod", "salaryFrequency", "baseIncome", "endDateLatestPayslip", "employmentStartDate", "ytdAmountLatestPayslip"],
    "properties": {
      "verificationMethod": {"enum": ["NON_ESSENTIAL_SERVICES", "ESSENTIAL_SERVICES"]},
      "salaryFrequency": {"enum": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]},
      "baseIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "endDateLatestPayslip": {"type": "string", "format": "date"},
      "employmentStartDate": {"type": "string", "format": "date"},
      "ytdAmountLatestPayslip": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyAnnualIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "annualOverrideAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### CASUAL / CONTRACT_VARIABLE Income
```json
{
  "if": {"properties": {"incomeType": {"enum": ["CASUAL", "CONTRACT_VARIABLE"]}}},
  "then": {
    "required": ["salaryFrequency", "endDateLatestPayslip", "employmentStartDate", "ytdAmountLatestPayslip"],
    "properties": {
      "salaryFrequency": {"enum": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]},
      "endDateLatestPayslip": {"type": "string", "format": "date"},
      "employmentStartDate": {"type": "string", "format": "date"},
      "ytdAmountLatestPayslip": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyAnnualIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "annualOverrideAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### COMMISSIONS Income
```json
{
  "if": {"properties": {"incomeType": {"const": "COMMISSIONS"}}},
  "then": {
    "required": ["salaryFrequency", "baseIncome", "endDateLatestPayslip", "employmentStartDate", "ytdAmountLatestPayslip"],
    "properties": {
      "salaryFrequency": {"enum": ["WEEKLY", "FORTNIGHTLY", "MONTHLY"]},
      "baseIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "endDateLatestPayslip": {"type": "string", "format": "date"},
      "employmentStartDate": {"type": "string", "format": "date"},
      "ytdAmountLatestPayslip": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyAnnualIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "annualOverrideAmount": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdCommission": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### BONUS Income
```json
{
  "if": {"properties": {"incomeType": {"const": "BONUS"}}},
  "then": {
    "required": ["verificationMethod", "currentFyBonus"],
    "properties": {
      "verificationMethod": {"enum": ["ONE_YEAR_VERIFICATION", "TWO_YEAR_VERIFICATION"]},
      "currentFyBonus": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFyBonus": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdBonus": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

#### INVESTMENT Income
```json
{
  "if": {"properties": {"incomeType": {"enum": ["INVESTMENT_SHARES", "INVESTMENT_INTEREST"]}}},
  "then": {
    "required": ["currentFy", "lastFy"],
    "properties": {
      "currentFy": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "lastFy": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01},
      "actualYtdInvestmentIncome": {"type": "number", "minimum": 0, "maximum": 99999999.99, "multipleOf": 0.01}
    }
  }
}
```

## Response Schema

### Success Response (HTTP 200)
```json
{
  "type": "object",
  "required": ["success", "data", "versions"],
  "properties": {
    "success": {"type": "boolean", "const": true},
    "data": {
      "type": "object",
      "properties": {
        "incomeType": {"type": "string"},
        "verificationMethod": {"type": "string"},
        "allowableAnnualIncome": {"type": "number", "minimum": 0},
        "calculationDetails": {
          "type": "object",
          "properties": {
            "annualBaseSalary": {"type": "number"},
            "expectedYtdBaseSalary": {"type": "number"},
            "daysPayCycleConversion": {"type": "number"},
            "averageAmountPerPayCycle": {"type": "number"},
            "averageAmountLessBaseIncomeAnnual": {"type": "number"},
            "averageAmountLessBaseIncomeMonthly": {"type": "number"}
          }
        },
        "eligible": {"type": "boolean"}
      }
    },
    "versions": {
      "type": "object",
      "required": ["api", "logic"],
      "properties": {
        "api": {"type": "string"},
        "logic": {"type": "string"}
      }
    }
  }
}
```

### Error Response (HTTP 400/422/500)
```json
{
  "type": "object",
  "required": ["success", "errors", "timestamp", "requestId"],
  "properties": {
    "success": {"type": "boolean", "const": false},
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {"type": "string"},
          "code": {"type": "string"},
          "message": {"type": "string"},
          "value": {"type": ["string", "number", "null"]},
          "path": {"type": "string"}
        }
      }
    },
    "timestamp": {"type": "string", "format": "date-time"},
    "requestId": {"type": "string"}
  }
}
```

## Calculation Logic

### Priority Order (All Income Types)
1. **Actual YTD Amount** (user-provided actual figures)
2. **Annual Override Amount** (manual override)
3. **Calculated Amount** (formula-based calculation)

### Core Calculations

#### 1. OVERTIME (Essential & Non-Essential Services)

**Applies to:** `incomeType: "OVERTIME"`

**Base Calculations:**
```
Annual Base Salary = baseIncome × frequency_multiplier
- MONTHLY: × 12
- FORTNIGHTLY: × 26  
- WEEKLY: × 52

Days Pay Cycle Conversion = 
  (endDateLatestPayslip - MAX(employmentStartDate, current_FY_start)) / 365 × frequency_multiplier
- MONTHLY: × 12 (rounded to nearest month)
- FORTNIGHTLY: × 26 (rounded down)
- WEEKLY: × 52 (rounded down)

Average Amount Per Pay Cycle = ytdAmountLatestPayslip / daysPayCycleConversion

Average Amount Less Base Income (Annual) = 
  (averageAmountPerPayCycle - baseIncome) × frequency_multiplier
```

**Final Calculation:**
```
IF actualYtdAmount > 0: RETURN actualYtdAmount
ELSE IF annualOverrideAmount > 0: RETURN annualOverrideAmount  
ELSE IF lastFyAnnualIncome required AND (lastFyAnnualIncome - annualBaseSalary) < calculated:
    RETURN MAX(0, lastFyAnnualIncome - annualBaseSalary)
ELSE: RETURN averageAmountLessBaseIncomeAnnual
```

#### 2. CASUAL / CONTRACT_VARIABLE Income

**Applies to:** `incomeType: "CASUAL"` or `"CONTRACT_VARIABLE"`

**Calculation:** Same as OVERTIME but without `baseIncome` component
```
Average Amount (Annual) = ytdAmountLatestPayslip / daysPayCycleConversion × frequency_multiplier

Priority Order:
IF actualYtdAmount > 0: RETURN actualYtdAmount
ELSE IF annualOverrideAmount > 0: RETURN annualOverrideAmount
ELSE: RETURN calculated annual amount
```

#### 3. COMMISSIONS Income

**Applies to:** `incomeType: "COMMISSIONS"`

**12-Month Rolling Calculation:**
```
1. Generate 12-month period ending with month prior to payslip month
2. For months in current FY: use averageAmountLessBaseIncomeMonthly  
3. For months in prior FY: use MAX(0, lastFyAnnualIncome - annualBaseSalary) / 12
4. Sum all 12 months

Priority Order:
IF actualYtdCommission > 0: RETURN actualYtdCommission
ELSE IF annualOverrideAmount > 0: RETURN annualOverrideAmount
ELSE: RETURN 12-month rolling sum
```

#### 4. BONUS Income

**Applies to:** `incomeType: "BONUS"`

**One-Year Verification:**
```
IF actualYtdBonus > 0: RETURN actualYtdBonus
ELSE: RETURN currentFyBonus
```

**Two-Year Verification:**
```
IF actualYtdBonus > 0: RETURN actualYtdBonus  
ELSE: RETURN MIN(AVG(currentFyBonus, lastFyBonus), currentFyBonus)
```

#### 5. INVESTMENT Income

**Applies to:** `incomeType: "INVESTMENT_SHARES"` or `"INVESTMENT_INTEREST"`

**Calculation:**
```
IF actualYtdInvestmentIncome > 0: RETURN actualYtdInvestmentIncome
ELSE: RETURN MIN(AVG(currentFy, lastFy), currentFy)
```

### Business Rules

#### Employment Duration Eligibility
- **Rule:** Employment duration must be ≥ 180 days OR annualOverrideAmount provided
- **Applies to:** OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS
- **Exception:** Override amount bypasses duration requirement

#### Last FY Income Requirements
- **OVERTIME/CASUAL/CONTRACT_VARIABLE:** Required if payslip < 6 months into FY
- **COMMISSIONS:** Required if payslip < 12 months into FY  
- **BONUS:** Required for TWO_YEAR_VERIFICATION only
- **INVESTMENT:** Always required

#### Financial Year Boundaries
- **Start:** July 1
- **End:** June 30
- **Date calculations:** All relative to Australian FY cycle


- **Fields:** endDateLatestPayslip, employmentStartDate

**INVALID_ENUM_VALUE**
- **When triggered:** Value not in allowed enum list
- **Message:** "Invalid value '{value}' for field '{fieldName}'. Must be one of: {validValues}"
- **Fields:** 
  - salaryFrequency (WEEKLY/FORTNIGHTLY/MONTHLY)
  - incomeType (OVERTIME/CASUAL/CONTRACT_VARIABLE/COMMISSIONS/BONUS/INVESTMENT_SHARES/INVESTMENT_INTEREST)
  - verificationMethod (NON_ESSENTIAL_SERVICES/ESSENTIAL_SERVICES/ONE_YEAR_VERIFICATION/TWO_YEAR_VERIFICATION)

**OUT_OF_RANGE**
- **When triggered:** Numeric value outside min/max bounds
- **Message:** "Value {value} for field '{fieldName}' must be between {min} and {max}"
- **Fields:** All monetary fields (0 to 99,999,999.99)

**INVALID_DECIMAL_PRECISION**
- **When triggered:** Monetary field has more than 2 decimal places
- **Message:** "Field '{fieldName}' must have maximum 2 decimal places"
- **Fields:** All currency fields

#### Business Logic Errors (HTTP 422)

**FUTURE_DATE**
- **When triggered:** Any date field is after current date
- **Message:** "Date '{fieldName}' cannot be in the future"
- **Fields:** endDateLatestPayslip, employmentStartDate

**INVALID_DATE_RANGE**
- **When triggered:** endDateLatestPayslip < employmentStartDate
- **Message:** "End date on latest payslip ({endDate}) must be on or after employment start date ({startDate})"

**MISSING_LAST_FY_INCOME**
- **When triggered:** 
  - OVERTIME/CASUAL/CONTRACT_VARIABLE: endDateLatestPayslip < 6 months from start of current FY AND lastFyAnnualIncome not provided
  - COMMISSIONS: endDateLatestPayslip < 12 months from start of current FY AND lastFyAnnualIncome not provided
- **Message:** "Last FY Annual Income required as end date on latest payslip is {days} days into new financial year (less than {required_months} months)"

**MISSING_LAST_FY_BONUS**
- **When triggered:** verificationMethod = TWO_YEAR_VERIFICATION AND lastFyBonus not provided
- **Message:** "Last FY Bonus required for two-year verification method"

**INSUFFICIENT_EMPLOYMENT_DURATION**
- **When triggered:** Employment duration < 180 days AND no annualOverrideAmount provided
- **Message:** "Employment duration of {days} days is less than required 180 days. Annual override amount required for eligibility"
- **Applies to:** OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS

**ZERO_PAY_CYCLES**
- **When triggered:** daysPayCycleConversion calculation results in 0
- **Message:** "Calculated pay cycles resulted in zero. Verify payslip date ({endDate}) is after employment start date ({startDate}) and within current financial year"
- **Cause:** Payslip date too early in financial year or invalid date range

**NEGATIVE_CALCULATED_VALUE**
- **When triggered:** Any intermediate calculation produces negative result where positive expected
- **Message:** "Calculation error: {calculationType} resulted in negative value. Check input data validity"
- **Examples:** averageAmountPerPayCycle < baseIncome

**INVALID_COMBINATION**
- **When triggered:** Invalid incomeType and verificationMethod combination
- **Message:** "Verification method '{verificationMethod}' is not valid for income type '{incomeType}'"
- **Valid combinations:**
  - OVERTIME: NON_ESSENTIAL_SERVICES, ESSENTIAL_SERVICES
  - BONUS: ONE_YEAR_VERIFICATION, TWO_YEAR_VERIFICATION
  - Others: No verification method required

**EXCESSIVE_DECIMAL_PRECISION**
- **When triggered:** Currency values submitted with more precision than supported
- **Message:** "Value '{value}' for field '{fieldName}' exceeds maximum precision of 2 decimal places"

#### System Errors (HTTP 500)

**CALCULATION_ENGINE_ERROR**
- **When triggered:** Unexpected error in calculation logic
- **Message:** "Internal calculation error occurred. Request ID: {requestId}"
- **Action:** Log full error details, return generic message to user

**DATABASE_ERROR**
- **When triggered:** Data persistence or retrieval fails
- **Message:** "System temporarily unavailable. Please try again later"
- **Examples:** Connection timeout, query failure

**FINANCIAL_YEAR_CONFIG_ERROR**
- **When triggered:** Unable to determine current financial year boundaries
- **Message:** "Financial year configuration error. Contact support"
- **Cause:** Missing or invalid FY configuration data

**VERSION_MISMATCH_ERROR**
- **When triggered:** Requested API version not supported
- **Message:** "API version '{version}' is not supported. Supported versions: {supportedVersions}"

### Error Response Examples

#### Single Field Error
```json
{
  "success": false,
  "timestamp": "2025-06-21T10:30:00.123Z",
  "requestId": "req_123456789",
  "errors": [
    {
      "field": "endDateLatestPayslip",
      "code": "INVALID_DATE_FORMAT",
      "message": "Date field 'endDateLatestPayslip' must be in YYYY-MM-DD format",
      "value": "21/06/2025",
      "path": "$.endDateLatestPayslip"
    }
  ]
}
```

#### Multiple Field Errors
```json
{
  "success": false,
  "timestamp": "2025-06-21T10:30:00.123Z", 
  "requestId": "req_123456789",
  "errors": [
    {
      "field": "baseIncome",
      "code": "OUT_OF_RANGE",
      "message": "Value -1000 for field 'baseIncome' must be between 0 and 99999999.99",
      "value": -1000,
      "path": "$.baseIncome"
    },
    {
      "field": "salaryFrequency",
      "code": "INVALID_ENUM_VALUE",
      "message": "Invalid value 'weekly' for field 'salaryFrequency'. Must be one of: WEEKLY, FORTNIGHTLY, MONTHLY",
      "value": "weekly",
      "path": "$.salaryFrequency"
    }
  ]
}
```

#### Business Logic Error
```json
{
  "success": false,
  "timestamp": "2025-06-21T10:30:00.123Z",
  "requestId": "req_123456789", 
  "errors": [
    {
      "field": "employmentDuration",
      "code": "INSUFFICIENT_EMPLOYMENT_DURATION",
      "message": "Employment duration of 120 days is less than required 180 days. Annual override amount required for eligibility",
      "value": 120,
      "path": "$.calculated.employmentDuration"
    }
  ]
}
```

### Field-Specific Validation Rules

#### Date Fields
- **Format:** ISO 8601 (YYYY-MM-DD)
- **Range:** Must not be in future
- **Business rules:** Employment start ≤ payslip end date
- **Financial year:** July 1 to June 30 boundaries

#### Monetary Fields
- **Type:** Number with up to 2 decimal places
- **Range:** 0.00 to 99,999,999.99
- **Validation:** No negative values, multipleOf: 0.01
- **Examples:** 1000.50 ✅, 1000.505 ❌, -100 ❌

#### Frequency Fields
- **Values:** "WEEKLY", "FORTNIGHTLY", "MONTHLY"
- **Case sensitive:** Exact match required (uppercase)
- **Invalid examples:** "weekly", "Weekly", "DAILY"

#### Income Type Fields
- **Validation:** Must match predefined enum values exactly
- **Cross-validation:** Some combinations require additional fields
- **Dependencies:** Determines required field set

### Validation Sequence

1. **JSON Schema Validation** - Basic structure and types
2. **Field Type Validation** - Data type compliance  
3. **Range/Format Validation** - Value constraints and patterns
4. **Enum Validation** - Allowed value verification
5. **Conditional Field Validation** - Income type specific requirements
6. **Cross-Field Validation** - Dependencies between fields
7. **Business Rule Validation** - Domain-specific constraints
8. **Calculation Validation** - Verify intermediate results are sensible
9. **Final Result Validation** - Ensure output meets business expectations

## Version Management
- **API Version:** Semantic versioning (e.g., "v1.2.3")
- **Logic Version:** Calculation rule versioning (e.g., "2025.1")
- **Backwards Compatibility:** Multiple logic versions supported simultaneously
- **Version Tracking:** All responses include version information