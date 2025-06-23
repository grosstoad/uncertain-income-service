const { calculateCommissionsIncome } = require('./src/v1/calculations/commissionsCalculations');
const { getCurrentFinancialYearBounds } = require('./src/v1/calculations/financialYearUtils');

console.log('📊 COMPREHENSIVE TEST CASE 1 BREAKDOWN');
console.log('=' .repeat(80));

const case1 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 2000,
  endDateLatestPayslip: '2024-12-01',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 88000,
  lastFyAnnualIncome: 150000
};

console.log('📋 INPUT DATA:');
console.log(`- Salary Frequency: ${case1.salaryFrequency}`);
console.log(`- Base Income: $${case1.baseIncome.toLocaleString()}`);
console.log(`- End Date Latest Payslip: ${case1.endDateLatestPayslip}`);
console.log(`- Employment Start Date: ${case1.employmentStartDate}`);
console.log(`- YTD Amount Latest Payslip: $${case1.ytdAmountLatestPayslip.toLocaleString()}`);
console.log(`- Last FY Annual Income: $${case1.lastFyAnnualIncome.toLocaleString()}`);

console.log('\n🔢 STEP-BY-STEP CALCULATIONS:');

// Step 1: Basic multipliers and annual base
const frequencyMultiplier = { MONTHLY: 12, FORTNIGHTLY: 26, WEEKLY: 52 }[case1.salaryFrequency];
const annualBaseSalary = case1.baseIncome * frequencyMultiplier;

console.log(`1. Frequency Multiplier: ${frequencyMultiplier}`);
console.log(`2. Annual Base Salary: $${case1.baseIncome} × ${frequencyMultiplier} = $${annualBaseSalary.toLocaleString()}`);

// Step 2: Financial Year boundaries
const payslipDate = new Date(case1.endDateLatestPayslip);
const fyBounds = getCurrentFinancialYearBounds(case1.endDateLatestPayslip);

console.log(`3. Payslip Date: ${case1.endDateLatestPayslip}`);
console.log(`4. Current FY Boundaries: ${fyBounds.start} to ${fyBounds.end}`);

// Step 3: YTD period calculation
const fyStartDate = new Date(Math.max(new Date(fyBounds.start), new Date(case1.employmentStartDate)));
const diffMs = payslipDate - fyStartDate;
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Exclude start date (153 days)

// Apply frequency-specific rounding rules
const daysToPayCycles = (diffDays / 365) * frequencyMultiplier;
let daysPayCycleConversion;

if (case1.salaryFrequency === 'MONTHLY') {
  // MONTHLY: >0.25 rounds up, ≤0.25 rounds down
  const decimal = daysToPayCycles - Math.floor(daysToPayCycles);
  if (decimal > 0.25) {
    daysPayCycleConversion = Math.ceil(daysToPayCycles);
  } else {
    daysPayCycleConversion = Math.floor(daysToPayCycles);
  }
} else {
  // FORTNIGHTLY/WEEKLY: round up
  daysPayCycleConversion = Math.ceil(daysToPayCycles);
}

console.log(`5. FY Start for Calculation: ${fyStartDate.toISOString().split('T')[0]}`);
console.log(`6. Days from FY start to payslip: ${diffDays}`);
console.log(`7. Days to pay cycles (raw): ${daysToPayCycles.toFixed(6)}`);
console.log(`8. Days Pay Cycle Conversion (rounded up): ${daysPayCycleConversion}`);

// Step 4: Average calculations
const averageAmountPerPayCycle = case1.ytdAmountLatestPayslip / daysPayCycleConversion;
const averageAmountLessBaseIncomeAnnual = (averageAmountPerPayCycle - case1.baseIncome) * frequencyMultiplier;
const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;

console.log(`9. Average Amount Per Pay Cycle: $${case1.ytdAmountLatestPayslip.toLocaleString()} ÷ ${daysPayCycleConversion} = $${averageAmountPerPayCycle.toFixed(2)}`);
console.log(`10. Average Less Base (Per Pay Cycle): $${averageAmountPerPayCycle.toFixed(2)} - $${case1.baseIncome} = $${(averageAmountPerPayCycle - case1.baseIncome).toFixed(2)}`);
console.log(`11. Average Less Base (Annual): $${(averageAmountPerPayCycle - case1.baseIncome).toFixed(2)} × ${frequencyMultiplier} = $${averageAmountLessBaseIncomeAnnual.toFixed(2)}`);
console.log(`12. Average Less Base (Monthly): $${averageAmountLessBaseIncomeAnnual.toFixed(2)} ÷ 12 = $${averageAmountLessBaseIncomeMonthly.toFixed(2)}`);

// Step 5: Prior FY calculations
const lastFyCommissionAnnual = Math.max(0, case1.lastFyAnnualIncome - annualBaseSalary);
const lastFyCommissionMonthly = lastFyCommissionAnnual / 12;

console.log(`13. Last FY Commission (Annual): MAX(0, $${case1.lastFyAnnualIncome.toLocaleString()} - $${annualBaseSalary.toLocaleString()}) = $${lastFyCommissionAnnual.toFixed(2)}`);
console.log(`14. Last FY Commission (Monthly): $${lastFyCommissionAnnual.toFixed(2)} ÷ 12 = $${lastFyCommissionMonthly.toFixed(2)}`);

// Step 6: 12-month rolling period generation
const payslipMonth = payslipDate.getMonth() + 1;
const endMonth = payslipMonth === 1 ? 12 : payslipMonth - 1;

console.log(`\n🔄 12-MONTH ROLLING PERIOD GENERATION:`);
console.log(`15. Payslip Month: ${payslipMonth} (${payslipDate.toLocaleDateString('en-US', { month: 'long' })})`);
console.log(`16. 12-Month Period Ends: Month ${endMonth} (${new Date(2024, endMonth - 1, 1).toLocaleDateString('en-US', { month: 'long' })})`);

const months = [];
for (let i = 0; i < 12; i++) {
  let month = endMonth - i;
  let year = payslipDate.getFullYear();
  
  if (month <= 0) {
    month += 12;
    year--;
  }
  
  months.unshift({ month, year });
}

console.log('17. 12-Month Period:');
months.forEach((m, i) => {
  const monthName = new Date(m.year, m.month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  console.log(`    ${(i + 1).toString().padStart(2)}. ${monthName}`);
});

// Step 7: Monthly classification and amounts
console.log(`\n📅 MONTHLY CLASSIFICATION & AMOUNTS:`);
console.log(`Current FY Boundaries: ${fyBounds.start} to ${fyBounds.end}`);
console.log(`Classification Logic: monthString >= "${fyBounds.start}" AND monthString <= "${fyBounds.end}"`);

let totalAmount = 0;
console.log('\nMonth-by-Month Analysis:');

months.forEach((m, i) => {
  const monthString = `${m.year}-${m.month.toString().padStart(2, '0')}-01`;
  const isCurrent = monthString >= fyBounds.start && monthString <= fyBounds.end;
  
  let monthlyAmount;
  if (isCurrent) {
    monthlyAmount = averageAmountLessBaseIncomeMonthly;
  } else {
    monthlyAmount = lastFyCommissionMonthly;
  }
  
  totalAmount += monthlyAmount;
  
  const monthName = new Date(m.year, m.month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  console.log(`${(i + 1).toString().padStart(2)}. ${monthName.padEnd(8)} | ${monthString} | ${monthString >= fyBounds.start ? '✓' : '✗'}≥start ${monthString <= fyBounds.end ? '✓' : '✗'}≤end | ${(isCurrent ? 'Current' : 'Prior  ').padEnd(7)} FY | $${monthlyAmount.toFixed(2).padStart(10)}`);
});

console.log(`${''.padStart(80, '-')}`);
console.log(`TOTAL: $${totalAmount.toFixed(2)}`);

// Step 8: Final comparison
console.log(`\n🎯 FINAL RESULTS:`);
console.log(`- Calculated Total: $${totalAmount.toFixed(2)}`);
console.log(`- Expected Total: $151,500.00`);
console.log(`- Difference: $${Math.abs(totalAmount - 151500).toFixed(2)}`);
console.log(`- Status: ${Math.abs(totalAmount - 151500) < 0.01 ? '✅ MATCH' : '❌ MISMATCH'}`);

// Step 9: Function verification
const result = calculateCommissionsIncome(case1);
console.log(`- Function Result: $${result.allowableAnnualIncome.toFixed(2)}`);
console.log(`- Function vs Manual: ${Math.abs(result.allowableAnnualIncome - totalAmount) < 0.01 ? '✅ MATCH' : '❌ MISMATCH'}`);

console.log('\n🔍 DIAGNOSIS COMPLETE - Ready for your analysis!'); 