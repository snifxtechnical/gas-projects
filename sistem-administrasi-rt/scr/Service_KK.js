/**
 * Service_KK.gs
 * Business logic for Kartu Keluarga (Family Cards)
 * Version: 2.0
 * Last Updated: 2026-01-31
 */

const Service_KK = {
  
  /**
   * Get all KK with formatted data
   * @return {Array<Object>} Array of KK objects
   */
  getAll() {
    try {
      const kkList = Model_KK.getAll();
      
      // Format for frontend
      return kkList.map(kk => this._formatKK(kk));
      
    } catch (error) {
      console.error('Service_KK.getAll error:', error);
      return [];
    }
  },
  
  /**
   * Get KK detail by ID
   * @param {string} kkId - KK ID
   * @return {Object|null} KK detail object
   */
  getById(kkId) {
    try {
      const kk = Model_KK.getById(kkId);
      if (!kk) {
        return null;
      }
      
      return this._formatKK(kk);
      
    } catch (error) {
      console.error('Service_KK.getById error:', error);
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
      const kkList = Model_KK.getByRumahId(rumahId);
      return kkList.map(kk => this._formatKK(kk));
      
    } catch (error) {
      console.error('Service_KK.getByRumahId error:', error);
      return [];
    }
  },
  
  /**
   * Create new KK
   * @param {Object} kkData - KK data from frontend
   * @return {Object} Result object
   */
  create(kkData) {
    try {
      // Validate required fields
      if (StringUtils.isEmpty(kkData.rumahId)) {
        return { success: false, message: 'Rumah ID wajib diisi' };
      }
      
      if (StringUtils.isEmpty(kkData.noKK)) {
        return { success: false, message: 'No KK wajib diisi' };
      }
      
      if (StringUtils.isEmpty(kkData.nik)) {
        return { success: false, message: 'NIK wajib diisi' };
      }
      
      if (StringUtils.isEmpty(kkData.nama)) {
        return { success: false, message: 'Nama wajib diisi' };
      }
      
      // Validate NIK format (16 digits)
      if (!StringUtils.isValidNIK(kkData.nik)) {
        return { success: false, message: 'NIK harus 16 digit' };
      }
      
      // Validate No KK format (16 digits)
      if (!StringUtils.isValidNoKK(kkData.noKK)) {
        return { success: false, message: 'No KK harus 16 digit' };
      }
      
      // Get Rumah data to auto-fill namaJalan and nomorRumah
      const rumah = Model_Rumah.getById(kkData.rumahId);
      if (!rumah) {
        return { success: false, message: 'Rumah tidak ditemukan' };
      }
      
      // Auto-fill from rumah
      kkData.namaJalan = rumah.namaJalan;
      kkData.nomorRumah = rumah.nomorRumah;
      
      // Create KK via Model
      const result = Model_KK.create(kkData);
      
      // If success, update rumah jumlah jiwa (increment by 1)
      if (result.success) {
        const newJumlahJiwa = rumah.jumlahJiwa + 1;
        Model_Rumah.update(kkData.rumahId, { jumlahJiwa: newJumlahJiwa });
        
        // Trigger iuran recalculation
        Service_Iuran.recalculateIuran(kkData.rumahId);
      }
      
      return result;
      
    } catch (error) {
      console.error('Service_KK.create error:', error);
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
      // Validate KK exists
      const existing = Model_KK.getById(kkId);
      if (!existing) {
        return { success: false, message: 'KK tidak ditemukan' };
      }
      
      // Validate NIK format if provided
      if (kkData.nik && !StringUtils.isValidNIK(kkData.nik)) {
        return { success: false, message: 'NIK harus 16 digit' };
      }
      
      // Validate No KK format if provided
      if (kkData.noKK && !StringUtils.isValidNoKK(kkData.noKK)) {
        return { success: false, message: 'No KK harus 16 digit' };
      }
      
      // Update KK
      const result = Model_KK.update(kkId, kkData);
      
      return result;
      
    } catch (error) {
      console.error('Service_KK.update error:', error);
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
      // Get KK to know which rumah it belongs to
      const kk = Model_KK.getById(kkId);
      if (!kk) {
        return { success: false, message: 'KK tidak ditemukan' };
      }
      
      const rumahId = kk.rumahId;
      
      // Delete KK
      const result = Model_KK.delete(kkId);
      
      // If success, update rumah jumlah jiwa (decrement by 1)
      if (result.success) {
        const rumah = Model_Rumah.getById(rumahId);
        if (rumah) {
          const newJumlahJiwa = Math.max(0, rumah.jumlahJiwa - 1);
          Model_Rumah.update(rumahId, { jumlahJiwa: newJumlahJiwa });
          
          // Trigger iuran recalculation
          Service_Iuran.recalculateIuran(rumahId);
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('Service_KK.delete error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Format KK object for frontend
   * @private
   */
  _formatKK(kk) {
    // Calculate age from tanggal lahir
    let umur = 0;
    if (kk.tanggalLahir) {
      umur = DateUtils.getAge(kk.tanggalLahir);
    }
    
    return {
      kkId: kk.kkId,
      rumahId: kk.rumahId,
      namaJalan: kk.namaJalan,
      nomorRumah: kk.nomorRumah,
      noKK: kk.noKK,
      noKKFormatted: StringUtils.formatNoKK(kk.noKK),
      nik: kk.nik,
      nikFormatted: StringUtils.formatNIK(kk.nik),
      nama: kk.nama,
      status: kk.status,
      jenisKelamin: kk.jenisKelamin,
      tempatLahir: kk.tempatLahir,
      tanggalLahir: kk.tanggalLahir,
      tanggalLahirFormatted: DateUtils.formatDate(kk.tanggalLahir),
      umur: umur,
      pendidikan: kk.pendidikan,
      statusPerkawinan: kk.statusPerkawinan,
      pekerjaan: kk.pekerjaan,
      agama: kk.agama,
      kepemilikanRumah: kk.kepemilikanRumah
    };
  }
};