const { calculateCommissionsIncome } = require('./src/v1/calculations/commissionsCalculations');
const { getCurrentFinancialYearBounds } = require('./src/v1/calculations/financialYearUtils');

function analyzeCase(caseNum, testCase) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 DETAILED BREAKDOWN - TEST CASE ${caseNum}`);
  console.log(`${'='.repeat(80)}`);
  
  const {
    salaryFrequency,
    baseIncome,
    endDateLatestPayslip,
    employmentStartDate,
    ytdAmountLatestPayslip,
    lastFyAnnualIncome
  } = testCase;

  console.log(`📋 Input Data:`);
  console.log(`- Salary Frequency: ${salaryFrequency}`);
  console.log(`- Base Income: $${baseIncome.toLocaleString()}`);
  console.log(`- End Date Latest Payslip: ${endDateLatestPayslip}`);
  console.log(`- Employment Start Date: ${employmentStartDate}`);
  console.log(`- YTD Amount Latest Payslip: $${ytdAmountLatestPayslip.toLocaleString()}`);
  console.log(`- Last FY Annual Income: $${lastFyAnnualIncome.toLocaleString()}\n`);

  // Step 1: Basic calculations
  const frequencyMultiplier = { MONTHLY: 12, FORTNIGHTLY: 26, WEEKLY: 52 }[salaryFrequency];
  const annualBaseSalary = baseIncome * frequencyMultiplier;
  
  console.log(`🔢 Basic Calculations:`);
  console.log(`- Frequency Multiplier: ${frequencyMultiplier}`);
  console.log(`- Annual Base Salary: $${annualBaseSalary.toLocaleString()}\n`);

  // Step 2: YTD calculations
  const payslipDate = new Date(endDateLatestPayslip);
  const fyBounds = getCurrentFinancialYearBounds(endDateLatestPayslip);
  const fyStartDate = new Date(Math.max(new Date(fyBounds.start), new Date(employmentStartDate)));
  
  const diffMs = payslipDate - fyStartDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const daysToPayCycles = (diffDays / 365) * frequencyMultiplier;
  const daysPayCycleConversion = Math.ceil(daysToPayCycles);
  
  console.log(`📅 YTD Period Calculations:`);
  console.log(`- Payslip Date: ${endDateLatestPayslip}`);
  console.log(`- Current FY: ${fyBounds.start} to ${fyBounds.end}`);
  console.log(`- FY Start for Calc: ${fyStartDate.toISOString().split('T')[0]}`);
  console.log(`- Days from start to payslip: ${diffDays}`);
  console.log(`- Days to pay cycles (raw): ${daysToPayCycles.toFixed(6)}`);
  console.log(`- Days Pay Cycle Conversion (rounded up): ${daysPayCycleConversion}\n`);

  // Step 3: Average amounts
  const averageAmountPerPayCycle = ytdAmountLatestPayslip / daysPayCycleConversion;
  const averageAmountLessBaseIncomeAnnual = (averageAmountPerPayCycle - baseIncome) * frequencyMultiplier;
  const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;
  
  console.log(`💰 Average Calculations:`);
  console.log(`- Average Amount Per Pay Cycle: $${averageAmountPerPayCycle.toFixed(2)}`);
  console.log(`- Average Amount Less Base Income (Annual): $${averageAmountLessBaseIncomeAnnual.toFixed(2)}`);
  console.log(`- Average Amount Less Base Income (Monthly): $${averageAmountLessBaseIncomeMonthly.toFixed(2)}\n`);

  // Step 4: 12-month rolling period
  const payslipMonth = payslipDate.getMonth() + 1;
  const endMonth = payslipMonth === 1 ? 12 : payslipMonth - 1;
  
  console.log(`🔄 12-Month Rolling Period (ending month ${endMonth}):`);
  
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

  // Calculate last FY commission monthly
  const lastFyCommissionAnnual = Math.max(0, lastFyAnnualIncome - annualBaseSalary);
  const lastFyCommissionMonthly = lastFyCommissionAnnual / 12;
  
  console.log(`📊 Prior FY Commission:`);
  console.log(`- Last FY Commission Annual: $${lastFyCommissionAnnual.toFixed(2)}`);
  console.log(`- Last FY Commission Monthly: $${lastFyCommissionMonthly.toFixed(2)}\n`);

  console.log(`📅 Monthly Breakdown:`);
  let totalAmount = 0;
  
  months.forEach((m, i) => {
    const monthDate = new Date(m.year, m.month - 1, 1);
    
    // Check if this month falls within the payslip's current FY
    const isCurrent = monthDate >= new Date(fyBounds.start) && monthDate <= new Date(fyBounds.end);
    
    let monthlyAmount;
    if (isCurrent) {
      monthlyAmount = averageAmountLessBaseIncomeMonthly;
    } else {
      monthlyAmount = lastFyCommissionMonthly;
    }
    
    totalAmount += monthlyAmount;
    
    const monthName = new Date(m.year, m.month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    console.log(`  ${(i + 1).toString().padStart(2)}. ${monthName.padEnd(8)} | ${(isCurrent ? 'Current' : 'Prior  ').padEnd(7)} FY | $${monthlyAmount.toFixed(2).padStart(10)}`);
  });
  
  console.log(`${''.padStart(50, '-')}`);
  console.log(`${''.padStart(35)}TOTAL: $${totalAmount.toFixed(2).padStart(10)}`);
  
  // Step 5: Final result
  const result = calculateCommissionsIncome(testCase);
  
  console.log(`\n🎯 Final Results:`);
  console.log(`- Calculated Total: $${totalAmount.toFixed(2)}`);
  console.log(`- Function Result: $${result.allowableAnnualIncome.toFixed(2)}`);
  console.log(`- Match: ${Math.abs(totalAmount - result.allowableAnnualIncome) < 0.01 ? '✅' : '❌'}`);
  
  return { totalAmount, result };
}

// Test Case 1
const case1 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 2000,
  endDateLatestPayslip: '2024-12-01',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 88000,
  lastFyAnnualIncome: 150000
};

// Test Case 2  
const case2 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 4500,
  endDateLatestPayslip: '2025-03-15',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 130000,
  lastFyAnnualIncome: 220000
};

console.log('📈 COMMISSIONS DETAILED BREAKDOWN ANALYSIS');

const result1 = analyzeCase(1, case1);
const result2 = analyzeCase(2, case2);

console.log(`\n${'='.repeat(80)}`);
console.log(`📊 SUMMARY COMPARISON`);
console.log(`${'='.repeat(80)}`);

console.log(`Case 1:`);
console.log(`- Calculated: $${result1.totalAmount.toFixed(2)}`);
console.log(`- Expected: $151,500.00`);
console.log(`- Difference: $${Math.abs(result1.totalAmount - 151500).toFixed(2)}`);

console.log(`\nCase 2:`);
console.log(`- Calculated: $${result2.totalAmount.toFixed(2)}`);
console.log(`- Expected: $134,888.89`);
console.log(`- Difference: $${Math.abs(result2.totalAmount - 134888.89).toFixed(2)}`);

console.log('\n🏁 Analysis Complete'); 