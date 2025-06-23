# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AWS Lambda-based microservice for calculating allowable uncertain income amounts for Australian financial institutions. The service handles 6 income types (OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS, BONUS, INVESTMENT) with 9 distinct calculation scenarios, following Australian Financial Year boundaries (July 1 - June 30).

## Common Commands

### Development
```bash
# Start development server with UI
npm run dev:full              # Starts both API (port 3000) and UI (port 8080)

# Individual services
npm run dev                   # API server only
npm run dev:ui               # UI test interface only
npm run dev:serverless       # Serverless offline mode
```

### Testing
```bash
# Run all tests
npm test                     # All tests with coverage (80% threshold required)
npm run test:watch          # Watch mode for development
npm run test:coverage       # Explicit coverage report

# Type checking
npm run test:type           # TypeScript compilation check
```

### Code Quality
```bash
npm run lint                # ESLint check
npm run lint:fix            # Auto-fix linting issues
```

### API Documentation
```bash
npm run build:openapi       # Generate bundled OpenAPI spec + HTML docs
npm run test:openapi        # Validate OpenAPI schema
```

### Integration Testing
```bash
npm run integration:dev     # Newman/Postman tests against dev environment
```

### Deployment
```bash
npm run deploy              # Deploy to default stage
npm run deploy --stage=prod # Deploy to specific stage
```

## Architecture Overview

### Request Flow
```
API Gateway → Lambda Handler → Middy Middleware → Parse/Validate → Calculate → Response
```

### Core Components

**Income Type Routing** (`src/calculateUncertainIncome.ts`)
- Main orchestrator that routes requests to appropriate calculation modules
- Uses switch-case pattern based on `incomeType` discriminated union
- Handles 6 income types with different validation requirements

**Calculation Modules** (`src/calculations/`)
- Each income type has dedicated calculation logic
- `employmentBasedCalculations.ts` handles unified CASUAL + CONTRACT_VARIABLE logic
- `commissionsCalculations.ts` implements complex 12-month rolling calculations
- All modules follow consistent input/output patterns

**Validation Architecture** (Layered approach)
1. **Schema Validation** (HTTP 400) - AJV-based JSON schema validation
2. **Business Rules** (HTTP 422) - Centralized in `src/utils/businessRuleValidation.ts`
3. **Calculation Validation** - Runtime checks during calculations

**Error Handling** (`src/middleware/errorHandler.ts`)
- Middy middleware with 25+ specific error codes
- Proper HTTP status mapping (400/422/500)
- Structured error responses with field-level specificity

**Type System** (`src/types/`)
- Heavy use of discriminated unions for type safety
- Conditional request schemas based on income type
- Strong TypeScript patterns throughout

### Financial Year Logic
- Australian FY: July 1 - June 30
- All date calculations relative to FY boundaries
- Complex cross-FY logic for COMMISSIONS 12-month rolling calculations

### Priority Orders (Critical Business Logic)
- **OVERTIME/CASUAL/CONTRACT_VARIABLE**: Override → Calculated (2-tier)
- **COMMISSIONS**: Actual YTD → Override → Calculated (3-tier, only type with actual YTD)
- **BONUS/INVESTMENT**: Direct calculation only (no overrides)

## Code Quality Status & Remaining Improvements

### ✅ COMPLETED: Major Code Duplication Resolution (baseCalculations.ts)

**✅ Issue Resolved**: Functions `calculateDaysPayCycleConversion()` and `calculatePayCycles()` previously contained 85% identical logic (30 duplicate lines).

**✅ Solution Implemented**:
- **Extracted Core Logic**: `calculatePayCyclesCore(days: number, frequency: SalaryFrequency)` contains single source of truth for rounding rules
- **String-First Architecture**: YYYY-MM-DD string processing is the primary efficient path
- **Maintained APIs**: Both existing functions preserved with no breaking changes
- **Eliminated Duplication**: 60 lines reduced to 43 lines with zero duplication

**✅ Benefits Achieved**:
- Single source of truth for frequency-specific rounding rules
- Improved maintainability - business rule changes only need to be made once
- Better performance with optimized string processing
- Enhanced testability with separated core logic
- Bug prevention - no risk of updating one function but forgetting the other

**✅ Validation**: All tests pass, existing usage in `overtimeCalculations.ts`, `commissionsCalculations.ts`, and `employmentBasedCalculations.ts` continues to work correctly.

### ✅ COMPLETED: Type Safety Enhancement

**✅ Issue Resolved**: Unsafe type assertion in switch statement default case has been replaced with exhaustive checking.

**✅ Solution Implemented**: `src/calculateUncertainIncome.ts:55-57`
```typescript
// Implemented - safe exhaustive checking
return ((_exhaustiveCheck: never): never => {
  throw new InvalidInputError('Unsupported income type');
})(request);
```

**✅ Benefits**: TypeScript will now error at compile-time if new income types are added without proper case handling, preventing runtime errors.

### ✅ COMPLETED: Configuration Constants Extraction

**✅ Issue Resolved**: Hardcoded business values have been centralized into a single configuration file.

**✅ Solution Implemented**: `src/config/businessConstants.ts`
- **Centralized Constants**: All business values (180 days, 365 days, 0.25 threshold, months requirements)
- **Type Safety**: Exported as `const` with TypeScript support
- **IntelliSense Support**: Full autocomplete and type checking for all business constants

**✅ Updated Files**: 
- `src/calculations/baseCalculations.ts` - Updated to use frequency multipliers, days in year, rounding threshold, minimum employment days
- `src/calculations/overtimeCalculations.ts` - Updated to use standard months requirement (6)
- `src/calculations/commissionsCalculations.ts` - Updated to use commissions months requirement (12)
- `src/calculations/employmentBasedCalculations.ts` - Updated to use standard months requirement (6)
- `src/utils/businessRuleValidation.ts` - Updated to use minimum employment days

**✅ Benefits Achieved**:
- **Single Source of Truth**: All business values centralized and easily changeable
- **Type Safety**: Compile-time checking for constant usage
- **Maintainability**: Changes to business rules only require updating one file
- **Documentation**: Constants include clear comments explaining their usage

### ✅ COMPLETED: Error Handling Analysis

**✅ Issue Investigated**: Error handling consistency in `src/middleware/errorHandler.ts:32-40`
**✅ Resolution**: Error handling is working correctly - no changes needed

**Analysis Results:**
- **BusinessLogicError extends InvalidInputError** with structured `errors` property
- **Error handler correctly preserves specific codes** via `error.errors` when `error instanceof InvalidInputError`
- **All business logic errors maintain their specific codes** (e.g., `INSUFFICIENT_EMPLOYMENT_DURATION`, `ZERO_PAY_CYCLES`, `MISSING_LAST_FY_INCOME`)
- **Generic `INTERNAL_ERROR` is only used for unknown error types**, which is correct behavior

**Verified Working Examples:**
```typescript
// BusinessLogicError.insufficientEmploymentDuration(120) produces:
{
  field: "employmentDuration",
  code: "INSUFFICIENT_EMPLOYMENT_DURATION",  // ← Specific code preserved
  message: "Employment duration of 120 days is less than required 180 days...",
  value: 120,
  path: "$.calculated.employmentDuration"
}
```

### 🔄 REMAINING: Performance Optimization Opportunities (Future)
- **Date parsing caching**: For high-volume scenarios, consider caching frequently used date calculations
- **Async calculation patterns**: For complex income types like COMMISSIONS, consider parallel processing
- **Memory optimization**: Reduce object creation in calculation loops

## Business Rules & Constants

### Hardcoded Values (Consider Configuration)
- `180` - Minimum employment duration (days)
- `365` - Days in year (doesn't account for leap years)  
- `0.25` - Monthly pay cycle rounding threshold
- `6` vs `12` - Required months for Last FY income (varies by income type)

### Frequency Multipliers
- WEEKLY: 52, FORTNIGHTLY: 26, MONTHLY: 12

### Rounding Rules (Critical for Accuracy)
- **MONTHLY**: Use 0.25 threshold (>0.25 rounds up, ≤0.25 rounds down)
- **FORTNIGHTLY/WEEKLY**: Always round up (Math.ceil)

## Testing Strategy

### Coverage Requirements
- 80% threshold for branches, functions, lines, statements
- Currently at ~37% - significant gap to address

### Test Organization
- Unit tests co-located with calculation modules (`.test.ts` files)
- Integration tests via Newman/Postman collections
- UI testing interface at `/ui/index.html`

### Key Test Areas
- Each income type calculation logic
- Priority order enforcement (critical business logic)
- Error handling scenarios (25+ error codes)
- Date boundary conditions (FY transitions)
- Rounding rule accuracy

## Deployment Architecture

### AWS Resources
- **Runtime**: Node.js 20.x Lambda
- **API Gateway**: Regional endpoint with custom domain
- **Security**: WAF association, VPC deployment
- **Monitoring**: CloudWatch logs with structured JSON

### Environment Configuration
- **Domain**: `uncertain-income.{domain}/api/uncertain-income`
- **Stages**: dev, test, prod
- **Timeout**: 10 seconds
- **Memory**: Default Lambda allocation

### Infrastructure as Code
- Serverless Framework v3
- Custom domain management
- Resource tagging strategy
- CloudWatch log retention (365 days)

## Development Notes

### Type Safety Patterns
- Extensive use of discriminated unions for income types
- Conditional request schemas based on `incomeType` field
- Proper exhaustive checking in switch statements

### Error Handling Philosophy
- Field-level error specificity with JSONPath
- Consistent error response structure
- Request tracing with unique IDs
- No sensitive information leakage

### Financial Calculation Accuracy
- All monetary values support 2 decimal precision
- Conservative calculations (MIN approach for multi-year averages)
- Proper handling of Australian FY boundaries
- Complex business rules for employment duration eligibility