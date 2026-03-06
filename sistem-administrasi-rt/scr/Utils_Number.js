/**
 * Utils_Number.gs
 * Number formatting and validation utilities
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const NumberUtils = {
  
  /**
   * Convert value to number safely
   * Returns 0 if conversion fails
   * 
   * @param {*} value - Value to convert
   * @return {number} Number value
   * 
   * Example:
   *   NumberUtils.toNumber("123") → 123
   *   NumberUtils.toNumber("abc") → 0
   *   NumberUtils.toNumber(null) → 0
   */
  toNumber(value) {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  },
  
  /**
   * Check if value is a valid number
   * 
   * @param {*} value - Value to check
   * @return {boolean} True if valid number
   */
  isNumber(value) {
    return !isNaN(this.toNumber(value));
  },
  
  /**
   * Format number as Indonesian Rupiah currency
   * 
   * @param {number} amount - Amount to format
   * @param {boolean} showPrefix - Show "Rp " prefix (default: true)
   * @return {string} Formatted currency
   * 
   * Example:
   *   NumberUtils.formatCurrency(10000) → "Rp 10.000"
   *   NumberUtils.formatCurrency(10000, false) → "10.000"
   */
  formatCurrency(amount, showPrefix = true) {
    const num = this.toNumber(amount);
    const formatted = num.toLocaleString(CONFIG.FORMAT.CURRENCY_LOCALE);
    return showPrefix ? CONFIG.FORMAT.CURRENCY_PREFIX + formatted : formatted;
  },
  
  /**
   * Parse currency string to number
   * Removes "Rp", spaces, and dots
   * 
   * @param {string} currencyString - Currency string to parse
   * @return {number} Numeric value
   * 
   * Example:
   *   NumberUtils.parseCurrency("Rp 10.000") → 10000
   *   NumberUtils.parseCurrency("10.000") → 10000
   */
  parseCurrency(currencyString) {
    if (!currencyString) {
      return 0;
    }
    
    // Remove Rp, spaces, and dots
    const cleaned = String(currencyString)
      .replace(/Rp/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '');
    
    return this.toNumber(cleaned);
  },
  
  /**
   * Format number with thousand separators
   * 
   * @param {number} num - Number to format
   * @return {string} Formatted number
   * 
   * Example:
   *   NumberUtils.formatNumber(1000000) → "1.000.000"
   */
  formatNumber(num) {
    return this.toNumber(num).toLocaleString(CONFIG.FORMAT.CURRENCY_LOCALE);
  },
  
  /**
   * Round number to specified decimal places
   * 
   * @param {number} num - Number to round
   * @param {number} decimals - Number of decimal places (default: 0)
   * @return {number} Rounded number
   * 
   * Example:
   *   NumberUtils.round(10.567, 2) → 10.57
   *   NumberUtils.round(10.567) → 11
   */
  round(num, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(this.toNumber(num) * factor) / factor;
  },
  
  /**
   * Calculate percentage
   * 
   * @param {number} value - Value
   * @param {number} total - Total
   * @param {number} decimals - Decimal places (default: 2)
   * @return {number} Percentage
   * 
   * Example:
   *   NumberUtils.percentage(25, 100) → 25.00
   *   NumberUtils.percentage(1, 3, 2) → 33.33
   */
  percentage(value, total, decimals = 2) {
    if (total === 0) {
      return 0;
    }
    const pct = (this.toNumber(value) / this.toNumber(total)) * 100;
    return this.round(pct, decimals);
  },
  
  /**
   * Sum array of numbers
   * 
   * @param {Array<number>} numbers - Array of numbers
   * @return {number} Sum
   * 
   * Example:
   *   NumberUtils.sum([1, 2, 3, 4]) → 10
   */
  sum(numbers) {
    if (!Array.isArray(numbers)) {
      return 0;
    }
    return numbers.reduce((acc, val) => acc + this.toNumber(val), 0);
  },
  
  /**
   * Calculate average of array of numbers
   * 
   * @param {Array<number>} numbers - Array of numbers
   * @return {number} Average
   */
  average(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }
    return this.sum(numbers) / numbers.length;
  },
  
  /**
   * Find minimum value in array
   * 
   * @param {Array<number>} numbers - Array of numbers
   * @return {number} Minimum value
   */
  min(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }
    return Math.min(...numbers.map(n => this.toNumber(n)));
  },
  
  /**
   * Find maximum value in array
   * 
   * @param {Array<number>} numbers - Array of numbers
   * @return {number} Maximum value
   */
  max(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }
    return Math.max(...numbers.map(n => this.toNumber(n)));
  },
  
  /**
   * Check if number is within range (inclusive)
   * 
   * @param {number} value - Value to check
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @return {boolean} True if in range
   */
  inRange(value, min, max) {
    const num = this.toNumber(value);
    return num >= min && num <= max;
  },
  
  /**
   * Clamp number to range
   * 
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @return {number} Clamped value
   * 
   * Example:
   *   NumberUtils.clamp(150, 0, 100) → 100
   *   NumberUtils.clamp(-10, 0, 100) → 0
   *   NumberUtils.clamp(50, 0, 100) → 50
   */
  clamp(value, min, max) {
    const num = this.toNumber(value);
    return Math.min(Math.max(num, min), max);
  },
  
  /**
   * Generate random integer between min and max (inclusive)
   * 
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @return {number} Random integer
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};