# Uncertain Income Calculator - Test UI

A comprehensive web interface for testing the Uncertain Income Calculation API across all 6 supported income types.

## Features

- **All 6 Income Types Supported**: OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS, BONUS, INVESTMENT_SHARES, INVESTMENT_INTEREST
- **Dynamic Form Generation**: Shows relevant fields based on selected income type
- **Real-time Validation**: Client-side validation with helpful field descriptions
- **Beautiful Results Display**: Formatted calculation results with detailed breakdowns
- **Error Handling**: Clear error messages with field-specific validation feedback
- **Responsive Design**: Works on desktop and mobile devices

## Income Types & Field Requirements

### 1. OVERTIME
**Required Fields:**
- Verification Method (Non-Essential Services / Essential Services)
- Salary Frequency (Weekly / Fortnightly / Monthly)
- Base Income per Pay Period
- End Date of Latest Payslip
- Employment Start Date
- YTD Amount on Latest Payslip

**Optional Fields:**
- Last Financial Year Annual Income
- Annual Override Amount

### 2. CASUAL
**Required Fields:**
- Salary Frequency (Weekly / Fortnightly / Monthly)
- End Date of Latest Payslip
- Employment Start Date
- YTD Amount on Latest Payslip

**Optional Fields:**
- Last Financial Year Annual Income
- Annual Override Amount

### 3. CONTRACT_VARIABLE
**Required Fields:**
- Salary Frequency (Weekly / Fortnightly / Monthly)
- End Date of Latest Payslip
- Employment Start Date
- YTD Amount on Latest Payslip

**Optional Fields:**
- Last Financial Year Annual Income
- Annual Override Amount

### 4. COMMISSIONS
**Required Fields:**
- Salary Frequency (Weekly / Fortnightly / Monthly)
- Base Income per Pay Period
- End Date of Latest Payslip
- Employment Start Date
- YTD Amount on Latest Payslip

**Optional Fields:**
- Last Financial Year Annual Income
- Annual Override Amount
- **Actual YTD Commission** (unique to commissions - takes priority)

### 5. BONUS
**Required Fields:**
- Verification Method (One Year / Two Year Verification)
- Current Financial Year Bonus

**Optional Fields:**
- Last Financial Year Bonus (required for two-year verification)
- Actual YTD Bonus

### 6. INVESTMENT (Shares & Interest)
**Required Fields:**
- Current Financial Year Income
- Last Financial Year Income

**Optional Fields:**
- Actual YTD Investment Income

## How to Use

1. **Start the API Server**
   ```bash
   cd /path/to/uncertain-income-service
   npm run start  # Starts serverless offline on http://localhost:3000
   ```

2. **Open the UI**
   ```bash
   cd ui
   open index.html  # Or serve with a local web server
   ```

3. **Test Income Calculations**
   - Select an income type from the dropdown
   - Fill in the required fields (marked with *)
   - Optionally fill in additional fields for different calculation scenarios
   - Click "Calculate Allowable Income"
   - View the detailed results or error messages

## API Configuration

The UI is configured to connect to the local development server at:
```
http://localhost:3000/v1/calculate
```

To change the API endpoint, modify the `apiUrl` property in `app.js`:
```javascript
this.apiUrl = 'https://your-api-domain.com/v1/calculate';
```

## Sample Test Cases

### OVERTIME Example
- Income Type: OVERTIME
- Verification Method: NON_ESSENTIAL_SERVICES
- Salary Frequency: FORTNIGHTLY
- Base Income: 2000
- End Date: 2025-06-01
- Employment Start: 2024-07-01
- YTD Amount: 150000
- **Expected Result**: ~$110,500 allowable annual income

### COMMISSIONS Example
- Income Type: COMMISSIONS
- Salary Frequency: MONTHLY
- Base Income: 4000
- End Date: 2025-06-01
- Employment Start: 2024-01-01
- YTD Amount: 80000
- Actual YTD Commission: 60000
- **Expected Result**: Uses actual commission amount

### BONUS Example
- Income Type: BONUS
- Verification Method: TWO_YEAR_VERIFICATION
- Current FY Bonus: 10000
- Last FY Bonus: 8000
- **Expected Result**: MIN(average of 9000, 10000) = 9000

## Priority Orders

The UI correctly handles the different priority orders for each income type:

1. **OVERTIME/CASUAL/CONTRACT_VARIABLE**: Override → Calculated
2. **COMMISSIONS**: Actual YTD Commission → Override → Calculated
3. **BONUS/INVESTMENT**: Direct calculation only (no overrides)

## Features

- **Real-time Field Descriptions**: Each field has helpful tooltips explaining its purpose
- **Validation Feedback**: Clear error messages for validation failures
- **Calculation Details**: Detailed breakdown of calculation steps
- **Currency Formatting**: Australian dollar formatting for all monetary values
- **Version Information**: Shows API and logic versions in results
- **Loading States**: Visual feedback during API calls
- **Error Recovery**: Graceful handling of connection errors and API failures

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

The UI is built with vanilla JavaScript and modern CSS, requiring no build process. Simply edit the files and refresh the browser to see changes.

### File Structure
```
ui/
├── index.html      # Main HTML structure and styling
├── app.js          # JavaScript application logic
└── README.md       # This documentation
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure the API server is running on http://localhost:3000
   - Check browser console for CORS errors
   - Verify the API endpoint URL in app.js

2. **Validation Errors**
   - Check that all required fields are filled
   - Ensure date fields are in YYYY-MM-DD format
   - Verify numeric fields are within allowed ranges (0 to 99,999,999.99)

3. **Calculation Results Not Showing**
   - Check the API response in browser dev tools
   - Verify the request payload matches expected schema
   - Ensure all required fields for the selected income type are provided

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "incomeType": "OVERTIME",
    "verificationMethod": "NON_ESSENTIAL_SERVICES",
    "allowableAnnualIncome": 110500,
    "calculationDetails": { ... },
    "eligible": true
  },
  "versions": {
    "api": "1.0.0",
    "logic": "2025.1"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "baseIncome",
      "code": "MISSING_REQUIRED_FIELD",
      "message": "Required field 'baseIncome' is missing or empty",
      "value": null,
      "path": "$.baseIncome"
    }
  ],
  "timestamp": "2025-06-21T11:30:00.123Z",
  "requestId": "req_123456789"
}
``` 