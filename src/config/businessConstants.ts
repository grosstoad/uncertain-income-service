/**
 * Centralized business constants for uncertain income calculations
 * Consolidates hardcoded values scattered throughout the codebase
 */

export const BUSINESS_CONSTANTS = {
  /**
   * Minimum employment duration required for eligibility (in days)
   * Used across OVERTIME, CASUAL, CONTRACT_VARIABLE, COMMISSIONS
   */
  MINIMUM_EMPLOYMENT_DAYS: 180,

  /**
   * Days in year for pay cycle calculations
   * Note: Does not account for leap years - business decision
   */
  DAYS_IN_YEAR: 365,

  /**
   * Monthly pay cycle rounding threshold
   * If decimal portion > 0.25, round up; if ≤ 0.25, round down
   */
  MONTHLY_ROUNDING_THRESHOLD: 0.25,

  /**
   * Required months for Last FY Income validation
   * Different income types have different thresholds
   */
  LAST_FY_REQUIRED_MONTHS: {
    /**
     * Standard threshold for most income types
     * Used by: OVERTIME, CASUAL, CONTRACT_VARIABLE
     */
    STANDARD: 6,
    
    /**
     * Extended threshold for commission-based income
     * Used by: COMMISSIONS (requires 12-month rolling calculation)
     */
    COMMISSIONS: 12
  },

  /**
   * Salary frequency multipliers for annual calculations
   */
  FREQUENCY_MULTIPLIERS: {
    WEEKLY: 52,
    FORTNIGHTLY: 26,
    MONTHLY: 12
  }
} as const;

/**
 * Type-safe access to business constants
 * Prevents typos and provides IntelliSense support
 */
export type BusinessConstants = typeof BUSINESS_CONSTANTS;