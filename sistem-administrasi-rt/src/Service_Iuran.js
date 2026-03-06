/**
 * Service_Iuran.gs
 * Business logic for Iuran calculation and management
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Service_Iuran = {
  
  /**
   * Get iuran for a rumah with calculated values
   * @param {string} rumahId - Rumah ID
   * @return {Array<Object>} Array of iuran objects with calculations
   */
  getIuranForRumah(rumahId) {
    try {
      // Get rumah data
      const rumah = Model_Rumah.getById(rumahId);
      if (!rumah) {
        console.error('Service_Iuran.getIuranForRumah: Rumah not found');
        return [];
      }
      
      // Get iuran records
      const iuranRecords = Model_Iuran.getByRumahId(rumahId);
      
      // Build complete iuran list with komponen details
      const iuranList = [];
      
      for (const iuranRecord of iuranRecords) {
        // Get komponen details
        const komponen = Model_Komponen.getById(iuranRecord.komponenId);
        if (!komponen) {
          continue; // Skip if komponen not found
        }
        
        // Calculate qty based on satuan
        const qty = this._calculateQty(komponen.satuan, rumah);
        
        // Determine nominal to use (override or default)
        const nominal = iuranRecord.nominalOverride !== null && 
                       iuranRecord.nominalOverride !== undefined ?
                       iuranRecord.nominalOverride : komponen.nominal;
        
        // Calculate total
        const total = nominal * qty;
        
        // Build iuran object
        iuranList.push({
          komponenId: komponen.komponenId,
          namaKomponen: komponen.nama,
          satuan: komponen.satuan,
          nominalDefault: komponen.nominal,
          nominalDefaultFormatted: NumberUtils.formatCurrency(komponen.nominal, false),
          nominalOverride: iuranRecord.nominalOverride,
          nominalOverrideFormatted: iuranRecord.nominalOverride !== null && 
                                     iuranRecord.nominalOverride !== undefined ?
                                     NumberUtils.formatCurrency(iuranRecord.nominalOverride, false) : '',
          nominalUsed: nominal,
          qty: qty,
          total: total,
          totalFormatted: NumberUtils.formatCurrency(total)
        });
      }
      
      console.log('Service_Iuran.getIuranForRumah: Found ' + iuranList.length + ' components');
      return iuranList;
      
    } catch (error) {
      console.error('Service_Iuran.getIuranForRumah error:', error);
      return [];
    }
  },
  
  /**
   * Save iuran data (update nominals and recalculate)
   * @param {string} rumahId - Rumah ID
   * @param {Array<Object>} iuranList - Array of iuran objects from frontend
   * @return {Object} Result object
   */
  saveIuran(rumahId, iuranList) {
    try {
      let totalIuran = 0;
      
      // Update each iuran record
      for (const iuran of iuranList) {
        const updateData = {
          nominalOverride: iuran.nominalOverride !== null && 
                          iuran.nominalOverride !== undefined && 
                          iuran.nominalOverride !== '' ? 
                          iuran.nominalOverride : null,
          qty: iuran.qty,
          total: iuran.total
        };
        
        Model_Iuran.update(rumahId, iuran.komponenId, updateData);
        
        totalIuran += NumberUtils.toNumber(iuran.total);
      }
      
      // Update total iuran in rumah
      Model_Rumah.updateTotalIuran(rumahId, totalIuran);
      
      console.log('Service_Iuran.saveIuran: Total iuran = ' + totalIuran);
      
      return {
        success: true,
        totalIuran: totalIuran,
        totalIuranFormatted: NumberUtils.formatCurrency(totalIuran),
        message: CONFIG.SUCCESS_MESSAGES.DATA_SAVED
      };
      
    } catch (error) {
      console.error('Service_Iuran.saveIuran error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Add komponen to rumah
   * @param {string} rumahId - Rumah ID
   * @param {string} komponenId - Komponen ID to add
   * @return {Object} Result object
   */
  addKomponenToRumah(rumahId, komponenId) {
    try {
      // Validate rumah exists
      const rumah = Model_Rumah.getById(rumahId);
      if (!rumah) {
        return { success: false, message: 'Rumah tidak ditemukan' };
      }
      
      // Validate komponen exists
      const komponen = Model_Komponen.getById(komponenId);
      if (!komponen) {
        return { success: false, message: 'Komponen tidak ditemukan' };
      }
      
      // Check if already exists
      const existing = Model_Iuran.getByRumahId(rumahId);
      const alreadyExists = existing.some(iuran => 
        StringUtils.equals(iuran.komponenId, komponenId)
      );
      
      if (alreadyExists) {
        return { success: false, message: 'Komponen sudah ditambahkan' };
      }
      
      // Calculate qty
      const qty = this._calculateQty(komponen.satuan, rumah);
      const total = komponen.nominal * qty;
      
      // Create iuran record
      const iuranData = {
        rumahId: rumahId,
        komponenId: komponenId,
        nominalDefault: komponen.nominal,
        nominalOverride: null,
        qty: qty,
        total: total
      };
      
      const result = Model_Iuran.create(iuranData);
      
      if (result.success) {
        // Recalculate total iuran
        this.recalculateIuran(rumahId);
      }
      
      return result;
      
    } catch (error) {
      console.error('Service_Iuran.addKomponenToRumah error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Remove komponen from rumah
   * @param {string} rumahId - Rumah ID
   * @param {string} komponenId - Komponen ID to remove
   * @return {Object} Result object
   */
  removeKomponenFromRumah(rumahId, komponenId) {
    try {
      const result = Model_Iuran.delete(rumahId, komponenId);
      
      if (result.success) {
        // Recalculate total iuran
        this.recalculateIuran(rumahId);
      }
      
      return result;
      
    } catch (error) {
      console.error('Service_Iuran.removeKomponenFromRumah error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Recalculate iuran for a rumah
   * Called when rumah data changes (jumlah jiwa, mobil, motor)
   * @param {string} rumahId - Rumah ID
   * @return {boolean} Success status
   */
  recalculateIuran(rumahId) {
    try {
      const iuranList = this.getIuranForRumah(rumahId);
      
      if (iuranList.length === 0) {
        // No iuran, set total to 0
        Model_Rumah.updateTotalIuran(rumahId, 0);
        return true;
      }
      
      // Save with recalculated values
      const result = this.saveIuran(rumahId, iuranList);
      
      return result.success;
      
    } catch (error) {
      console.error('Service_Iuran.recalculateIuran error:', error);
      return false;
    }
  },
  
  /**
   * Calculate quantity based on satuan and rumah data
   * @private
   * @param {string} satuan - Satuan type
   * @param {Object} rumah - Rumah object
   * @return {number} Calculated quantity
   */
  _calculateQty(satuan, rumah) {
    const satuanLower = StringUtils.lower(satuan);
    
    // Case-insensitive matching with contains
    if (satuanLower.includes('jiwa')) {
      return rumah.jumlahJiwa;
    }
    
    if (satuanLower.includes('mobil')) {
      return rumah.mobil;
    }
    
    if (satuanLower.includes('motor')) {
      return rumah.motor;
    }
    
    if (satuanLower.includes('rumah')) {
      return 1;
    }
    
    // Default: per unit = 1
    return 1;
  }
};