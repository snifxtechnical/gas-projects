/**
 * Model_Rumah.gs
 * Data access layer for Rumah (Houses)
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Model_Rumah = {
  
  /**
   * Get sheet reference
   * @private
   */
  _getSheet() {
    return SS.getSheetByName(CONFIG.SHEET_NAMES.DATA_RUMAH);
  },
  
  /**
   * Get all rumah data
   * @return {Array<Object>} Array of rumah objects
   */
  getAll() {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        console.error('Model_Rumah.getAll: Sheet not found');
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const rumahList = [];
      
      // Skip header row (index 0)
      for (let i = 1; i < data.length; i++) {
        // Skip empty rows
        if (StringUtils.isEmpty(data[i][COLUMNS.RUMAH.ID])) {
          continue;
        }
        
        rumahList.push(this._rowToObject(data[i], i + 1));
      }
      
      console.log('Model_Rumah.getAll: Found ' + rumahList.length + ' records');
      return rumahList;
      
    } catch (error) {
      console.error('Model_Rumah.getAll error:', error);
      return [];
    }
  },
  
  /**
   * Get rumah by ID
   * @param {string} rumahId - Rumah ID
   * @return {Object|null} Rumah object or null
   */
  getById(rumahId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return null;
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.RUMAH.ID], rumahId)) {
          return this._rowToObject(data[i], i + 1);
        }
      }
      
      console.log('Model_Rumah.getById: Not found - ' + rumahId);
      return null;
      
    } catch (error) {
      console.error('Model_Rumah.getById error:', error);
      return null;
    }
  },
  
  /**
   * Create new rumah
   * @param {Object} rumahData - Rumah data
   * @return {Object} Result object with success status and rumahId
   */
  create(rumahData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      // Generate new ID
      const rumahId = this._generateId();
      
      // Prepare row data
      const rowData = [
        rumahId,
        StringUtils.clean(rumahData.namaJalan),
        NumberUtils.toNumber(rumahData.nomorRumah),
        NumberUtils.toNumber(rumahData.jumlahJiwa) || 0,
        NumberUtils.toNumber(rumahData.mobil) || 0,
        NumberUtils.toNumber(rumahData.motor) || 0,
        StringUtils.clean(rumahData.status) || CONFIG.DEFAULTS.RUMAH_STATUS,
        StringUtils.clean(rumahData.keterangan),
        0, // totalIuranPerbulan
        0  // tunggakanIuran
      ];
      
      // Append row
      sheet.appendRow(rowData);
      
      console.log('Model_Rumah.create: Success - ' + rumahId);
      return {
        success: true,
        rumahId: rumahId,
        message: CONFIG.SUCCESS_MESSAGES.DATA_SAVED
      };
      
    } catch (error) {
      console.error('Model_Rumah.create error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Update existing rumah
   * @param {string} rumahId - Rumah ID
   * @param {Object} rumahData - Updated rumah data
   * @return {Object} Result object
   */
  update(rumahId, rumahData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      // Find row
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.RUMAH.ID], rumahId)) {
          rowIndex = i;
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, message: 'Rumah not found' };
      }
      
      // Update fields
      const row = rowIndex + 1;
      
      if (rumahData.namaJalan !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.NAMA_JALAN + 1).setValue(StringUtils.clean(rumahData.namaJalan));
      }
      
      if (rumahData.nomorRumah !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.NOMOR + 1).setValue(NumberUtils.toNumber(rumahData.nomorRumah));
      }
      
      if (rumahData.jumlahJiwa !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.JUMLAH_JIWA + 1).setValue(NumberUtils.toNumber(rumahData.jumlahJiwa));
      }
      
      if (rumahData.mobil !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.MOBIL + 1).setValue(NumberUtils.toNumber(rumahData.mobil));
      }
      
      if (rumahData.motor !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.MOTOR + 1).setValue(NumberUtils.toNumber(rumahData.motor));
      }
      
      if (rumahData.status !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.STATUS + 1).setValue(StringUtils.clean(rumahData.status));
      }
      
      if (rumahData.keterangan !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.KETERANGAN + 1).setValue(StringUtils.clean(rumahData.keterangan));
      }
      
      if (rumahData.tunggakanIuran !== undefined) {
        sheet.getRange(row, COLUMNS.RUMAH.TUNGGAKAN + 1).setValue(NumberUtils.toNumber(rumahData.tunggakanIuran));
      }
      
      console.log('Model_Rumah.update: Success - ' + rumahId);
      return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_UPDATED };
      
    } catch (error) {
      console.error('Model_Rumah.update error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Update total iuran for rumah
   * @param {string} rumahId - Rumah ID
   * @param {number} totalIuran - Total iuran amount
   * @return {boolean} Success status
   */
  updateTotalIuran(rumahId, totalIuran) {
    try {
      const sheet = this._getSheet();
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.RUMAH.ID], rumahId)) {
          const row = i + 1;
          sheet.getRange(row, COLUMNS.RUMAH.TOTAL_IURAN + 1).setValue(NumberUtils.toNumber(totalIuran));
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Model_Rumah.updateTotalIuran error:', error);
      return false;
    }
  },
  
  /**
   * Delete rumah
   * @param {string} rumahId - Rumah ID
   * @return {Object} Result object
   */
  delete(rumahId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.RUMAH.ID], rumahId)) {
          sheet.deleteRow(i + 1);
          console.log('Model_Rumah.delete: Success - ' + rumahId);
          return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_DELETED };
        }
      }
      
      return { success: false, message: 'Rumah not found' };
      
    } catch (error) {
      console.error('Model_Rumah.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Get unique list of jalan (streets)
   * @return {Array<string>} Array of jalan names
   */
  getJalanList() {
    try {
      const allRumah = this.getAll();
      const jalanSet = new Set();
      
      allRumah.forEach(rumah => {
        if (StringUtils.isNotEmpty(rumah.namaJalan)) {
          jalanSet.add(rumah.namaJalan);
        }
      });
      
      return Array.from(jalanSet).sort();
      
    } catch (error) {
      console.error('Model_Rumah.getJalanList error:', error);
      return [];
    }
  },
  
  /**
   * Get list of nomor rumah for specific jalan
   * @param {string} jalan - Jalan name
   * @return {Array<number>} Array of rumah numbers
   */
  getNomorRumahListByJalan(jalan) {
    try {
      const allRumah = this.getAll();
      const nomorList = [];
      
      allRumah.forEach(rumah => {
        if (StringUtils.equals(rumah.namaJalan, jalan)) {
          nomorList.push(rumah.nomorRumah);
        }
      });
      
      return nomorList.sort((a, b) => a - b);
      
    } catch (error) {
      console.error('Model_Rumah.getNomorRumahListByJalan error:', error);
      return [];
    }
  },
  
  /**
   * Convert sheet row to rumah object
   * @private
   */
  _rowToObject(row, rowNumber) {
    return {
      rumahId: StringUtils.clean(row[COLUMNS.RUMAH.ID]),
      namaJalan: StringUtils.clean(row[COLUMNS.RUMAH.NAMA_JALAN]),
      nomorRumah: NumberUtils.toNumber(row[COLUMNS.RUMAH.NOMOR]),
      jumlahJiwa: NumberUtils.toNumber(row[COLUMNS.RUMAH.JUMLAH_JIWA]),
      mobil: NumberUtils.toNumber(row[COLUMNS.RUMAH.MOBIL]),
      motor: NumberUtils.toNumber(row[COLUMNS.RUMAH.MOTOR]),
      status: StringUtils.clean(row[COLUMNS.RUMAH.STATUS]),
      keterangan: StringUtils.clean(row[COLUMNS.RUMAH.KETERANGAN]),
      totalIuranPerbulan: NumberUtils.toNumber(row[COLUMNS.RUMAH.TOTAL_IURAN]),
      tunggakanIuran: NumberUtils.toNumber(row[COLUMNS.RUMAH.TUNGGAKAN]),
      _rowNumber: rowNumber
    };
  },
  
  /**
   * Generate new Rumah ID
   * @private
   */
  _generateId() {
    const sheet = this._getSheet();
    const data = sheet.getDataRange().getValues();
    let maxNum = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.RUMAH.ID]) {
        const id = String(data[i][COLUMNS.RUMAH.ID]);
        const num = parseInt(id.replace(CONFIG.ID_PREFIX.RUMAH, ''));
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    
    const newNum = maxNum + 1;
    const paddedNum = StringUtils.padZero(newNum, CONFIG.ID_LENGTH.RUMAH);
    return CONFIG.ID_PREFIX.RUMAH + paddedNum;
  }
};