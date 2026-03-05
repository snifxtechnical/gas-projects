/**
 * MODUL: MASTER DATA MANAGEMENT
 * v2.0: Tambah fungsi Archive (soft delete) dan Delete (hapus permanen)
 *       untuk Master_Akun dan Master_Kategori.
 *       getMasterAkun/getMasterKategori otomatis filter status_aktif=YA.
 */

// ══════════════════════════════════════════════════════════════
//  HELPER: VALIDASI POLA ID
// ══════════════════════════════════════════════════════════════

function _isValidAkunId(id) {
  return id && /^A\d+$/i.test(id.toString().trim());
}

function _isValidKategoriId(id) {
  return id && /^K\d+$/i.test(id.toString().trim());
}


// ══════════════════════════════════════════════════════════════
//  SEKSI: MASTER KATEGORI
// ══════════════════════════════════════════════════════════════

/**
 * Mengambil semua Kategori AKTIF (status_aktif = YA atau kolom belum ada).
 * Cached 6 jam.
 */
function getMasterKategori() {
  const cacheKey = 'data_master_kategori';
  const cached   = CacheService.getScriptCache().get(cacheKey);
  if (cached) return { success: true, data: JSON.parse(cached), source: 'cache' };

  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const data      = sheet.getDataRange().getValues();
    data.shift();

    const result = data
      .map(row => mapRowToObject(row, headerMap))
      .filter(obj => {
        if (!_isValidKategoriId(obj.id_kategori)) return false;
        // Jika kolom status_aktif ada, filter hanya yang YA; jika belum ada kolom, tampilkan semua
        if (obj.status_aktif !== undefined && obj.status_aktif !== '') {
          return obj.status_aktif.toString().toUpperCase() !== APP_CONFIG.STATUS.MASTER_ARSIP;
        }
        return true;
      });

    CacheService.getScriptCache().put(cacheKey, JSON.stringify(result), APP_CONFIG.CACHE_TTL);
    return { success: true, data: result, source: 'sheet' };

  } catch (e) {
    console.error('getMasterKategori error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Menambah Kategori Baru.
 */
function addKategori(data) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_KATEGORI);

    if (!data.id_kategori)   throw new Error('id_kategori wajib diisi.');
    if (!_isValidKategoriId(data.id_kategori)) throw new Error('Format ID Kategori tidak valid. Gunakan format K001, K101, dst.');
    if (!data.nama_kategori) throw new Error('nama_kategori wajib diisi.');

    const existing = getMasterKategori();
    if (existing.success) {
      const dup = existing.data.find(k => k.id_kategori === data.id_kategori);
      if (dup) throw new Error(`ID Kategori "${data.id_kategori}" sudah ada.`);
    }

    // Pastikan status_aktif terisi
    data.status_aktif = APP_CONFIG.STATUS.MASTER_AKTIF;

    const rowData = mapObjectToRow(data, headerMap);
    sheet.appendRow(rowData);

    invalidateCache('data_master_kategori', `header_map_${APP_CONFIG.SHEETS.MASTER_KATEGORI}`);
    return { success: true, message: `Kategori "${data.nama_kategori}" berhasil ditambahkan.` };

  } catch (e) {
    console.error('addKategori error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Update Kategori (semua field kecuali id_kategori).
 */
function updateKategori(kategoriId, updatedData) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const fullData  = sheet.getDataRange().getValues();
    const idIdx     = headerMap['id_kategori'];

    if (idIdx === undefined) throw new Error("Kolom 'id_kategori' tidak ditemukan.");

    // Jangan biarkan ID diubah
    delete updatedData.id_kategori;

    let found = false;
    for (let i = 1; i < fullData.length; i++) {
      if (fullData[i][idIdx] === kategoriId) {
        const currentObj = mapRowToObject(fullData[i], headerMap);
        fullData[i] = mapObjectToRow({ ...currentObj, ...updatedData }, headerMap);
        found = true;
        break;
      }
    }

    if (!found) throw new Error(`Kategori ID "${kategoriId}" tidak ditemukan.`);

    sheet.getRange(1, 1, fullData.length, fullData[0].length).setValues(fullData);
    invalidateCache('data_master_kategori');
    return { success: true, message: 'Kategori berhasil diperbarui.' };

  } catch (e) {
    console.error('updateKategori error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Archive Kategori (soft delete — status_aktif = TIDAK).
 * Data tetap di sheet, hanya tidak muncul di daftar aktif.
 */
function archiveKategori(kategoriId) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const fullData  = sheet.getDataRange().getValues();
    const idIdx       = headerMap['id_kategori'];
    const statusIdx   = headerMap['status_aktif'];

    if (idIdx === undefined) throw new Error("Kolom 'id_kategori' tidak ditemukan.");
    if (statusIdx === undefined) throw new Error("Kolom 'status_aktif' belum ada. Jalankan Setup Schema terlebih dahulu.");

    let found = false;
    let namaKategori = '';
    for (let i = 1; i < fullData.length; i++) {
      if (fullData[i][idIdx] === kategoriId) {
        namaKategori = fullData[i][headerMap['nama_kategori']] || kategoriId;
        fullData[i][statusIdx] = APP_CONFIG.STATUS.MASTER_ARSIP;
        found = true;
        break;
      }
    }

    if (!found) throw new Error(`Kategori ID "${kategoriId}" tidak ditemukan.`);

    sheet.getRange(1, 1, fullData.length, fullData[0].length).setValues(fullData);
    invalidateCache('data_master_kategori');
    return { success: true, message: `Kategori "${namaKategori}" berhasil diarsipkan.` };

  } catch (e) {
    console.error('archiveKategori error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Delete Kategori (hapus permanen dari sheet).
 * Transaksi lama yang menggunakan kategori ini tetap menyimpan id_kategori-nya.
 */
function deleteKategori(kategoriId) {
  try {
    const sheet    = getSheet(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_KATEGORI);
    const data     = sheet.getDataRange().getValues();
    const idIdx    = headerMap['id_kategori'];

    if (idIdx === undefined) throw new Error("Kolom 'id_kategori' tidak ditemukan.");

    let rowToDelete = -1;
    let namaKategori = '';
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === kategoriId) {
        namaKategori = data[i][headerMap['nama_kategori']] || kategoriId;
        rowToDelete  = i + 1; // Sheet row (1-indexed, +1 karena header)
        break;
      }
    }

    if (rowToDelete === -1) throw new Error(`Kategori ID "${kategoriId}" tidak ditemukan.`);

    sheet.deleteRow(rowToDelete);
    invalidateCache('data_master_kategori', `header_map_${APP_CONFIG.SHEETS.MASTER_KATEGORI}`);
    return { success: true, message: `Kategori "${namaKategori}" berhasil dihapus permanen.` };

  } catch (e) {
    console.error('deleteKategori error:', e.message);
    return { success: false, message: e.message };
  }
}


// ══════════════════════════════════════════════════════════════
//  SEKSI: MASTER AKUN
// ══════════════════════════════════════════════════════════════

/**
 * Mengambil semua Akun AKTIF (status_aktif = YA atau kolom belum ada).
 * Cached 6 jam.
 */
function getMasterAkun() {
  const cacheKey = 'data_master_akun';
  const cached   = CacheService.getScriptCache().get(cacheKey);
  if (cached) return { success: true, data: JSON.parse(cached), source: 'cache' };

  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_AKUN);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_AKUN);
    const data      = sheet.getDataRange().getValues();
    data.shift();

    const result = data
      .map(row => mapRowToObject(row, headerMap))
      .filter(obj => {
        if (!_isValidAkunId(obj.id_akun)) return false;
        if (obj.status_aktif !== undefined && obj.status_aktif !== '') {
          return obj.status_aktif.toString().toUpperCase() !== APP_CONFIG.STATUS.MASTER_ARSIP;
        }
        return true;
      });

    CacheService.getScriptCache().put(cacheKey, JSON.stringify(result), APP_CONFIG.CACHE_TTL);
    return { success: true, data: result, source: 'sheet' };

  } catch (e) {
    console.error('getMasterAkun error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Mengambil data Saldo Akun dari sheet Saldo_Akun.
 */
function getMasterSaldoAkun() {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.SALDO);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.SALDO);
    const data      = sheet.getDataRange().getValues();
    data.shift();

    const result = data
      .map(row => mapRowToObject(row, headerMap))
      .filter(obj => _isValidAkunId(obj.id_akun))
      .map(obj => ({
        ...obj,
        saldo_awal   : parseFloat(obj.saldo_awal)   || 0,
        total_masuk  : parseFloat(obj.total_masuk)  || 0,
        total_keluar : parseFloat(obj.total_keluar) || 0,
        saldo_akhir  : parseFloat(obj.saldo_akhir)  || 0
      }));

    return { success: true, data: result };

  } catch (e) {
    console.error('getMasterSaldoAkun error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Menambah Akun Baru. Auto-generate ID jika tidak disediakan.
 */
function addAkun(data) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_AKUN);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_AKUN);

    if (!data.nama_akun) throw new Error('nama_akun wajib diisi.');

    if (!data.id_akun) {
      data.id_akun = _generateNextAkunId();
    }

    if (!_isValidAkunId(data.id_akun)) {
      throw new Error(`Format ID Akun tidak valid: "${data.id_akun}". Gunakan format A001, A010, dst.`);
    }

    const existing = getMasterAkun();
    if (existing.success) {
      const dup = existing.data.find(a => a.id_akun === data.id_akun);
      if (dup) throw new Error(`ID Akun "${data.id_akun}" sudah ada.`);
    }

    data.saldo_awal   = parseFloat(data.saldo_awal) || 0;
    data.status_aktif = APP_CONFIG.STATUS.MASTER_AKTIF;

    const rowData = mapObjectToRow(data, headerMap);
    sheet.appendRow(rowData);

    invalidateCache('data_master_akun', `header_map_${APP_CONFIG.SHEETS.MASTER_AKUN}`);
    return { success: true, id: data.id_akun, message: `Akun "${data.nama_akun}" berhasil ditambahkan dengan ID ${data.id_akun}.` };

  } catch (e) {
    console.error('addAkun error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Update Akun (semua field kecuali id_akun).
 */
function updateAkun(akunId, updatedData) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_AKUN);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_AKUN);
    const fullData  = sheet.getDataRange().getValues();
    const idIdx     = headerMap['id_akun'];

    if (idIdx === undefined) throw new Error("Kolom 'id_akun' tidak ditemukan.");

    // Jangan biarkan ID diubah
    delete updatedData.id_akun;

    let found = false;
    for (let i = 1; i < fullData.length; i++) {
      if (fullData[i][idIdx] === akunId) {
        const currentObj = mapRowToObject(fullData[i], headerMap);
        if (updatedData.saldo_awal !== undefined) {
          updatedData.saldo_awal = parseFloat(updatedData.saldo_awal) || 0;
        }
        fullData[i] = mapObjectToRow({ ...currentObj, ...updatedData }, headerMap);
        found = true;
        break;
      }
    }

    if (!found) throw new Error(`Akun ID "${akunId}" tidak ditemukan.`);

    sheet.getRange(1, 1, fullData.length, fullData[0].length).setValues(fullData);
    invalidateCache('data_master_akun');
    return { success: true, message: 'Akun berhasil diperbarui.' };

  } catch (e) {
    console.error('updateAkun error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Archive Akun (soft delete — status_aktif = TIDAK).
 */
function archiveAkun(akunId) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_AKUN);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_AKUN);
    const fullData  = sheet.getDataRange().getValues();
    const idIdx     = headerMap['id_akun'];
    const statusIdx = headerMap['status_aktif'];

    if (idIdx === undefined) throw new Error("Kolom 'id_akun' tidak ditemukan.");
    if (statusIdx === undefined) throw new Error("Kolom 'status_aktif' belum ada. Jalankan Setup Schema terlebih dahulu.");

    let found = false;
    let namaAkun = '';
    for (let i = 1; i < fullData.length; i++) {
      if (fullData[i][idIdx] === akunId) {
        namaAkun = fullData[i][headerMap['nama_akun']] || akunId;
        fullData[i][statusIdx] = APP_CONFIG.STATUS.MASTER_ARSIP;
        found = true;
        break;
      }
    }

    if (!found) throw new Error(`Akun ID "${akunId}" tidak ditemukan.`);

    sheet.getRange(1, 1, fullData.length, fullData[0].length).setValues(fullData);
    invalidateCache('data_master_akun');
    return { success: true, message: `Akun "${namaAkun}" berhasil diarsipkan.` };

  } catch (e) {
    console.error('archiveAkun error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Delete Akun (hapus permanen dari sheet).
 */
function deleteAkun(akunId) {
  try {
    const sheet     = getSheet(APP_CONFIG.SHEETS.MASTER_AKUN);
    const headerMap = getHeaderMap(APP_CONFIG.SHEETS.MASTER_AKUN);
    const data      = sheet.getDataRange().getValues();
    const idIdx     = headerMap['id_akun'];

    if (idIdx === undefined) throw new Error("Kolom 'id_akun' tidak ditemukan.");

    let rowToDelete = -1;
    let namaAkun    = '';
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === akunId) {
        namaAkun    = data[i][headerMap['nama_akun']] || akunId;
        rowToDelete = i + 1;
        break;
      }
    }

    if (rowToDelete === -1) throw new Error(`Akun ID "${akunId}" tidak ditemukan.`);

    sheet.deleteRow(rowToDelete);
    invalidateCache('data_master_akun', `header_map_${APP_CONFIG.SHEETS.MASTER_AKUN}`);
    return { success: true, message: `Akun "${namaAkun}" berhasil dihapus permanen.` };

  } catch (e) {
    console.error('deleteAkun error:', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Auto-generate ID Akun berikutnya.
 * @private
 */
function _generateNextAkunId() {
  const existing = getMasterAkun();
  if (!existing.success || existing.data.length === 0) return 'A001';

  const nums = existing.data
    .map(a => parseInt((a.id_akun || '').replace(/^A/i, ''), 10))
    .filter(n => !isNaN(n));

  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return 'A' + next.toString().padStart(3, '0');
}
