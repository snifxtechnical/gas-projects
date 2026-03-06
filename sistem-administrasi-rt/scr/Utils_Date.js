/**
 * Utils_Date.gs
 * Date formatting and manipulation utilities
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const DateUtils = {
  
  /**
   * Convert value to Date object safely
   * Returns null if conversion fails
   * 
   * @param {*} value - Value to convert
   * @return {Date|null} Date object or null
   */
  toDate(value) {
    if (!value) {
      return null;
    }
    
    // If already a Date object
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    
    // Try to parse
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },
  
  /**
   * Check if value is a valid date
   * 
   * @param {*} value - Value to check
   * @return {boolean} True if valid date
   */
  isValidDate(value) {
    return this.toDate(value) !== null;
  },
  
  /**
   * Format date to Indonesian format (dd/MM/yyyy)
   * 
   * @param {Date|string} date - Date to format
   * @return {string} Formatted date or empty string
   * 
   * Example:
   *   DateUtils.formatDate(new Date('2026-01-31')) → "31/01/2026"
   */
  formatDate(date) {
    const d = this.toDate(date);
    if (!d) {
      return "";
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  },
  
  /**
   * Format date to ISO format (YYYY-MM-DD)
   * 
   * @param {Date|string} date - Date to format
   * @return {string} ISO formatted date or empty string
   * 
   * Example:
   *   DateUtils.formatISO(new Date('2026-01-31')) → "2026-01-31"
   */
  formatISO(date) {
    const d = this.toDate(date);
    if (!d) {
      return "";
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },
  
  /**
   * Format datetime to Indonesian format (dd/MM/yyyy HH:mm:ss)
   * 
   * @param {Date|string} date - Date to format
   * @return {string} Formatted datetime or empty string
   */
  formatDateTime(date) {
    const d = this.toDate(date);
    if (!d) {
      return "";
    }
    
    const dateStr = this.formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  },
  
  /**
   * Parse Indonesian date format (dd/MM/yyyy) to Date object
   * 
   * @param {string} dateStr - Date string to parse
   * @return {Date|null} Date object or null
   * 
   * Example:
   *   DateUtils.parseDate("31/01/2026") → Date object
   */
  parseDate(dateStr) {
    if (!dateStr) {
      return null;
    }
    
    const parts = String(dateStr).split('/');
    if (parts.length !== 3) {
      return null;
    }
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-based
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }
    
    return new Date(year, month, day);
  },
  
  /**
   * Get current date
   * 
   * @return {Date} Current date
   */
  now() {
    return new Date();
  },
  
  /**
   * Get today's date at midnight
   * 
   * @return {Date} Today at 00:00:00
   */
  today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },
  
  /**
   * Add days to date
   * 
   * @param {Date|string} date - Base date
   * @param {number} days - Number of days to add (can be negative)
   * @return {Date|null} New date or null
   * 
   * Example:
   *   DateUtils.addDays(new Date('2026-01-31'), 7) → Date('2026-02-07')
   */
  addDays(date, days) {
    const d = this.toDate(date);
    if (!d) {
      return null;
    }
    
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  /**
   * Add months to date
   * 
   * @param {Date|string} date - Base date
   * @param {number} months - Number of months to add
   * @return {Date|null} New date or null
   */
  addMonths(date, months) {
    const d = this.toDate(date);
    if (!d) {
      return null;
    }
    
    const result = new Date(d);
    result.setMonth(result.getMonth() + months);
    return result;
  },
  
  /**
   * Add years to date
   * 
   * @param {Date|string} date - Base date
   * @param {number} years - Number of years to add
   * @return {Date|null} New date or null
   */
  addYears(date, years) {
    const d = this.toDate(date);
    if (!d) {
      return null;
    }
    
    const result = new Date(d);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },
  
  /**
   * Calculate difference in days between two dates
   * 
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @return {number} Number of days (can be negative)
   */
  diffDays(date1, date2) {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);
    
    if (!d1 || !d2) {
      return 0;
    }
    
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  },
  
  /**
   * Check if date is in the past
   * 
   * @param {Date|string} date - Date to check
   * @return {boolean} True if in the past
   */
  isPast(date) {
    const d = this.toDate(date);
    if (!d) {
      return false;
    }
    return d < this.now();
  },
  
  /**
   * Check if date is in the future
   * 
   * @param {Date|string} date - Date to check
   * @return {boolean} True if in the future
   */
  isFuture(date) {
    const d = this.toDate(date);
    if (!d) {
      return false;
    }
    return d > this.now();
  },
  
  /**
   * Check if date is today
   * 
   * @param {Date|string} date - Date to check
   * @return {boolean} True if today
   */
  isToday(date) {
    const d = this.toDate(date);
    if (!d) {
      return false;
    }
    
    const today = this.today();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  },
  
  /**
   * Get age in years from birthdate
   * 
   * @param {Date|string} birthDate - Birth date
   * @return {number} Age in years
   */
  getAge(birthDate) {
    const birth = this.toDate(birthDate);
    if (!birth) {
      return 0;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },
  
  /**
   * Get month name in Indonesian
   * 
   * @param {number} month - Month number (1-12)
   * @return {string} Month name
   */
  getMonthName(month) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return months[month - 1] || '';
  },
  
  /**
   * Get day name in Indonesian
   * 
   * @param {Date|string} date - Date
   * @return {string} Day name
   */
  getDayName(date) {
    const d = this.toDate(date);
    if (!d) {
      return '';
    }
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[d.getDay()];
  }
};