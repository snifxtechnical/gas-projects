/**
 * GLOBAL CONFIGURATION
 * Sistem Keuangan Keluarga v2.0.0
 *
 * PENTING: Nama sheet di bawah harus sama persis dengan nama tab di Google Sheets Anda.
 * PENTING: Nama kolom (header) di sheet harus lowercase dengan underscore (snake_case).
 *
 * Jalankan "Setup Schema (Jalankan Pertama Kali)" dari menu setelah deploy
 * untuk memastikan semua kolom yang diperlukan sudah ada.
 */
const APP_CONFIG = {
  APP_NAME: "Sistem Keuangan Keluarga",
  APP_VERSION: "2.2.0",
  SCHEMA_VERSION: "2026-03",

  // ─── Nama Sheet (harus sama dengan nama tab di Spreadsheet) ───────────────
  SHEETS: {
    MASTER_KATEGORI : "Master_Kategori",
    MASTER_AKUN     : "Master_Akun",
    TRANSAKSI       : "Transaksi",
    BUDGET          : "Budget_Bulanan",
    BUDGET_TEMPLATE : "Budget_Template",
    REKAP           : "Rekap_Bulanan",
    SALDO           : "Saldo_Akun",
    ARISAN          : "Arisan_Tracking"
  },

  // ─── Nilai Tipe Transaksi ─────────────────────────────────────────────────
  TIPE: {
    PENDAPATAN : "PENDAPATAN",
    PENGELUARAN: "PENGELUARAN",
    TRANSFER   : "TRANSFER"      // v2.2: Pergeseran saldo internal antar akun
  },

  // ─── Nilai Status ─────────────────────────────────────────────────────────
  STATUS: {
    // Transaksi
    HAPUS      : "Y",
    AKTIF      : "N",
    // Arisan
    BAYAR_SUDAH : "SUDAH",
    BAYAR_BELUM : "BELUM",
    DAPAT_YA    : "YA",
    DAPAT_BELUM : "BELUM",
    ARISAN_AKTIF   : "YA",
    ARISAN_NONAKTIF: "TIDAK",
    // Master Akun & Kategori (status_aktif)
    MASTER_AKTIF : "YA",
    MASTER_ARSIP : "TIDAK"
  },

  // ─── Kode Kategori Khusus Arisan ──────────────────────────────────────────
  CATEGORY: {
    ARISAN_IN : "K005",
    ARISAN_OUT: "K601",
    // v2.2: ID kategori placeholder untuk transaksi Transfer (tidak muncul di laporan)
    TRANSFER_ID: "_TRANSFER_"
  },

  // ─── Target Metode 50/30/20 ───────────────────────────────────────────────
  BUDGET_TARGET: {
    KEBUTUHAN: 50,
    KEINGINAN: 30,
    TABUNGAN : 20
  },

  // ─── Cache TTL ────────────────────────────────────────────────────────────
  CACHE_TTL: 21600  // 6 Jam (detik)
};
