import { differenceInDays, parseISO, format, addMonths } from 'date-fns';

/**
 * Simplified date utilities using date-fns for reliable calculations
 * Replaces complex UTC timezone-dependent logic
 */

/**
 * Parse YYYY-MM-DD date string to Date object
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Calculate days between two dates (inclusive of start date)
 */
export function daysBetween(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate));
}

/**
 * Get the start date of the Australian financial year for a given date
 * Australian FY runs July 1 - June 30
 */
export function getCurrentFyStartDate(dateString: string): string {
  const date = parseISO(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is 0-based
  
  const fyYear = month < 7 ? year - 1 : year;
  return `${fyYear}-07-01`;
}

/**
 * Get both start and end dates of the financial year for a given date
 */
export function getCurrentFinancialYearBounds(dateString: string): { start: string; end: string } {
  const fyStart = getCurrentFyStartDate(dateString);
  const fyStartDate = parseISO(fyStart);
  const fyEndDate = new Date(fyStartDate.getFullYear() + 1, 5, 30); // June 30
  
  return {
    start: fyStart,
    end: format(fyEndDate, 'yyyy-MM-dd')
  };
}

/**
 * Calculate months since FY start
 */
export function monthsSinceFyStart(dateString: string): number {
  const fyStart = getCurrentFyStartDate(dateString);
  const fyStartDate = parseISO(fyStart);
  const date = parseISO(dateString);
  
  let months = (date.getFullYear() - fyStartDate.getFullYear()) * 12;
  months += date.getMonth() - fyStartDate.getMonth();
  
  return months;
}

/**
 * Check if a date is within the financial year of another date
 */
export function isWithinSameFY(date1: string, date2: string): boolean {
  const fyBounds1 = getCurrentFinancialYearBounds(date1);
  const fyBounds2 = getCurrentFinancialYearBounds(date2);
  return fyBounds1.start === fyBounds2.start;
}

/**
 * Add months to a date and return as YYYY-MM-DD string
 */
export function addMonthsToDate(dateString: string, months: number): string {
  const date = parseISO(dateString);
  const newDate = addMonths(date, months);
  return format(newDate, 'yyyy-MM-dd');
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd') === dateString;
  } catch {
    return false;
  }
} 