/**
 * Service_Auth.gs
 * Authentication and authorization logic
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Service_Auth = {
  
  /**
   * Authenticate user with username and password
   * @param {string} username - Username
   * @param {string} password - Password (plain text)
   * @return {Object} Authentication result
   */
  authenticate(username, password) {
    try {
      // Validate input
      if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
        return {
          success: false,
          message: 'Username dan password wajib diisi'
        };
      }
      
      // Get Pengurus sheet
      const sheet = SS.getSheetByName(CONFIG.SHEET_NAMES.PENGURUS);
      if (!sheet) {
        console.error('Service_Auth.authenticate: Pengurus sheet not found');
        return {
          success: false,
          message: CONFIG.ERROR_MESSAGES.SHEET_NOT_FOUND
        };
      }
      
      // Get all pengurus data
      const data = sheet.getDataRange().getValues();
      
      // Search for matching username
      for (let i = 1; i < data.length; i++) {
        const rowUsername = StringUtils.clean(data[i][COLUMNS.PENGURUS.USERNAME]);
        const rowPassword = StringUtils.clean(data[i][COLUMNS.PENGURUS.PASSWORD]);
        const rowNama = StringUtils.clean(data[i][COLUMNS.PENGURUS.NAMA]);
        const rowJabatan = StringUtils.clean(data[i][COLUMNS.PENGURUS.JABATAN]);
        const rowRole = StringUtils.clean(data[i][COLUMNS.PENGURUS.ROLE]);
        const rowStatus = StringUtils.clean(data[i][COLUMNS.PENGURUS.STATUS]);
        
        // Check if username matches
        if (StringUtils.equals(rowUsername, username)) {
          
          // Check if user is active
          if (!StringUtils.equals(rowStatus, 'Aktif')) {
            return {
              success: false,
              message: 'Akun tidak aktif. Hubungi administrator.'
            };
          }
          
          // Check password (plain text comparison)
          // NOTE: In production, use proper password hashing!
          if (StringUtils.equals(rowPassword, password)) {
            
            // Authentication successful
            console.log('Service_Auth.authenticate: Success - ' + username);
            
            return {
              success: true,
              message: CONFIG.SUCCESS_MESSAGES.LOGIN_SUCCESS,
              user: {
                username: rowUsername,
                nama: rowNama,
                jabatan: rowJabatan,
                role: rowRole || CONFIG.AUTH.DEFAULT_ROLE
              }
            };
          } else {
            // Wrong password
            return {
              success: false,
              message: CONFIG.ERROR_MESSAGES.AUTHENTICATION_FAILED
            };
          }
        }
      }
      
      // Username not found
      return {
        success: false,
        message: CONFIG.ERROR_MESSAGES.AUTHENTICATION_FAILED
      };
      
    } catch (error) {
      console.error('Service_Auth.authenticate error:', error);
      return {
        success: false,
        message: CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR
      };
    }
  },
  
  /**
   * Get current user info from session
   * NOTE: This is a placeholder for future session management
   * @return {Object|null} User object or null
   */
  getCurrentUser() {
    // In simple password-based auth, we don't maintain server-side sessions
    // Session is managed client-side in browser sessionStorage
    // This function is for future enhancement with proper session management
    
    return {
      message: 'Session management handled client-side'
    };
  },
  
  /**
   * Check if user has specific role
   * @param {Object} user - User object
   * @param {string} requiredRole - Required role
   * @return {boolean} True if user has role
   */
  hasRole(user, requiredRole) {
    if (!user || !user.role) {
      return false;
    }
    
    return StringUtils.equals(user.role, requiredRole);
  },
  
  /**
   * Check if user is admin
   * @param {Object} user - User object
   * @return {boolean} True if user is admin
   */
  isAdmin(user) {
    return this.hasRole(user, CONFIG.AUTH.ADMIN_ROLE);
  }
};