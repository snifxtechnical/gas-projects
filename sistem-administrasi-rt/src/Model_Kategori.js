/**
 * Model_Kategori.gs
 * Data access layer for Kategori dropdown values
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Model_Kategori = {
  
  /**
   * Get sheet reference
   * @private
   */
  _getSheet() {
    return SS.getSheetByName(CONFIG.SHEET_NAMES.KATEGORI);
  },
  
  /**
   * Get kategori values by type
   * @param {string} tipe - Kategori type (e.g., "Pendidikan", "Status_Perkawinan")
   * @return {Array<string>} Array of kategori values
   */
  getByType(tipe) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        console.log('Model_Kategori.getByType: Sheet not found, using defaults');
        return this._getDefaultValues(tipe);
      }
      
      const data = sheet.getDataRange().getValues();
      const values = [];
      
      for (let i = 1; i < data.length; i++) {
        const rowTipe = StringUtils.clean(data[i][COLUMNS.KATEGORI.TIPE]);
        const nilai = StringUtils.clean(data[i][COLUMNS.KATEGORI.NILAI]);
        const status = StringUtils.clean(data[i][COLUMNS.KATEGORI.STATUS]);
        
        if (StringUtils.equals(rowTipe, tipe) && 
            StringUtils.equals(status, 'Aktif') &&
            StringUtils.isNotEmpty(nilai)) {
          values.push(nilai);
        }
      }
      
      // If no values found in sheet, use defaults
      if (values.length === 0) {
        console.log('Model_Kategori.getByType: No values in sheet, using defaults for ' + tipe);
        return this._getDefaultValues(tipe);
      }
      
      console.log('Model_Kategori.getByType: Found ' + values.length + ' values for ' + tipe);
      return values;
      
    } catch (error) {
      console.error('Model_Kategori.getByType error:', error);
      return this._getDefaultValues(tipe);
    }
  },
  
  /**
   * Get all kategori grouped by type
   * @return {Object} Object with kategori types as keys
   */
  getAllGrouped() {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return this._getAllDefaults();
      }
      
      const data = sheet.getDataRange().getValues();
      const grouped = {};
      
      for (let i = 1; i < data.length; i++) {
        const tipe = StringUtils.clean(data[i][COLUMNS.KATEGORI.TIPE]);
        const nilai = StringUtils.clean(data[i][COLUMNS.KATEGORI.NILAI]);
        const status = StringUtils.clean(data[i][COLUMNS.KATEGORI.STATUS]);
        
        if (StringUtils.equals(status, 'Aktif') && StringUtils.isNotEmpty(tipe) && StringUtils.isNotEmpty(nilai)) {
          if (!grouped[tipe]) {
            grouped[tipe] = [];
          }
          grouped[tipe].push(nilai);
        }
      }
      
      console.log('Model_Kategori.getAllGrouped: Found ' + Object.keys(grouped).length + ' types');
      return grouped;
      
    } catch (error) {
      console.error('Model_Kategori.getAllGrouped error:', error);
      return this._getAllDefaults();
    }
  },
  
  /**
   * Add new kategori value
   * @param {string} tipe - Kategori type
   * @param {string} nilai - Kategori value
   * @return {Object} Result object
   */
  add(tipe, nilai) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      // Check if already exists
      const existing = this.getByType(tipe);
      if (existing.includes(nilai)) {
        return { success: false, message: 'Nilai sudah ada' };
      }
      
      const rowData = [
        StringUtils.clean(tipe),
        StringUtils.clean(nilai),
        'Aktif'
      ];
      
      sheet.appendRow(rowData);
      
      console.log('Model_Kategori.add: Success - ' + tipe + ': ' + nilai);
      return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_SAVED };
      
    } catch (error) {
      console.error('Model_Kategori.add error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Update kategori value
   * @param {string} tipe - Kategori type
   * @param {string} oldNilai - Old value
   * @param {string} newNilai - New value
   * @return {Object} Result object
   */
  update(tipe, oldNilai, newNilai) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KATEGORI.TIPE], tipe) &&
            StringUtils.equals(data[i][COLUMNS.KATEGORI.NILAI], oldNilai)) {
          sheet.getRange(i + 1, COLUMNS.KATEGORI.NILAI + 1).setValue(StringUtils.clean(newNilai));
          console.log('Model_Kategori.update: Success');
          return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_UPDATED };
        }
      }
      
      return { success: false, message: 'Kategori not found' };
      
    } catch (error) {
      console.error('Model_Kategori.update error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Delete kategori value (soft delete)
   * @param {string} tipe - Kategori type
   * @param {string} nilai - Value to delete
   * @return {Object} Result object
   */
  delete(tipe, nilai) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KATEGORI.TIPE], tipe) &&
            StringUtils.equals(data[i][COLUMNS.KATEGORI.NILAI], nilai)) {
          sheet.getRange(i + 1, COLUMNS.KATEGORI.STATUS + 1).setValue('Tidak Aktif');
          console.log('Model_Kategori.delete: Success (soft delete)');
          return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_DELETED };
        }
      }
      
      return { success: false, message: 'Kategori not found' };
      
    } catch (error) {
      console.error('Model_Kategori.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Get default values from CONFIG
   * @private
   */
  _getDefaultValues(tipe) {
    return CONFIG.DROPDOWN_OPTIONS[tipe] || [];
  },
  
  /**
   * Get all default values
   * @private
   */
  _getAllDefaults() {
    return CONFIG.DROPDOWN_OPTIONS;
  }
};