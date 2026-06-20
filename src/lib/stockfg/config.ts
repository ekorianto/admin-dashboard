/**
 * Konfigurasi StockFG Pro
 * Copy dari Google Apps Script StockFG Pro v3.2.1
 *
 * 🚨 WAJIB: Set environment variables di .env:
 * - GOOGLE_SHEETS_PRIVATE_KEY  (private key dari service account JSON)
 * - GOOGLE_SHEETS_CLIENT_EMAIL (client_email dari service account JSON)
 *
 * 📋 Langkah setup:
 * 1. Buka https://console.cloud.google.com
 * 2. Buat project → Enable Google Sheets API
 * 3. Buat Service Account → Download JSON key
 * 4. Share spreadsheet dengan email service account (client_email)
 * 5. Jalankan: npm install googleapis
 * 6. Set .env variables
 */

// Spreadsheet IDs dari StockFG Pro
export const SS_IDS = {
  LEMBUR: "1wh9-fen3uyNLA3bYYdWHJwCWQ_UwoIuFJXOfLv5vXoI",
  OUTPUT: "1EIFr7hPOZdkvMScaZTZmg7CUUrCQJ5Affu52cNzDyx8",
  CO1F: "1pXa7gIukDFFn-3CMrMiWWLAzHj7lmDVIbbFdKU-RSBU",
  CALENDAR: "1fA9QFltyhGk1GS0fSUD562v9gWm1q10CeMAM-V83zks",
  HARIAN: "1jqdZxCyHe5By5whDWLDsPCy8ai0JASbVEyrhLH7Mvs4",
};

// Nama-nama sheet
export const SHEET_NAMES = {
  OUTPUT_HARIAN: "Output Harian",
  SERAHTERIMA_FG: "Serahterima FG",
  SPK_SERAHTERIMA: "SPK Serahteima",
  MASTER_PRODUK: "Master Produk",
  MASTER_SPK: "MasterSPK",
  LEMBUR: "Lembur",
  MASTER_KARYAWAN: "MasterData",
  DONE_CO1F: "DONE CO1F",
  PRODUCTION_LINE: "ProductionLine",
  OPENING_STOCK: "OpeningStock",
  QR_LOG: "QR Log",
  AUDIT_LOG: "Audit Log",
};

// Default low stock threshold
export const DEFAULT_LOW_STOCK = 10;

// Nama role
export const ROLES = {
  admin: { label: "Admin", color: "#ef4444", pages: ["dashboard", "stock-fg", "stock-sfg", "serahterima-fg", "serahterima-sfg", "co1f", "output-packing", "overtime", "calendar-mpp", "ai-agent", "settings"] },
  pic: { label: "PIC", color: "#3b82f6", pages: ["dashboard", "serahterima-fg", "serahterima-sfg", "co1f", "output-packing", "overtime", "ai-agent"] },
};
