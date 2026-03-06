/**
 * ============================================================
 * MIGRATION: Fix Tanggal_Lunas di Tagihan_Bulanan
 * ============================================================
 * Memperbaiki 68 tagihan LUNAS yang Tanggal_Lunas-nya
 * berisi tanggal proses (salah), diganti dengan tanggal
 * pembayaran aktual dari Transaksi_Kas.
 *
 * CARA PAKAI:
 * 1. Buat file baru di Apps Script: Migration_FixTglLunas
 * 2. Paste kode ini
 * 3. Jalankan: fixTanggalLunas()
 * 4. Cek Log untuk hasil
 * 5. Hapus file setelah selesai
 * ============================================================
 */

function fixTanggalLunas() {
  console.log('=== MULAI FIX TANGGAL LUNAS ===');
  console.log('Waktu: ' + new Date().toISOString());
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var transaksiSheet = ss.getSheetByName('Transaksi_Kas');
  var tagihanSheet = ss.getSheetByName('Tagihan_Bulanan');
  
  if (!transaksiSheet || !tagihanSheet) {
    console.log('ERROR: Sheet not found!');
    return;
  }
  
  var transaksiData = transaksiSheet.getDataRange().getValues();
  var tagihanData = tagihanSheet.getDataRange().getValues();
  
  // Step 1: Build map tagihanId -> tanggal bayar dari Transaksi_Kas
  // Jika ada multiple transaksi untuk 1 tagihan, ambil yang terbaru
  var tagihanToTanggal = {};
  
  for (var i = 1; i < transaksiData.length; i++) {
    var row = transaksiData[i];
    var txId = String(row[0] || '').trim();
    if (!txId) continue;
    
    var tagihanId = String(row[7] || '').trim(); // Col H: Tagihan_ID
    var tanggal = row[1]; // Col B: Tanggal
    
    if (!tagihanId || !tanggal) continue;
    
    // Format tanggal ke yyyy-MM-dd string (timezone-safe)
    var tanggalStr = '';
    if (tanggal instanceof Date) {
      tanggalStr = Utilities.formatDate(tanggal, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      tanggalStr = String(tanggal).substring(0, 10);
    }
    
    // Keep latest date per tagihan
    if (!tagihanToTanggal[tagihanId] || tanggalStr > tagihanToTanggal[tagihanId]) {
      tagihanToTanggal[tagihanId] = tanggalStr;
    }
  }
  
  console.log('Linked tagihan found: ' + Object.keys(tagihanToTanggal).length);
  
  // Step 2: Update Tanggal_Lunas di Tagihan_Bulanan
  var fixCount = 0;
  var skipCount = 0;
  
  for (var j = 1; j < tagihanData.length; j++) {
    var tgRow = tagihanData[j];
    var tgId = String(tgRow[0] || '').trim();
    var status = String(tgRow[12] || '').trim(); // Col M: Status
    
    if (!tgId || status !== 'Lunas') continue;
    
    // Check if we have correct date from transaksi
    if (!tagihanToTanggal[tgId]) {
      skipCount++;
      continue;
    }
    
    var correctDate = tagihanToTanggal[tgId];
    
    // Get current Tanggal_Lunas
    var currentTglLunas = tgRow[13]; // Col N: Tanggal_Lunas
    var currentStr = '';
    if (currentTglLunas instanceof Date) {
      currentStr = Utilities.formatDate(currentTglLunas, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else if (currentTglLunas) {
      currentStr = String(currentTglLunas).substring(0, 10);
    }
    
    // Only update if different
    if (currentStr !== correctDate) {
      var rowNum = j + 1;
      tagihanSheet.getRange(rowNum, 14).setValue(correctDate); // Col N = 14
      fixCount++;
      
      var jalan = String(tgRow[2] || '');
      var nomor = String(tgRow[3] || '');
      var bulan = String(tgRow[6] || '');
      console.log('Fixed: ' + tgId + ' (' + jalan + ' ' + nomor + ' - ' + bulan + ') ' + currentStr + ' -> ' + correctDate);
    }
  }
  
  console.log('\n=== HASIL ===');
  console.log('Fixed: ' + fixCount + ' tagihan');
  console.log('Skipped (no linked transaksi): ' + skipCount);
  console.log('=== SELESAI ===');
}