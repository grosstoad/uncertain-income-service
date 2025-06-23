const { calculateCommissionsIncome } = require('./src/v1/calculations/commissionsCalculations');
const { getCurrentFinancialYearBounds } = require('./src/v1/calculations/financialYearUtils');

function getMonthlyBreakdown(caseNum, testCase) {
  console.log(`\n📊 TEST CASE ${caseNum} - 12-MONTH BREAKDOWN`);
  console.log(`${'='.repeat(50)}`);
  
  const {
    salaryFrequency,
    baseIncome,
    endDateLatestPayslip,
    employmentStartDate,
    ytdAmountLatestPayslip,
    lastFyAnnualIncome
  } = testCase;

  // Calculate base values
  const frequencyMultiplier = { MONTHLY: 12, FORTNIGHTLY: 26, WEEKLY: 52 }[salaryFrequency];
  const annualBaseSalary = baseIncome * frequencyMultiplier;
  
  // YTD calculations
  const payslipDate = new Date(endDateLatestPayslip);
  const fyBounds = getCurrentFinancialYearBounds(endDateLatestPayslip);
  const fyStartDate = new Date(Math.max(new Date(fyBounds.start), new Date(employmentStartDate)));
  
  const diffMs = payslipDate - fyStartDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Exclude start date (153 days)
  
  // Apply frequency-specific rounding rules
  const daysToPayCycles = (diffDays / 365) * frequencyMultiplier;
  let daysPayCycleConversion;
  
  if (salaryFrequency === 'MONTHLY') {
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
  
  // Average amounts
  const averageAmountPerPayCycle = ytdAmountLatestPayslip / daysPayCycleConversion;
  const averageAmountLessBaseIncomeAnnual = (averageAmountPerPayCycle - baseIncome) * frequencyMultiplier;
  const averageAmountLessBaseIncomeMonthly = averageAmountLessBaseIncomeAnnual / 12;
  
  // Generate 12-month rolling period
  const payslipMonth = payslipDate.getMonth() + 1;
  const endMonth = payslipMonth === 1 ? 12 : payslipMonth - 1;
  
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
  
  console.log(`Input: ${endDateLatestPayslip} payslip, $${baseIncome} base, $${ytdAmountLatestPayslip.toLocaleString()} YTD`);
  console.log(`Current FY: ${fyBounds.start} to ${fyBounds.end}`);
  console.log(`Current FY Monthly: $${averageAmountLessBaseIncomeMonthly.toFixed(2)}`);
  console.log(`Prior FY Monthly: $${lastFyCommissionMonthly.toFixed(2)}\n`);

  let totalAmount = 0;
  
  months.forEach((m, i) => {
    // Create month string in YYYY-MM-DD format for comparison (avoids timezone issues)
    const monthString = `${m.year}-${m.month.toString().padStart(2, '0')}-01`;
    
    // Check if this month falls within the payslip's current FY using string comparison
    const isCurrent = monthString >= fyBounds.start && monthString <= fyBounds.end;
    
    let monthlyAmount;
    if (isCurrent) {
      monthlyAmount = averageAmountLessBaseIncomeMonthly;
    } else {
      monthlyAmount = lastFyCommissionMonthly;
    }
    
    totalAmount += monthlyAmount;
    
    const monthName = new Date(m.year, m.month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    console.log(`${(i + 1).toString().padStart(2)}. ${monthName.padEnd(8)} | $${monthlyAmount.toFixed(2).padStart(10)} | ${isCurrent ? 'Current FY' : 'Prior FY  '}`);
  });
  
  console.log(`${''.padStart(30, '-')}`);
  console.log(`TOTAL:${' '.repeat(11)} | $${totalAmount.toFixed(2).padStart(10)}`);

  return totalAmount;
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

const total1 = getMonthlyBreakdown(1, case1);
const total2 = getMonthlyBreakdown(2, case2);

console.log(`\n${'='.repeat(60)}`);
console.log(`📋 SUMMARY`);
console.log(`${'='.repeat(60)}`);
console.log(`Case 1 Total: $${total1.toFixed(2)} (Expected: $151,500.00)`);
console.log(`Case 2 Total: $${total2.toFixed(2)} (Expected: $134,888.89)`);
console.log(`\nCase 1 Difference: $${Math.abs(total1 - 151500).toFixed(2)}`);
console.log(`Case 2 Difference: $${Math.abs(total2 - 134888.89).toFixed(2)}`); 