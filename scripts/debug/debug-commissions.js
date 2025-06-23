const { calculateCommissionsIncome } = require('./src/v1/calculations/commissionsCalculations');
const { getCurrentFinancialYearBounds } = require('./src/v1/calculations/financialYearUtils');

console.log('🐛 Debug Case 2: 2025-03-15 payslip\n');

const case2 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 4500,
  endDateLatestPayslip: '2025-03-15',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 130000,
  lastFyAnnualIncome: 220000
};

// Step-by-step debug
const payslipDate = new Date(case2.endDateLatestPayslip);
const fyBounds = getCurrentFinancialYearBounds(case2.endDateLatestPayslip);
console.log(`📅 Payslip Date: ${case2.endDateLatestPayslip}`);
console.log(`📅 FY Bounds: ${fyBounds.start} to ${fyBounds.end}`);

const fyStartDate = new Date(Math.max(
  new Date(fyBounds.start),
  new Date(case2.employmentStartDate)
));

console.log(`📅 FY Start for Calc: ${fyStartDate.toISOString().split('T')[0]}`);

const diffMs = payslipDate - fyStartDate;
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
console.log(`📊 Days from FY start to payslip: ${diffDays}`);

const daysToPayCycles = (diffDays / 365) * 12;
const daysPayCycleConversion = Math.ceil(daysToPayCycles);
console.log(`📊 Days to pay cycles: ${daysToPayCycles}`);
console.log(`📊 Rounded pay cycles: ${daysPayCycleConversion}`);

const averageAmountPerPayCycle = case2.ytdAmountLatestPayslip / daysPayCycleConversion;
const commissionMonthly = (averageAmountPerPayCycle - case2.baseIncome);

console.log(`💰 Average per pay cycle: $${averageAmountPerPayCycle}`);
console.log(`💰 Commission per month: $${commissionMonthly}`);

// Expected Excel values from user
console.log('\n📊 Expected from Excel:');
console.log('- YTD Period: 9 months');
console.log('- Days Pay Cycle Conversion: 9');
console.log('- Average Amount Per Pay Cycle: $14,444.44');
console.log('- Commission Per Month: $9,944.44');

// Generate 12-month rolling period
const payslipMonth = payslipDate.getMonth() + 1;
const endMonth = payslipMonth === 1 ? 12 : payslipMonth - 1;

console.log(`\n🔄 12-Month Rolling Period (ending month ${endMonth}):`);

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

console.log('Months in rolling period:');
months.forEach((m, i) => {
  const monthDate = new Date(m.year, m.month - 1, 1);
  const monthFyBounds = getCurrentFinancialYearBounds(monthDate);
  const isCurrent = monthDate >= new Date(monthFyBounds.start);
  
  console.log(`  ${i + 1}. ${String(m.month).padStart(2, '0')}/${m.year} - ${isCurrent ? 'Current FY' : 'Prior FY'}`);
});

console.log('\n💯 Running actual calculation...');
const result = calculateCommissionsIncome(case2);
console.log(`Result: $${result.allowableAnnualIncome}`);
console.log(`Expected: $134,888.89`);
console.log(`Difference: $${Math.abs(result.allowableAnnualIncome - 134888.89)}`); 