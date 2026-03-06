/**
 * Model_KK.gs
 * Data access layer for Kartu Keluarga (Family Cards)
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Model_KK = {
  
  /**
   * Get sheet reference
   * @private
   */
  _getSheet() {
    return SS.getSheetByName(CONFIG.SHEET_NAMES.KARTU_KELUARGA);
  },
  
  /**
   * Get all KK data
   * @return {Array<Object>} Array of KK objects
   */
  getAll() {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        console.error('Model_KK.getAll: Sheet not found');
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const kkList = [];
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.isEmpty(data[i][COLUMNS.KK.ID])) {
          continue;
        }
        
        kkList.push(this._rowToObject(data[i], i + 1));
      }
      
      console.log('Model_KK.getAll: Found ' + kkList.length + ' records');
      return kkList;
      
    } catch (error) {
      console.error('Model_KK.getAll error:', error);
      return [];
    }
  },
  
  /**
   * Get KK by ID
   * @param {string} kkId - KK ID
   * @return {Object|null} KK object or null
   */
  getById(kkId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return null;
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KK.ID], kkId)) {
          return this._rowToObject(data[i], i + 1);
        }
      }
      
      console.log('Model_KK.getById: Not found - ' + kkId);
      return null;
      
    } catch (error) {
      console.error('Model_KK.getById error:', error);
      return null;
    }
  },
  
  /**
   * Get KK list by Rumah ID
   * @param {string} rumahId - Rumah ID
   * @return {Array<Object>} Array of KK objects
   */
  getByRumahId(rumahId) {
    try {
      const allKK = this.getAll();
      return allKK.filter(kk => StringUtils.equals(kk.rumahId, rumahId));
      
    } catch (error) {
      console.error('Model_KK.getByRumahId error:', error);
      return [];
    }
  },
  
  /**
   * Create new KK
   * @param {Object} kkData - KK data
   * @return {Object} Result object
   */
  create(kkData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      // Generate new ID
      const kkId = this._generateId();
      
      // Handle tanggal lahir
      let tanggalLahir = '';
      if (kkData.tanggalLahir) {
        tanggalLahir = DateUtils.formatISO(kkData.tanggalLahir);
      }
      
      // Prepare row data
      const rowData = [
        kkId,
        StringUtils.clean(kkData.rumahId),
        StringUtils.clean(kkData.namaJalan),
        NumberUtils.toNumber(kkData.nomorRumah),
        StringUtils.clean(kkData.noKK),
        StringUtils.clean(kkData.nik),
        StringUtils.clean(kkData.nama),
        StringUtils.clean(kkData.status) || CONFIG.DEFAULTS.KK_STATUS,
        StringUtils.clean(kkData.jenisKelamin) || CONFIG.DEFAULTS.JENIS_KELAMIN,
        StringUtils.clean(kkData.tempatLahir),
        StringUtils.clean(kkData.pendidikan),
        StringUtils.clean(kkData.statusPerkawinan),
        StringUtils.clean(kkData.pekerjaan),
        tanggalLahir,
        StringUtils.clean(kkData.agama) || CONFIG.DEFAULTS.AGAMA,
        StringUtils.clean(kkData.kepemilikanRumah) || CONFIG.DEFAULTS.KEPEMILIKAN_RUMAH
      ];
      
      sheet.appendRow(rowData);
      
      console.log('Model_KK.create: Success - ' + kkId);
      return {
        success: true,
        kkId: kkId,
        message: CONFIG.SUCCESS_MESSAGES.DATA_SAVED
      };
      
    } catch (error) {
      console.error('Model_KK.create error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Update existing KK
   * @param {string} kkId - KK ID
   * @param {Object} kkData - Updated KK data
   * @return {Object} Result object
   */
  update(kkId, kkData) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KK.ID], kkId)) {
          rowIndex = i;
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, message: 'KK not found' };
      }
      
      const row = rowIndex + 1;
      
      // Update fields
      if (kkData.rumahId !== undefined) {
        sheet.getRange(row, COLUMNS.KK.RUMAH_ID + 1).setValue(StringUtils.clean(kkData.rumahId));
      }
      
      if (kkData.namaJalan !== undefined) {
        sheet.getRange(row, COLUMNS.KK.NAMA_JALAN + 1).setValue(StringUtils.clean(kkData.namaJalan));
      }
      
      if (kkData.nomorRumah !== undefined) {
        sheet.getRange(row, COLUMNS.KK.NO_RUMAH + 1).setValue(NumberUtils.toNumber(kkData.nomorRumah));
      }
      
      if (kkData.noKK !== undefined) {
        sheet.getRange(row, COLUMNS.KK.NO_KK + 1).setValue(StringUtils.clean(kkData.noKK));
      }
      
      if (kkData.nik !== undefined) {
        sheet.getRange(row, COLUMNS.KK.NIK + 1).setValue(StringUtils.clean(kkData.nik));
      }
      
      if (kkData.nama !== undefined) {
        sheet.getRange(row, COLUMNS.KK.NAMA + 1).setValue(StringUtils.clean(kkData.nama));
      }
      
      if (kkData.status !== undefined) {
        sheet.getRange(row, COLUMNS.KK.STATUS + 1).setValue(StringUtils.clean(kkData.status));
      }
      
      if (kkData.jenisKelamin !== undefined) {
        sheet.getRange(row, COLUMNS.KK.JENIS_KELAMIN + 1).setValue(StringUtils.clean(kkData.jenisKelamin));
      }
      
      if (kkData.tempatLahir !== undefined) {
        sheet.getRange(row, COLUMNS.KK.TEMPAT_LAHIR + 1).setValue(StringUtils.clean(kkData.tempatLahir));
      }
      
      if (kkData.pendidikan !== undefined) {
        sheet.getRange(row, COLUMNS.KK.PENDIDIKAN + 1).setValue(StringUtils.clean(kkData.pendidikan));
      }
      
      if (kkData.statusPerkawinan !== undefined) {
        sheet.getRange(row, COLUMNS.KK.STATUS_PERKAWINAN + 1).setValue(StringUtils.clean(kkData.statusPerkawinan));
      }
      
      if (kkData.pekerjaan !== undefined) {
        sheet.getRange(row, COLUMNS.KK.PEKERJAAN + 1).setValue(StringUtils.clean(kkData.pekerjaan));
      }
      
      if (kkData.tanggalLahir !== undefined) {
        const tanggalStr = DateUtils.formatISO(kkData.tanggalLahir);
        sheet.getRange(row, COLUMNS.KK.TANGGAL_LAHIR + 1).setValue(tanggalStr);
      }
      
      if (kkData.agama !== undefined) {
        sheet.getRange(row, COLUMNS.KK.AGAMA + 1).setValue(StringUtils.clean(kkData.agama));
      }
      
      if (kkData.kepemilikanRumah !== undefined) {
        sheet.getRange(row, COLUMNS.KK.KEPEMILIKAN_RUMAH + 1).setValue(StringUtils.clean(kkData.kepemilikanRumah));
      }
      
      console.log('Model_KK.update: Success - ' + kkId);
      return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_UPDATED };
      
    } catch (error) {
      console.error('Model_KK.update error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Delete KK
   * @param {string} kkId - KK ID
   * @return {Object} Result object
   */
  delete(kkId) {
    try {
      const sheet = this._getSheet();
      if (!sheet) {
        return { success: false, message: 'Sheet not found' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (StringUtils.equals(data[i][COLUMNS.KK.ID], kkId)) {
          sheet.deleteRow(i + 1);
          console.log('Model_KK.delete: Success - ' + kkId);
          return { success: true, message: CONFIG.SUCCESS_MESSAGES.DATA_DELETED };
        }
      }
      
      return { success: false, message: 'KK not found' };
      
    } catch (error) {
      console.error('Model_KK.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Convert sheet row to KK object
   * @private
   */
  _rowToObject(row, rowNumber) {
    // Handle tanggal lahir
    let tanggalLahirFormatted = '';
    if (row[COLUMNS.KK.TANGGAL_LAHIR]) {
      if (row[COLUMNS.KK.TANGGAL_LAHIR] instanceof Date) {
        tanggalLahirFormatted = DateUtils.formatISO(row[COLUMNS.KK.TANGGAL_LAHIR]);
      } else {
        tanggalLahirFormatted = StringUtils.clean(row[COLUMNS.KK.TANGGAL_LAHIR]);
      }
    }
    
    return {
      kkId: StringUtils.clean(row[COLUMNS.KK.ID]),
      rumahId: StringUtils.clean(row[COLUMNS.KK.RUMAH_ID]),
      namaJalan: StringUtils.clean(row[COLUMNS.KK.NAMA_JALAN]),
      nomorRumah: NumberUtils.toNumber(row[COLUMNS.KK.NO_RUMAH]),
      noKK: StringUtils.clean(row[COLUMNS.KK.NO_KK]),
      nik: StringUtils.clean(row[COLUMNS.KK.NIK]),
      nama: StringUtils.clean(row[COLUMNS.KK.NAMA]),
      status: StringUtils.clean(row[COLUMNS.KK.STATUS]),
      jenisKelamin: StringUtils.clean(row[COLUMNS.KK.JENIS_KELAMIN]),
      tempatLahir: StringUtils.clean(row[COLUMNS.KK.TEMPAT_LAHIR]),
      pendidikan: StringUtils.clean(row[COLUMNS.KK.PENDIDIKAN]),
      statusPerkawinan: StringUtils.clean(row[COLUMNS.KK.STATUS_PERKAWINAN]),
      pekerjaan: StringUtils.clean(row[COLUMNS.KK.PEKERJAAN]),
      tanggalLahir: tanggalLahirFormatted,
      agama: StringUtils.clean(row[COLUMNS.KK.AGAMA]),
      kepemilikanRumah: StringUtils.clean(row[COLUMNS.KK.KEPEMILIKAN_RUMAH]),
      _rowNumber: rowNumber
    };
  },
  
  /**
   * Generate new KK ID
   * @private
   */
  _generateId() {
    const sheet = this._getSheet();
    const data = sheet.getDataRange().getValues();
    let maxNum = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.KK.ID]) {
        const id = String(data[i][COLUMNS.KK.ID]);
        const num = parseInt(id.replace(CONFIG.ID_PREFIX.KK, ''));
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    
    const newNum = maxNum + 1;
    const paddedNum = StringUtils.padZero(newNum, CONFIG.ID_LENGTH.KK);
    return CONFIG.ID_PREFIX.KK + paddedNum;
  }
};