/**
 * Service_Rumah.gs
 * Business logic for Rumah (Houses)
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Service_Rumah = {
  
  /**
   * Get all rumah with formatted data
   * @return {Array<Object>} Array of rumah objects
   */
  getAll() {
    try {
      const rumahList = Model_Rumah.getAll();
      
      // Format for frontend
      return rumahList.map(rumah => this._formatRumah(rumah));
      
    } catch (error) {
      console.error('Service_Rumah.getAll error:', error);
      return [];
    }
  },
  
  /**
   * Get rumah detail by ID with complete information
   * @param {string} rumahId - Rumah ID
   * @return {Object|null} Rumah detail object
   */
  getById(rumahId) {
    try {
      const rumah = Model_Rumah.getById(rumahId);
      if (!rumah) {
        return null;
      }
      
      // Get KK list for this rumah
      const kkList = Model_KK.getByRumahId(rumahId);
      
      // Get iuran list for this rumah
      const iuranList = Model_Iuran.getByRumahId(rumahId);
      
      // Build complete detail object
      return {
        ...this._formatRumah(rumah),
        kkList: kkList.map(kk => this._formatKKSummary(kk)),
        kkCount: kkList.length,
        iuranList: iuranList,
        iuranCount: iuranList.length
      };
      
    } catch (error) {
      console.error('Service_Rumah.getById error:', error);
      return null;
    }
  },
  
  /**
   * Create new rumah
   * @param {Object} rumahData - Rumah data from frontend
   * @return {Object} Result object
   */
  create(rumahData) {
    try {
      // Validate required fields
      if (StringUtils.isEmpty(rumahData.namaJalan)) {
        return { success: false, message: 'Nama Jalan wajib diisi' };
      }
      
      if (!rumahData.nomorRumah || rumahData.nomorRumah <= 0) {
        return { success: false, message: 'Nomor Rumah wajib diisi' };
      }
      
      // Create rumah via Model
      const result = Model_Rumah.create(rumahData);
      
      return result;
      
    } catch (error) {
      console.error('Service_Rumah.create error:', error);
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
      // Validate rumah exists
      const existing = Model_Rumah.getById(rumahId);
      if (!existing) {
        return { success: false, message: 'Rumah tidak ditemukan' };
      }
      
      // Update rumah
      const result = Model_Rumah.update(rumahId, rumahData);
      
      // If jumlah jiwa, mobil, or motor changed, recalculate iuran
      if (rumahData.jumlahJiwa !== undefined || 
          rumahData.mobil !== undefined || 
          rumahData.motor !== undefined) {
        
        // Trigger iuran recalculation
        Service_Iuran.recalculateIuran(rumahId);
      }
      
      return result;
      
    } catch (error) {
      console.error('Service_Rumah.update error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Delete rumah
   * @param {string} rumahId - Rumah ID
   * @return {Object} Result object
   */
  delete(rumahId) {
    try {
      // Check if rumah has KK
      const kkList = Model_KK.getByRumahId(rumahId);
      if (kkList.length > 0) {
        return { 
          success: false, 
          message: 'Tidak dapat menghapus rumah yang masih memiliki Kartu Keluarga' 
        };
      }
      
      // Delete all iuran for this rumah first
      Model_Iuran.deleteByRumahId(rumahId);
      
      // Delete rumah
      const result = Model_Rumah.delete(rumahId);
      
      return result;
      
    } catch (error) {
      console.error('Service_Rumah.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Get unique jalan list for filter dropdown
   * @return {Array<string>} Array of jalan names
   */
  getJalanList() {
    try {
      return Model_Rumah.getJalanList();
    } catch (error) {
      console.error('Service_Rumah.getJalanList error:', error);
      return [];
    }
  },
  
  /**
   * Get nomor rumah list for specific jalan
   * @param {string} jalan - Jalan name
   * @return {Array<number>} Array of rumah numbers
   */
  getNomorRumahList(jalan) {
    try {
      if (StringUtils.isEmpty(jalan)) {
        return [];
      }
      return Model_Rumah.getNomorRumahListByJalan(jalan);
    } catch (error) {
      console.error('Service_Rumah.getNomorRumahList error:', error);
      return [];
    }
  },
  
  /**
   * Format rumah object for frontend
   * @private
   */
  _formatRumah(rumah) {
    return {
      rumahId: rumah.rumahId,
      namaJalan: rumah.namaJalan,
      nomorRumah: rumah.nomorRumah,
      jumlahJiwa: rumah.jumlahJiwa,
      mobil: rumah.mobil,
      motor: rumah.motor,
      status: rumah.status,
      keterangan: rumah.keterangan,
      totalIuranPerbulan: rumah.totalIuranPerbulan,
      totalIuranFormatted: NumberUtils.formatCurrency(rumah.totalIuranPerbulan),
      tunggakanIuran: rumah.tunggakanIuran,
      tunggakanFormatted: NumberUtils.formatCurrency(rumah.tunggakanIuran)
    };
  },
  
  /**
   * Format KK summary for rumah detail
   * @private
   */
  _formatKKSummary(kk) {
    return {
      kkId: kk.kkId,
      noKK: kk.noKK,
      nik: kk.nik,
      nama: kk.nama,
      status: kk.status,
      jenisKelamin: kk.jenisKelamin
    };
  }
};