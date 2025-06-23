# Debug Scripts

This directory contains debugging and analysis scripts that were moved from the project root for better organization.

## Scripts Overview

### Date Calculation Debugging
- **`verify-days.js`** - Validates days calculation methods and identifies discrepancies
- **`debug-july.js`** - Specific debugging for July 2024 date comparison issues

### Commission Calculation Analysis  
- **`debug-commissions.js`** - Step-by-step debugging for commission calculations
- **`test-both-commissions.js`** - Compares different commission calculation methods
- **`monthly-amounts.js`** - 12-month breakdown analysis for commission income

### Test Case Validation
- **`case1-full-breakdown.js`** - Complete breakdown of test case 1 calculations
- **`detailed-breakdown.js`** - Detailed calculation analysis

## Usage

These scripts can be run with Node.js to debug specific calculation scenarios:

```bash
# Example: Debug date calculations
node scripts/debug/verify-days.js

# Example: Analyze commission calculations  
node scripts/debug/debug-commissions.js
```

## Note

These scripts were created during development to validate calculations and identify issues. They use the legacy date calculation methods and may not reflect the current simplified implementation using `date-fns`.

For current calculation validation, refer to the Jest test files in the `src/calculations/` directory. 