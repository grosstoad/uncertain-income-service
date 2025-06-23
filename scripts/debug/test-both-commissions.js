const { calculateCommissionsIncome } = require('./src/v1/calculations/commissionsCalculations');

console.log('🧪 Testing Both COMMISSIONS Cases...\n');

// Test Case 1: Original case
console.log('📋 Test Case 1:');
console.log('Monthly salary frequency, 2000 base salary income, 2024-12-01 date of latest payslip');
console.log('88000 ytd amount on payslip, 150000 last fy annual income. Should produce 151500\n');

const case1 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 2000,
  endDateLatestPayslip: '2024-12-01',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 88000,
  lastFyAnnualIncome: 150000
};

let result1;
try {
  result1 = calculateCommissionsIncome(case1);
  console.log(`✅ Case 1 Result: $${result1.allowableAnnualIncome.toLocaleString()}`);
  console.log(`✅ Expected: $151,500`);
  console.log(`✅ Match: ${Math.abs(result1.allowableAnnualIncome - 151500) < 0.01 ? '✅ Perfect!' : '❌ Difference: $' + Math.abs(result1.allowableAnnualIncome - 151500).toLocaleString()}`);
  console.log(`- YTD Months: ${result1.calculationDetails.daysPayCycleConversion}`);
  console.log(`- Commission/Month: $${result1.calculationDetails.averageAmountLessBaseIncomeMonthly.toLocaleString()}`);
} catch (error) {
  console.error('❌ Case 1 Error:', error.message);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test Case 2: Corrected case
console.log('📋 Test Case 2:');
console.log('Monthly salary frequency, 4500 base salary income, 2025-03-15 date of latest payslip');
console.log('130000 ytd amount on payslip, 220000 last fy annual income. Should produce 134888.89\n');

const case2 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 4500,
  endDateLatestPayslip: '2025-03-15',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 130000,
  lastFyAnnualIncome: 220000
};

let result2;
try {
  result2 = calculateCommissionsIncome(case2);
  console.log(`✅ Case 2 Result: $${result2.allowableAnnualIncome.toLocaleString()}`);
  console.log(`✅ Expected: $134,888.89`);
  console.log(`✅ Match: ${Math.abs(result2.allowableAnnualIncome - 134888.89) < 1 ? '✅ Perfect!' : '❌ Difference: $' + Math.abs(result2.allowableAnnualIncome - 134888.89).toLocaleString()}`);
  console.log(`- YTD Months: ${result2.calculationDetails.daysPayCycleConversion}`);
  console.log(`- Commission/Month: $${result2.calculationDetails.averageAmountLessBaseIncomeMonthly.toLocaleString()}`);
} catch (error) {
  console.error('❌ Case 2 Error:', error.message);
}

console.log('\n🎯 Final Summary:');
console.log(`- Case 1: ${Math.abs(result1?.allowableAnnualIncome - 151500) < 0.01 ? 'WORKS ✅' : 'NEEDS FIX ❌'}`);
console.log(`- Case 2: ${Math.abs(result2?.allowableAnnualIncome - 134888.89) < 1 ? 'WORKS ✅' : 'NEEDS FIX ❌'}`);

console.log('\n�� Test Complete'); 