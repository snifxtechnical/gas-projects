/**
 * Model_Komponen.gs
 * Data access layer for Komponen Iuran
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Model_Komponen = {
  
  /**
   * Get sheet reference
   * @private
   */
  _getSheet() {
    return SS.getSheetByName(CONFIG.SHEET_NAMES.KOMPONEN_IURAN);
  },
  
  /**
   * Get all komponen
   * @return {Array<Object>} Array of komponen objects
   */
  getAll() {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        console.error('Model_Komponen.getAll: Sheet not found');
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const komponenList = [];
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.isEmpty(data[i][COLUMNS.KOMPONEN.ID])) {
          continue;
        }
        
        // Only include active komponen
        const status = StringUtils.clean(data[i][COLUMNS.KOMPONEN.STATUS]);
        if (StringUtils.equals(status, 'Aktif')) {
          komponenList.push(this._rowToObject(data[i], i + 1));
        }
      }
      
      console.log('Model_Komponen.getAll: Found ' + komponenList.length + ' active records');
      return komponenList;
      
    } catch (error) {
      console.error('Model_Komponen.getAll error:', error);
      return [];
    }
  },
  
  /**
   * Get komponen by ID
   * @param {string} komponenId - Komponen ID
   * @return {Object|null} Komponen object or null
   */
  getById(komponenId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return null;
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KOMPONEN.ID], komponenId)) {
          return this._rowToObject(data[i], i + 1);
        }
      }
      
      console.log('Model_Komponen.getById: Not found - ' + komponenId);
      return null;
      
    } catch (error) {
      console.error('Model_Komponen.getById error:', error);
      return null;
    }
  },
  
  /**
   * Create new komponen
   * @param {Object} komponenData - Komponen data
   * @return {Object} Result object
   */
  create(komponenData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const komponenId = this._generateId();
      
      const rowData = [
        komponenId,
        StringUtils.clean(komponenData.nama),
        StringUtils.clean(komponenData.satuan),
        'Aktif', // Default status
        NumberUtils.toNumber(komponenData.nominal)
      ];
      
      sheet.appendRow(rowData);
      
      console.log('Model_Komponen.create: Success - ' + komponenId);
      return {
        success: true,
        komponenId: komponenId,
        message: CONFIG.SUCCESS_MESSAGES.DATA_SAVED
      };
      
    } catch (error) {
      console.error('Model_Komponen.create error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Update existing komponen
   * @param {string} komponenId - Komponen ID
   * @param {Object} komponenData - Updated komponen data
   * @return {Object} Result object
   */
  update(komponenId, komponenData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KOMPONEN.ID], komponenId)) {
          rowIndex = i;
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, message: 'Komponen not found' };
      }
      
      const row = rowIndex + 1;
      
      if (komponenData.nama !== undefined) {
        sheet.getRange(row, COLUMNS.KOMPONEN.NAMA + 1).setValue(StringUtils.clean(komponenData.nama));
      }
      
      if (komponenData.satuan !== undefined) {
        sheet.getRange(row, COLUMNS.KOMPONEN.SATUAN + 1).setValue(StringUtils.clean(komponenData.satuan));
      }
      
      if (komponenData.status !== undefined) {
        sheet.getRange(row, COLUMNS.KOMPONEN.STATUS + 1).setValue(StringUtils.clean(komponenData.status));
      }
      
      if (komponenData.nominal !== undefined) {
        sheet.getRange(row, COLUMNS.KOMPONEN.NOMINAL + 1).setValue(NumberUtils.toNumber(komponenData.nominal));
      }
      
      console.log('Model_Komponen.update: Success - ' + komponenId);
      return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_UPDATED };
      
    } catch (error) {
      console.error('Model_Komponen.update error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Delete komponen (soft delete - set status to Tidak Aktif)
   * @param {string} komponenId - Komponen ID
   * @return {Object} Result object
   */
  delete(komponenId) {
    try {
      // Soft delete - set status to Tidak Aktif
      return this.update(komponenId, { status: 'Tidak Aktif' });
      
    } catch (error) {
      console.error('Model_Komponen.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Convert sheet row to komponen object
   * @private
   */
  _rowToObject(row, rowNumber) {
    return {
      komponenId: StringUtils.clean(row[COLUMNS.KOMPONEN.ID]),
      nama: StringUtils.clean(row[COLUMNS.KOMPONEN.NAMA]),
      satuan: StringUtils.clean(row[COLUMNS.KOMPONEN.SATUAN]),
      status: StringUtils.clean(row[COLUMNS.KOMPONEN.STATUS]),
      nominal: NumberUtils.toNumber(row[COLUMNS.KOMPONEN.NOMINAL]),
      _rowNumber: rowNumber
    };
  },
  
  /**
   * Generate new Komponen ID
   * @private
   */
  _generateId() {
    const sheet = this._getSheet();
    const data = sheet.getDataRange().getValues();
    let maxNum = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.KOMPONEN.ID]) {
        const id = String(data[i][COLUMNS.KOMPONEN.ID]);
        const num = parseInt(id.replace(CONFIG.ID_PREFIX.KOMPONEN, ''));
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    
    const newNum = maxNum + 1;
    const paddedNum = StringUtils.padZero(newNum, CONFIG.ID_LENGTH.KOMPONEN);
    return CONFIG.ID_PREFIX.KOMPONEN + paddedNum;
  }
};