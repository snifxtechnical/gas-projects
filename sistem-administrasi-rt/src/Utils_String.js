/**
 * Utils_String.gs
 * String manipulation and validation utilities
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const StringUtils = {
  
  /**
   * Clean and trim string value
   * Handles null, undefined, and whitespace
   * 
   * @param {*} value - Value to clean
   * @return {string} Cleaned string
   * 
   * Example:
   *   StringUtils.clean("  hello  ") → "hello"
   *   StringUtils.clean(null) → ""
   *   StringUtils.clean(123) → "123"
   */
  clean(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value).trim();
  },
  
  /**
   * Check if string is empty or only whitespace
   * 
   * @param {*} value - Value to check
   * @return {boolean} True if empty
   * 
   * Example:
   *   StringUtils.isEmpty("") → true
   *   StringUtils.isEmpty("  ") → true
   *   StringUtils.isEmpty("hello") → false
   */
  isEmpty(value) {
    return this.clean(value) === "";
  },
  
  /**
   * Check if string is not empty
   * 
   * @param {*} value - Value to check
   * @return {boolean} True if not empty
   */
  isNotEmpty(value) {
    return !this.isEmpty(value);
  },
  
  /**
   * Compare two strings (case-insensitive, trimmed)
   * 
   * @param {*} str1 - First string
   * @param {*} str2 - Second string
   * @return {boolean} True if equal
   * 
   * Example:
   *   StringUtils.equals("Hello", "hello") → true
   *   StringUtils.equals("Hello ", " hello") → true
   */
  equals(str1, str2) {
    return this.clean(str1).toLowerCase() === this.clean(str2).toLowerCase();
  },
  
  /**
   * Compare two strings (case-sensitive, trimmed)
   * 
   * @param {*} str1 - First string
   * @param {*} str2 - Second string
   * @return {boolean} True if equal
   */
  equalsExact(str1, str2) {
    return this.clean(str1) === this.clean(str2);
  },
  
  /**
   * Check if string contains substring (case-insensitive)
   * 
   * @param {string} str - String to search in
   * @param {string} search - Substring to find
   * @return {boolean} True if contains
   * 
   * Example:
   *   StringUtils.contains("Hello World", "world") → true
   */
  contains(str, search) {
    if (this.isEmpty(str) || this.isEmpty(search)) {
      return false;
    }
    return this.clean(str).toLowerCase().includes(this.clean(search).toLowerCase());
  },
  
  /**
   * Capitalize first letter of each word
   * 
   * @param {string} str - String to capitalize
   * @return {string} Capitalized string
   * 
   * Example:
   *   StringUtils.capitalize("hello world") → "Hello World"
   */
  capitalize(str) {
    if (this.isEmpty(str)) {
      return "";
    }
    
    return this.clean(str)
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
  
  /**
   * Convert to uppercase and trim
   * 
   * @param {string} str - String to convert
   * @return {string} Uppercase string
   */
  upper(str) {
    return this.clean(str).toUpperCase();
  },
  
  /**
   * Convert to lowercase and trim
   * 
   * @param {string} str - String to convert
   * @return {string} Lowercase string
   */
  lower(str) {
    return this.clean(str).toLowerCase();
  },
  
  /**
   * Truncate string to max length with ellipsis
   * 
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @return {string} Truncated string
   * 
   * Example:
   *   StringUtils.truncate("Hello World", 8) → "Hello..."
   */
  truncate(str, maxLength) {
    const cleaned = this.clean(str);
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    return cleaned.substring(0, maxLength - 3) + "...";
  },
  
  /**
   * Pad string with leading zeros
   * 
   * @param {string|number} value - Value to pad
   * @param {number} length - Target length
   * @return {string} Padded string
   * 
   * Example:
   *   StringUtils.padZero(5, 3) → "005"
   *   StringUtils.padZero("5", 5) → "00005"
   */
  padZero(value, length) {
    return String(value).padStart(length, '0');
  },
  
  /**
   * Remove all non-numeric characters
   * 
   * @param {string} str - String to clean
   * @return {string} Numeric string only
   * 
   * Example:
   *   StringUtils.numbersOnly("Rp 10.000") → "10000"
   *   StringUtils.numbersOnly("ID-123-ABC") → "123"
   */
  numbersOnly(str) {
    if (this.isEmpty(str)) {
      return "";
    }
    return String(str).replace(/\D/g, '');
  },
  
  /**
   * Remove all non-alphanumeric characters
   * 
   * @param {string} str - String to clean
   * @return {string} Alphanumeric string only
   */
  alphanumericOnly(str) {
    if (this.isEmpty(str)) {
      return "";
    }
    return String(str).replace(/[^a-zA-Z0-9]/g, '');
  },
  
  /**
   * Generate random alphanumeric string
   * 
   * @param {number} length - Length of string
   * @return {string} Random string
   */
  randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * Validate NIK format (16 digits)
   * 
   * @param {string} nik - NIK to validate
   * @return {boolean} True if valid
   */
  isValidNIK(nik) {
    const cleaned = this.numbersOnly(nik);
    return cleaned.length === CONFIG.VALIDATION.NIK_LENGTH;
  },
  
  /**
   * Validate No KK format (16 digits)
   * 
   * @param {string} noKK - No KK to validate
   * @return {boolean} True if valid
   */
  isValidNoKK(noKK) {
    const cleaned = this.numbersOnly(noKK);
    return cleaned.length === CONFIG.VALIDATION.NO_KK_LENGTH;
  },
  
  /**
   * Format NIK with spacing (1234-5678-9012-3456)
   * 
   * @param {string} nik - NIK to format
   * @return {string} Formatted NIK
   */
  formatNIK(nik) {
    const cleaned = this.numbersOnly(nik);
    if (cleaned.length !== 16) {
      return cleaned;
    }
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
  },
  
  /**
   * Format No KK with spacing
   * 
   * @param {string} noKK - No KK to format
   * @return {string} Formatted No KK
   */
  formatNoKK(noKK) {
    return this.formatNIK(noKK); // Same format as NIK
  },
  
  /**
   * Slugify string (convert to URL-friendly format)
   * 
   * @param {string} str - String to slugify
   * @return {string} Slugified string
   * 
   * Example:
   *   StringUtils.slugify("Hello World!") → "hello-world"
   */
  slugify(str) {
    return this.clean(str)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};