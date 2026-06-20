/**
 * Google Sheets API Service untuk StockFG Pro
 * 
 * Membaca dan menulis data dari Google Spreadsheet menggunakan Service Account.
 * 
 * 📦 Package required: googleapis
 * Jalankan: npm install googleapis
 */

import { SS_IDS } from "./config";

/**
 * Dapatkan Google Sheets API client
 * Menggunakan dynamic import agar tidak error jika googleapis belum terinstall
 */
async function getSheetsClient() {
  try {
    const { google } = await import("googleapis");

    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
      throw new Error("GOOGLE_SHEETS_PRIVATE_KEY atau GOOGLE_SHEETS_CLIENT_EMAIL belum diatur di .env");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: privateKey.replace(/\\n/g, "\n"),
        client_email: clientEmail,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
  } catch (err) {
    if ((err as Error).message?.includes("Cannot find module")) {
      throw new Error("Package 'googleapis' belum terinstall. Jalankan: npm install googleapis");
    }
    throw err;
  }
}

/**
 * Konversi array 2D ke array of objects (seperti sheetToObjects_ di GAS)
 */
function rowsToObjects(data: string[][]): Record<string, unknown>[] {
  if (!data || data.length < 2) return [];

  const headers = data[0].map((h) => String(h || "").trim());
  const result: Record<string, unknown>[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj: Record<string, unknown> = { _row: i + 1 };
    let hasData = false;

    for (let j = 0; j < headers.length; j++) {
      const val = row[j] ?? "";
      obj[headers[j]] = val;
      if (val !== "" && val !== null && val !== undefined) hasData = true;
    }

    if (hasData) result.push(obj);
  }

  return result;
}

/**
 * Membaca data dari sheet
 * @param spreadsheetId ID spreadsheet
 * @param sheetName Nama sheet
 * @param range Range (default: A:Z)
 */
export async function readSheet(
  spreadsheetId: string,
  sheetName: string,
  range: string = "A:Z"
): Promise<Record<string, unknown>[]> {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    return rowsToObjects(res.data.values as string[][] || []);
  } catch (err) {
    console.error(`[Sheets] Error membaca ${sheetName}:`, err);
    throw err;
  }
}

/**
 * Fungsi generic untuk membaca data dari spreadsheet StockFG
 * @param ssKey Key dari SS_IDS (LEMBUR, OUTPUT, CO1F, CALENDAR, HARIAN)
 * @param sheetName Nama sheet
 */
export async function readStockSheet(
  ssKey: keyof typeof SS_IDS,
  sheetName: string
): Promise<Record<string, unknown>[]> {
  const spreadsheetId = SS_IDS[ssKey];
  if (!spreadsheetId) throw new Error(`Spreadsheet key '${ssKey}' tidak dikenal`);

  return readSheet(spreadsheetId, sheetName);
}

/**
 * Menulis data ke sheet
 */
export async function appendToSheet(
  spreadsheetId: string,
  sheetName: string,
  values: unknown[][]
): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    return true;
  } catch (err) {
    console.error(`[Sheets] Error append ke ${sheetName}:`, err);
    throw err;
  }
}

/**
 * Hapus baris dari sheet (clear content)
 */
export async function clearSheetRow(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  numCols: number = 10
): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    const range = `${sheetName}!A${rowIndex}:${String.fromCharCode(64 + numCols)}${rowIndex}`;
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    return true;
  } catch (err) {
    console.error(`[Sheets] Error clear row ${rowIndex}:`, err);
    throw err;
  }
}

/**
 * Cek koneksi Google Sheets (test)
 */
export async function testSheetsConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    // Coba baca spreadsheet pertama
    await sheets.spreadsheets.get({
      spreadsheetId: SS_IDS.OUTPUT,
      ranges: [],
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
