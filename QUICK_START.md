# Uncertain Income Service - Quick Start Guide

## ✅ Current Status: FULLY COMPLETE
- All TypeScript errors resolved
- All Jest test dependencies fixed
- Generic service (no Athena dependencies)
- Beautiful UI test interface created
- All 6 income types implemented and tested

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Environment
**Option A: Start Everything (Recommended)**
```bash
npm run dev:full
```
This starts:
- API server on `http://localhost:3000`
- UI server on `http://localhost:8080` (opens automatically)

**Option B: Start Services Separately**
```bash
npm run dev        # API server only
npm run dev:ui     # UI server only (different terminal)
```

### 3. Test the API
1. **Select an income type** from the dropdown
2. **Fill in required fields** (marked with *)
3. **Optionally add override amounts** for different scenarios
4. **Click "Calculate Allowable Income"**
5. **View detailed results** with calculation breakdowns

## 📊 Supported Income Types

| Income Type | Verification Methods | Actual YTD Field | Override Capable |
|------------|---------------------|------------------|------------------|
| **OVERTIME** | Essential/Non-Essential Services | ❌ | ✅ |
| **CASUAL** | N/A | ❌ | ✅ |
| **CONTRACT_VARIABLE** | N/A | ❌ | ✅ |
| **COMMISSIONS** | N/A | ✅ (actualYtdCommission) | ✅ |
| **BONUS** | One Year/Two Year | ❌ | ❌ |
| **INVESTMENT** | N/A | ❌ | ❌ |

## 🧪 Sample Test Cases

### OVERTIME Example
```json
{
  "incomeType": "OVERTIME",
  "verificationMethod": "NON_ESSENTIAL_SERVICES",
  "salaryFrequency": "FORTNIGHTLY",
  "baseIncome": 2000,
  "endDateLatestPayslip": "2025-06-01",
  "employmentStartDate": "2024-07-01",
  "ytdAmountLatestPayslip": 150000
}
```
**Expected**: ~$110,500 allowable annual income

### COMMISSIONS Example
```json
{
  "incomeType": "COMMISSIONS",
  "salaryFrequency": "MONTHLY",
  "baseIncome": 4000,
  "endDateLatestPayslip": "2025-06-01",
  "employmentStartDate": "2024-01-01",
  "ytdAmountLatestPayslip": 80000,
  "actualYtdCommission": 60000
}
```
**Expected**: Uses actual commission amount (60000)

### BONUS Example
```json
{
  "incomeType": "BONUS",
  "verificationMethod": "TWO_YEAR_VERIFICATION",
  "currentFyBonus": 10000,
  "lastFyBonus": 8000
}
```
**Expected**: MIN(average of 9000, 10000) = 9000

## 🔧 Development

### Run Tests
```bash
npm test                    # All tests (may fail on serviceability)
npx jest src/v1 --no-coverage  # Uncertain income tests only
```

### Type Check
```bash
npx tsc --noEmit
```

### API Endpoint
- **URL**: `POST http://localhost:3000/v1/calculate`
- **Headers**: `Content-Type: application/json`
- **Body**: JSON with income type and required fields

## 📁 Project Structure
```
uncertain-income-service/
├── src/v1/                     # Main service code
│   ├── calculations/           # Income calculation logic
│   ├── handlers/               # Lambda handlers
│   ├── middlewares/            # Generic middlewares
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Utility functions
├── ui/                         # Test UI interface
│   ├── index.html             # Main UI file
│   ├── app.js                 # JavaScript logic
│   └── README.md              # UI documentation
└── serviceability/             # Reference implementation (Athena-specific)
```

## 🎯 Key Features

### ✅ Core Service
- **6 Income Types**: All calculation scenarios implemented
- **9 Calculation Permutations**: Every combination tested
- **Generic Implementation**: No proprietary dependencies
- **Comprehensive Validation**: AJV schema validation with structured errors
- **Priority Order Logic**: Correct precedence for all income types

### ✅ Test UI
- **Beautiful Interface**: Modern gradient design, responsive
- **Dynamic Forms**: Context-aware fields based on income type
- **Real-time Validation**: Client-side validation with helpful descriptions
- **Detailed Results**: Formatted calculation breakdowns
- **Error Handling**: Clear validation feedback
- **Sample Cases**: Pre-configured examples for testing

### ✅ Developer Experience
- **Complete Type Safety**: Full TypeScript implementation
- **Comprehensive Tests**: All calculation scenarios covered
- **Documentation**: Detailed API and UI documentation
- **Easy Setup**: One-command start with serverless offline

## 🚀 Ready for Production

The service is fully implemented and tested, ready for:
- Production deployment
- Integration with existing systems
- Full API usage across all 6 income types
- Easy testing via the web UI interface 