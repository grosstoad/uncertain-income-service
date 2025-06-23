const { getCurrentFinancialYearBounds } = require('./src/v1/calculations/financialYearUtils');

console.log('🐛 DEBUG: July 2024 Date Comparison Issue');

const endDateLatestPayslip = '2025-03-15';
const fyBounds = getCurrentFinancialYearBounds(endDateLatestPayslip);

console.log(`FY Bounds: ${fyBounds.start} to ${fyBounds.end}`);

// July 2024 test
const julyDate = new Date(2024, 6, 1); // July 1, 2024
const fyStartDate = new Date(fyBounds.start);
const fyEndDate = new Date(fyBounds.end);

console.log(`July Date: ${julyDate.toISOString()}`);
console.log(`FY Start: ${fyStartDate.toISOString()}`);
console.log(`FY End: ${fyEndDate.toISOString()}`);

const isAfterStart = julyDate >= fyStartDate;  
const isBeforeEnd = julyDate <= fyEndDate;
const isCurrent = isAfterStart && isBeforeEnd;

console.log(`July >= FY Start: ${isAfterStart}`);
console.log(`July <= FY End: ${isBeforeEnd}`);
console.log(`Is Current FY: ${isCurrent}`);
console.log(`Should be: TRUE`);

// Check milliseconds
console.log(`July ms: ${julyDate.getTime()}`);
console.log(`FY Start ms: ${fyStartDate.getTime()}`);
console.log(`Difference: ${julyDate.getTime() - fyStartDate.getTime()}`); 