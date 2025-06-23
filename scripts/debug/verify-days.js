console.log('🔍 TEST CASE INPUTS & OUTPUTS VERIFICATION');
console.log('='.repeat(60));

// Test Case 1 - Original from your conversation
console.log('📋 TEST CASE 1 INPUTS:');
const case1 = {
  salaryFrequency: 'MONTHLY',
  baseIncome: 2000,
  endDateLatestPayslip: '2024-12-01',
  employmentStartDate: '2024-01-01',
  ytdAmountLatestPayslip: 88000,
  lastFyAnnualIncome: 150000
};

Object.entries(case1).forEach(([key, value]) => {
  console.log(`- ${key}: ${value}`);
});

console.log('\n📋 TEST CASE 1 EXPECTED OUTPUT:');
console.log('- Expected Result: $151,500');

console.log('\n🔍 DAYS CALCULATION VERIFICATION:');
console.log('FY Start: 2024-07-01');
console.log('Payslip Date: 2024-12-01');

// Method 1: JavaScript Date difference
const fyStart = new Date('2024-07-01');
const payslipDate = new Date('2024-12-01');
const diffMs = payslipDate - fyStart;
const diffDaysJS = Math.floor(diffMs / (1000 * 60 * 60 * 24));

console.log(`\nMethod 1 - JavaScript Date difference:`);
console.log(`- Milliseconds diff: ${diffMs}`);
console.log(`- Days (not including start): ${diffDaysJS}`);
console.log(`- Days (including start): ${diffDaysJS + 1}`);

// Method 2: Manual counting
console.log(`\nMethod 2 - Manual counting:`);
console.log('- July 2024: 31 days');
console.log('- August 2024: 31 days');
console.log('- September 2024: 30 days');
console.log('- October 2024: 31 days');
console.log('- November 2024: 30 days');
console.log('- December 1, 2024: 1 day');

const julyDays = 31 - 1 + 1; // From July 1 to July 31 = 31 days
const totalDays = 31 + 31 + 30 + 31 + 30 + 1; // July through Dec 1
console.log(`- Total days (July 1 to Dec 1): ${totalDays}`);

// Method 3: Counting from July 1
console.log(`\nMethod 3 - Day-by-day counting from July 1:`);
const startDate = new Date('2024-07-01');
const endDate = new Date('2024-12-01');
let dayCount = 0;
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
  dayCount++;
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`- Days counted (inclusive): ${dayCount}`);

// Method 4: What the user expects (153 days)
console.log(`\nMethod 4 - Expected calculation (153 days):`);
console.log('- If 153 days is correct, the calculation should be:');
console.log('- Either: exclude start date (July 2 to Dec 1)');
console.log('- Or: exclude end date (July 1 to Nov 30)');

// Check what 153 days would mean for pay cycles
const daysToPayCycles153 = (153 / 365) * 12;
const daysToPayCycles154 = (154 / 365) * 12;

console.log(`\n📊 IMPACT ON PAY CYCLES:`);
console.log(`- With 153 days: ${daysToPayCycles153.toFixed(6)} → ${Math.ceil(daysToPayCycles153)} pay cycles`);
console.log(`- With 154 days: ${daysToPayCycles154.toFixed(6)} → ${Math.ceil(daysToPayCycles154)} pay cycles`);

// Test with both values
console.log(`\n💰 IMPACT ON CALCULATIONS:`);
const ytdAmount = 88000;

const avgPerCycle153 = ytdAmount / Math.ceil(daysToPayCycles153);
const avgPerCycle154 = ytdAmount / Math.ceil(daysToPayCycles154);

console.log(`- Average per cycle (153 days): $${avgPerCycle153.toFixed(2)}`);
console.log(`- Average per cycle (154 days): $${avgPerCycle154.toFixed(2)}`);

const commission153 = (avgPerCycle153 - 2000) * 12;
const commission154 = (avgPerCycle154 - 2000) * 12;

console.log(`- Commission annual (153 days): $${commission153.toFixed(2)}`);
console.log(`- Commission annual (154 days): $${commission154.toFixed(2)}`);

console.log('\n❓ QUESTION FOR USER:');
console.log('Which days calculation should be used?');
console.log('- 153 days (excluding start date)');
console.log('- 154 days (including both start and end dates)'); 