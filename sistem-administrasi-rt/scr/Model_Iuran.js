/**
 * Model_Iuran.gs
 * Data access layer for Iuran Rumah
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Model_Iuran = {
  
  /**
   * Get sheet reference
   * @private
   */
  _getSheet() {
    return SS.getSheetByName(CONFIG.SHEET_NAMES.IURAN_RUMAH);
  },
  
  /**
   * Get all iuran for a rumah
   * @param {string} rumahId - Rumah ID
   * @return {Array<Object>} Array of iuran objects
   */
  getByRumahId(rumahId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        console.error('Model_Iuran.getByRumahId: Sheet not found');
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const iuranList = [];
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.IURAN.RUMAH_ID], rumahId)) {
          iuranList.push(this._rowToObject(data[i], i + 1));
        }
      }
      
      console.log('Model_Iuran.getByRumahId: Found ' + iuranList.length + ' records for ' + rumahId);
      return iuranList;
      
    } catch (error) {
      console.error('Model_Iuran.getByRumahId error:', error);
      return [];
    }
  },
  
  /**
   * Create iuran record
   * @param {Object} iuranData - Iuran data
   * @return {Object} Result object
   */
  create(iuranData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const rowData = [
        StringUtils.clean(iuranData.rumahId),
        StringUtils.clean(iuranData.komponenId),
        NumberUtils.toNumber(iuranData.nominalDefault),
        iuranData.nominalOverride !== null && iuranData.nominalOverride !== undefined ? 
          NumberUtils.toNumber(iuranData.nominalOverride) : '',
        NumberUtils.toNumber(iuranData.qty),
        NumberUtils.toNumber(iuranData.total),
        '', // tahun_bulan (future use)
        DateUtils.formatDateTime(new Date()),
        '' // user_update (future use)
      ];
      
      sheet.appendRow(rowData);
      
      console.log('Model_Iuran.create: Success');
      return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_SAVED };
      
    } catch (error) {
      console.error('Model_Iuran.create error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Update iuran record
   * @param {string} rumahId - Rumah ID
   * @param {string} komponenId - Komponen ID
   * @param {Object} updateData - Data to update
   * @return {Object} Result object
   */
  update(rumahId, komponenId, updateData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      // Find row
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.IURAN.RUMAH_ID], rumahId) &&
            StringUtils.equals(data[i][COLUMNS.IURAN.KOMPONEN_ID], komponenId)) {
          rowIndex = i;
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, message: 'Iuran record not found' };
      }
      
      const row = rowIndex + 1;
      
      // Update fields
      if (updateData.nominalOverride !== undefined) {
        const value = updateData.nominalOverride !== null && updateData.nominalOverride !== '' ?
          NumberUtils.toNumber(updateData.nominalOverride) : '';
        sheet.getRange(row, COLUMNS.IURAN.NOMINAL_OVERRIDE + 1).setValue(value);
      }
      
      if (updateData.qty !== undefined) {
        sheet.getRange(row, COLUMNS.IURAN.QTY + 1).setValue(NumberUtils.toNumber(updateData.qty));
      }
      
      if (updateData.total !== undefined) {
        sheet.getRange(row, COLUMNS.IURAN.TOTAL + 1).setValue(NumberUtils.toNumber(updateData.total));
      }
      
      // Update timestamp
      sheet.getRange(row, COLUMNS.IURAN.TANGGAL_UPDATE + 1).setValue(DateUtils.formatDateTime(new Date()));
      
      console.log('Model_Iuran.update: Success');
      return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_UPDATED };
      
    } catch (error) {
      console.error('Model_Iuran.update error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Delete iuran record
   * @param {string} rumahId - Rumah ID
   * @param {string} komponenId - Komponen ID
   * @return {Object} Result object
   */
  delete(rumahId, komponenId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.IURAN.RUMAH_ID], rumahId) &&
            StringUtils.equals(data[i][COLUMNS.IURAN.KOMPONEN_ID], komponenId)) {
          sheet.deleteRow(i + 1);
          console.log('Model_Iuran.delete: Success');
          return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_DELETED };
        }
      }
      
      return { success: false, message: 'Iuran record not found' };
      
    } catch (error) {
      console.error('Model_Iuran.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Delete all iuran for a rumah
   * @param {string} rumahId - Rumah ID
   * @return {Object} Result object
   */
  deleteByRumahId(rumahId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      let deletedCount = 0;
      
      // Delete from bottom to top to avoid index shifting
      for (let i = data.length - 1; i >= 1; i--) {
        if (StringUtils.equals(data[i][COLUMNS.IURAN.RUMAH_ID], rumahId)) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      
      console.log('Model_Iuran.deleteByRumahId: Deleted ' + deletedCount + ' records');
      return { success: true, deletedCount: deletedCount };
      
    } catch (error) {
      console.error('Model_Iuran.deleteByRumahId error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Convert sheet row to iuran object
   * @private
   */
  _rowToObject(row, rowNumber) {
    return {
      rumahId: StringUtils.clean(row[COLUMNS.IURAN.RUMAH_ID]),
      komponenId: StringUtils.clean(row[COLUMNS.IURAN.KOMPONEN_ID]),
      nominalDefault: NumberUtils.toNumber(row[COLUMNS.IURAN.NOMINAL_DEFAULT]),
      nominalOverride: row[COLUMNS.IURAN.NOMINAL_OVERRIDE] !== '' && 
                       row[COLUMNS.IURAN.NOMINAL_OVERRIDE] !== null && 
                       row[COLUMNS.IURAN.NOMINAL_OVERRIDE] !== undefined ?
                       NumberUtils.toNumber(row[COLUMNS.IURAN.NOMINAL_OVERRIDE]) : null,
      qty: NumberUtils.toNumber(row[COLUMNS.IURAN.QTY]),
      total: NumberUtils.toNumber(row[COLUMNS.IURAN.TOTAL]),
      _rowNumber: rowNumber
    };
  }
};