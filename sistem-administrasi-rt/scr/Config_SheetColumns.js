/**
 * Config_SheetColumns.gs
 * Column index configuration for all sheets
 * 
 * CRITICAL: Key names MUST match Model file expectations!
 * - Model_Rumah uses: COLUMNS.RUMAH.ID (not RUMAH_ID)
 * - Model_Rumah uses: COLUMNS.RUMAH.NOMOR (not NOMOR_RUMAH)
 * 
 * Version: 2.0.3 FINAL
 * Last Updated: 2026-02-02
 */

/**
 * COLUMNS object
 * Indices are 0-based (Column A = 0, B = 1, etc.)
 */
const COLUMNS = {
  /**
   * Sheet: Data_Rumah
   * Used by: Model_Rumah.gs
   */
  RUMAH: {
    ID: 0,                      // A: Rumah_ID (Model expects .ID not .RUMAH_ID!)
    NAMA_JALAN: 1,              // B: Nama_Jalan
    NOMOR: 2,                   // C: Nomor_Rumah (Model expects .NOMOR not .NOMOR_RUMAH!)
    JUMLAH_JIWA: 3,             // D: Jumlah_Jiwa_Dana_Sosial
    MOBIL: 4,                   // E: Mobil
    MOTOR: 5,                   // F: Motor
    STATUS: 6,                  // G: Status_Rumah
    KETERANGAN: 7,              // H: Keterangan
    TOTAL_IURAN: 8,             // I: Total_Iuran_Perbulan (Model expects .TOTAL_IURAN!)
    TUNGGAKAN: 9                // J: Tunggakan_iuran (Model expects .TUNGGAKAN!)
  },

  /**
   * Sheet: Kartu_Keluarga
   * Used by: Model_KK.gs
   */
  KK: {
    ID: 0,                      // A: KK_ID (Model expects .ID not .KK_ID!)
    RUMAH_ID: 1,                // B: Rumah_ID
    NAMA_JALAN: 2,              // C: Nama_Jalan
    NO_RUMAH: 3,                // D: No_Rumah (Model expects .NO_RUMAH!)
    NO_KK: 4,                   // E: No_KK
    NIK: 5,                     // F: NIK
    NAMA: 6,                    // G: Nama
    STATUS: 7,                  // H: Status (Kepala Keluarga/Istri/Anak)
    JENIS_KELAMIN: 8,           // I: Jenis_Kelamin
    TEMPAT_LAHIR: 9,            // J: Tempat_Lahir
    PENDIDIKAN: 10,             // K: Pendidikan
    STATUS_PERKAWINAN: 11,      // L: Status_Perkawinan
    PEKERJAAN: 12,              // M: Pekerjaan
    TANGGAL_LAHIR: 13,          // N: Tanggal_Lahir
    AGAMA: 14,                  // O: Agama
    KEPEMILIKAN_RUMAH: 15       // P: Rumah (Sendiri/Kontrak)
  },

  /**
   * Sheet: Iuran_Rumah
   * Used by: Model_Iuran.gs
   */
  IURAN: {
    RUMAH_ID: 0,                // A: Rumah_ID
    KOMPONEN_ID: 1,             // B: Komponen_id
    NOMINAL_DEFAULT: 2,         // C: Nominal_per_satuan_default
    NOMINAL_OVERRIDE: 3,        // D: Nominal_per_satuan_override
    QTY: 4,                     // E: Qty
    TOTAL: 5,                   // F: Total
    TAHUN_BULAN: 6,             // G: Tahun_Bulan
    TANGGAL_UPDATE: 7,          // H: Tanggal_update
    USER_UPDATE: 8              // I: User_update
  },

  /**
   * Sheet: Komponen_Iuran
   * Used by: Model_Komponen.gs
   */
  KOMPONEN: {
    ID: 0,                      // A: Komponen_id (Model expects .ID!)
    NAMA: 1,                    // B: Nama_Komponen (Model expects .NAMA!)
    SATUAN: 2,                  // C: Satuan
    NOMINAL: 3,                 // D: Nominal
    STATUS: 4                   // E: Status_Komponen
  },

  /**
   * Sheet: Kategori
   * Used by: Model_Kategori.gs
   */
  KATEGORI: {
    TIPE: 0,                    // A: Tipe
    NILAI: 1,                   // B: Nilai
    STATUS: 2                   // C: Status
  },

  /**
   * Sheet: Pengurus
   * Used by: Service_Auth.gs
   */
  PENGURUS: {
    USERNAME: 0,                // A: Username
    PASSWORD: 1,                // B: Password
    NAMA: 2,                    // C: Nama
    JABATAN: 3,                 // D: Jabatan
    ROLE: 4,                    // E: Role
    STATUS: 5,                  // F: Status
    TANGGAL_AKTIF: 6,           // G: Tanggal_Aktif
    TANGGAL_AKHIR: 7,           // H: Tanggal_Akhir
    NO_HP: 8,                   // I: No_HP
    CATATAN: 9                  // J: Catatan
  },

  /**
   * Sheet: Tagihan_Bulanan
   * Used by: API Tagihan
   */
  TAGIHAN: {
    ID: 0,                      // A: Tagihan_ID
    RUMAH_ID: 1,                // B: Rumah_ID
    NAMA_JALAN: 2,              // C: Nama_Jalan
    NOMOR_RUMAH: 3,             // D: Nomor_Rumah
    TIPE: 4,                    // E: Tipe (Iuran/Tunggakan)
    PERIODE: 5,                 // F: Periode (2026-01)
    BULAN: 6,                   // G: Bulan
    TAHUN: 7,                   // H: Tahun
    NAMA_TAGIHAN: 8,            // I: Nama_Tagihan
    TOTAL_TAGIHAN: 9,           // J: Total_Tagihan
    TOTAL_TERBAYAR: 10,         // K: Total_Terbayar
    SISA_TAGIHAN: 11,           // L: Sisa_Tagihan
    STATUS: 12,                 // M: Status
    TANGGAL_LUNAS: 13,          // N: Tanggal_Lunas
    KETERANGAN: 14,             // O: Keterangan
    TANGGAL_BUAT: 15            // P: Tanggal_Buat
  },

  /**
   * Sheet: Transaksi_Kas
   * Used by: API Transaksi
   */
  TRANSAKSI: {
    ID: 0,                      // A: Transaksi_ID
    TANGGAL: 1,                 // B: Tanggal
    JENIS: 2,                   // C: Jenis (Pemasukan/Pengeluaran)
    KATEGORI_ID: 3,             // D: Kategori_ID
    NAMA_KATEGORI: 4,           // E: Nama_Kategori
    NOMINAL: 5,                 // F: Nominal
    KETERANGAN: 6,              // G: Keterangan
    TAGIHAN_ID: 7,              // H: Tagihan_ID
    RUMAH_ID: 8,                // I: Rumah_ID
    USER_INPUT: 9,              // J: User_Input
    TANGGAL_INPUT: 10,          // K: Tanggal_Input
    METODE_PEMBAYARAN: 11       // L: Metode_Pembayaran
  },

  /**
   * Sheet: Kategori_pembukuan
   * Used by: API Kategori Pembukuan
   */
  KATEGORI_PEMBUKUAN: {
    ID: 0,                      // A: Kategori_id
    NAMA: 1,                    // B: Nama_Kategori
    DESKRIPSI: 2,               // C: Deskripsi
    TIPE: 3,                    // D: Tipe (Pemasukan/Pengeluaran)
    STATUS: 4                   // E: Status_Aktif
  }
};

/**
 * Validate column configuration
 */
function validateColumnConfiguration() {
  console.log('=== Validating COLUMNS Configuration ===\n');
  
  const tests = [
    { sheet: 'RUMAH', key: 'ID', expected: 0 },
    { sheet: 'RUMAH', key: 'NOMOR', expected: 2 },
    { sheet: 'RUMAH', key: 'TOTAL_IURAN', expected: 8 },
    { sheet: 'RUMAH', key: 'TUNGGAKAN', expected: 9 },
    { sheet: 'KK', key: 'ID', expected: 0 },
    { sheet: 'KK', key: 'NO_RUMAH', expected: 3 },
    { sheet: 'KOMPONEN', key: 'ID', expected: 0 },
    { sheet: 'KOMPONEN', key: 'NAMA', expected: 1 }
  ];
  
  let allPassed = true;
  
  tests.forEach(test => {
    const actual = COLUMNS[test.sheet][test.key];
    const passed = actual === test.expected;
    
    console.log(
      `${passed ? '✅' : '❌'} COLUMNS.${test.sheet}.${test.key} = ${actual} ` +
      `(expected: ${test.expected})`
    );
    
    if (!passed) allPassed = false;
  });
  
  console.log('\n=== Validation ' + (allPassed ? 'PASSED ✅' : 'FAILED ❌') + ' ===');
  return allPassed;
}

/**
 * Print column reference
 */
function printColumnReference() {
  console.log('=== COLUMNS Reference ===\n');
  
  for (const [sheetKey, columns] of Object.entries(COLUMNS)) {
    console.log(`${sheetKey}:`);
    for (const [colKey, colIndex] of Object.entries(columns)) {
      const letter = String.fromCharCode(65 + colIndex);
      console.log(`  ${colKey.padEnd(20)} = ${letter} (${colIndex})`);
    }
    console.log('');
  }
}

/**
 * Verify actual sheet structure matches COLUMNS config
 */
function verifySheetStructure() {
  console.log('=== Verifying Sheet Structure ===\n');
  
  const sheetMappings = {
    RUMAH: 'Data_Rumah',
    KK: 'Kartu_Keluarga',
    IURAN: 'Iuran_Rumah',
    KOMPONEN: 'Komponen_Iuran',
    KATEGORI: 'Kategori',
    PENGURUS: 'Pengurus'
  };
  
  for (const [key, sheetName] of Object.entries(sheetMappings)) {
    const sheet = SS.getSheetByName(sheetName);
    
    if (!sheet) {
      console.log(`❌ ${key}: Sheet '${sheetName}' NOT FOUND`);
      continue;
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const expectedCols = Object.keys(COLUMNS[key]).length;
    
    console.log(
      `✅ ${key} (${sheetName}): ` +
      `${lastRow} rows, ${lastCol} columns ` +
      `(config expects ${expectedCols} columns)`
    );
  }
}