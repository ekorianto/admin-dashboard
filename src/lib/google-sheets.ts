/**
 * Utility untuk integrasi Google Sheets
 * Export data dari database ke spreadsheet
 *
 * Cara setup:
 * 1. Buka https://console.cloud.google.com
 * 2. Buat project baru → Enable Google Sheets API
 * 3. Buat Service Account → download JSON key
 * 4. Set env vars di .env
 * 5. Share spreadsheet dengan email service account
 */
import { google } from "googleapis";

const SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

/**
 * Dapatkan auth client untuk Google Sheets API
 */
function getAuth() {
  if (!SHEETS_PRIVATE_KEY || !SHEETS_CLIENT_EMAIL) {
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials: {
      private_key: SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: SHEETS_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * Push data ke Google Sheets
 * @param sheetName Nama sheet (tab), default "Sheet1"
 * @param headers Array header kolom
 * @param rows Array of array untuk data baris
 */
export async function pushToSheet(
  sheetName: string = "Sheet1",
  headers: string[],
  rows: string[][]
): Promise<{ ok: boolean; error?: string }> {
  const auth = getAuth();
  if (!auth) {
    return {
      ok: false,
      error:
        "Google Sheets belum dikonfigurasi. Set GOOGLE_SHEETS_PRIVATE_KEY dan GOOGLE_SHEETS_CLIENT_EMAIL di .env",
    };
  }

  if (!SHEETS_SPREADSHEET_ID) {
    return { ok: false, error: "GOOGLE_SHEETS_SPREADSHEET_ID belum diatur" };
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Bersihkan sheet dulu
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    // Tulis headers + data
    const values = [headers, ...rows];
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return { ok: true };
  } catch (err) {
    console.error("[Google Sheets] Error:", err);
    return { ok: false, error: String(err) };
  }
}

/**
 * Export produk ke Google Sheets
 */
export async function exportProductsToSheet(products: {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: string;
}[]) {
  return pushToSheet(
    "Produk",
    ["SKU", "Nama Produk", "Kategori", "Harga", "Stok", "Min Stok", "Status"],
    products.map((p) => [
      p.sku,
      p.name,
      p.category,
      String(p.price),
      String(p.stock),
      String(p.minStock),
      p.status,
    ])
  );
}

/**
 * Export order ke Google Sheets
 */
export async function exportOrdersToSheet(orders: {
  orderNumber: string;
  customer: string;
  status: string;
  total: number;
  items: number;
  date: string;
}[]) {
  return pushToSheet(
    "Order",
    ["No. Order", "Pelanggan", "Status", "Total", "Items", "Tanggal"],
    orders.map((o) => [
      o.orderNumber,
      o.customer,
      o.status,
      String(o.total),
      String(o.items),
      o.date,
    ])
  );
}

/**
 * Export user ke Google Sheets
 */
export async function exportUsersToSheet(users: {
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
}[]) {
  return pushToSheet(
    "User",
    ["Nama", "Email", "Role", "Status", "Departemen"],
    users.map((u) => [u.name, u.email, u.role, u.status, u.department])
  );
}
