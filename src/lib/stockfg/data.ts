/**
 * StockFG Data Access Layer
 * Menggantikan fungsi-fungsi di Code.gs seperti getStockFGData_(), getDashboardData(), dll.
 */

import { readStockSheet } from "./sheets";
import { SS_IDS, SHEET_NAMES, DEFAULT_LOW_STOCK } from "./config";

// ─────────────────────────────────────────────
// 🚀 STOCK FG
// ─────────────────────────────────────────────

export interface StockFGItem {
  [key: string]: unknown;
  _qtySertim: number;
  _qtyRel: number;
  _qtyPO: number;
  _qtySPK: number;
  _qtySFG: number;
}

/**
 * Mendapatkan data Stock FG dari Output Harian
 */
export async function getStockFGData(): Promise<StockFGItem[]> {
  const rows = await readStockSheet("OUTPUT", SHEET_NAMES.OUTPUT_HARIAN);
  if (!rows || rows.length === 0) return [];

  return rows.map((r) => ({
    ...r,
    _qtySertim: parseFloat(String(r["Qty rel"] ?? 0)) || 0,
    _qtyRel: parseFloat(String(r["Qty rel"] ?? 0)) || 0,
    _qtyPO: parseFloat(String(r["Qty PO"] ?? 0)) || 0,
    _qtySPK: parseFloat(String(r["Qty SPK"] ?? 0)) || 0,
    _qtySFG: parseFloat(String(r["Qty SFG"] ?? 0)) || 0,
  })) as StockFGItem[];
}

/**
 * Mendapatkan Stock SFG (filter Article SFG tidak kosong)
 */
export async function getStockSFGData(): Promise<Record<string, unknown>[]> {
  const rows = await readStockSheet("OUTPUT", SHEET_NAMES.OUTPUT_HARIAN);
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((r) => r["Article SFG"] && String(r["Article SFG"]).trim() !== "")
    .map((r) => ({
      Line: r["Line"] || "",
      Tanggal: r["Tanggal"] || "",
      Week: r["Week"] || "",
      Produk: r["Produk"] || "",
      "No SPK": r["No SPK"] || "",
      SFG: r["SFG"] || "",
      "Article SFG": r["Article SFG"] || "",
      "Qty SFG": r["Qty SFG"] || "",
      _qtySFG: parseFloat(String(r["Qty SFG"] ?? 0)) || 0,
      _row: r._row,
    }));
}

/**
 * Forecast FG - filter PO KRISBOW = 'FORECAST'
 */
export async function getForecastFG(): Promise<StockFGItem[]> {
  const rows = await getStockFGData();
  return rows.filter(
    (r) => String(r["PO KRISBOW"] || "").trim().toUpperCase() === "FORECAST"
  );
}

/**
 * Stock FG tanpa No SPK
 */
export async function getNoSPKFG(): Promise<StockFGItem[]> {
  const rows = await getStockFGData();
  return rows.filter(
    (r) =>
      String(r["PO KRISBOW"] || "").trim().toUpperCase() !== "FORECAST" &&
      (!r["No SPK"] || String(r["No SPK"]).trim() === "")
  );
}

/**
 * Mendapatkan threshold low stock
 */
function getLowStockThreshold(): number {
  const env = process.env.LOW_STOCK_THRESHOLD;
  return env ? parseInt(env) : DEFAULT_LOW_STOCK;
}

// ─────────────────────────────────────────────
// 📊 DASHBOARD
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalFG: number;
  totalSFG: number;
  totalForecastCount: number;
  totalForecastQty: number;
  lowFG: number;
  lowSFG: number;
  noSpkFG: number;
  noSpkQtyRel: number;
  lemburToday: number;
  co1fToday: number;
  threshold: number;
}

export interface DashboardData {
  stats: DashboardStats;
  chartFG: { label: string; value: number }[];
  chartLembur: { label: string; value: number }[];
  chartCo1F: { label: string; value: number }[];
  alerts: Alert[];
  activity: ActivityItem[];
}

export interface Alert {
  type: "danger" | "warn";
  cat: string;
  msg: string;
  page: string;
  tab: string;
}

export interface ActivityItem {
  time: string;
  type: string;
  icon: string;
  text: string;
}

/**
 * Mendapatkan data dashboard lengkap
 */
export async function getDashboardData(): Promise<DashboardData> {
  const thr = getLowStockThreshold();
  const today = new Date().toISOString().split("T")[0];

  const fgData = await getStockFGData();
  const sfgData = await getStockSFGData();
  const totalFG = fgData.length;
  const totalSFG = sfgData.length;
  const lowFG = fgData.filter((r) => r._qtySertim > 0 && r._qtySertim <= thr).length;
  const lowSFG = sfgData.filter((r) => (r._qtySFG as number) > 0 && (r._qtySFG as number) <= thr).length;
  const noSpkRows = fgData.filter(
    (r) =>
      String(r["PO KRISBOW"] || "").trim().toUpperCase() !== "FORECAST" &&
      (!r["No SPK"] || String(r["No SPK"]).trim() === "")
  );
  const noSpkFG = noSpkRows.length;
  const noSpkQtyRel = noSpkRows.reduce((s, r) => s + r._qtyRel, 0);

  const forecastRows = await getForecastFG();
  const totalForecastCount = forecastRows.length;
  const totalForecastQty = forecastRows.reduce((s, r) => s + r._qtyRel, 0);

  // Chart FG per produk
  const produkMap: Record<string, number> = {};
  fgData.forEach((r) => {
    const p = String(r["Produk"] || "Lainnya");
    produkMap[p] = (produkMap[p] || 0) + r._qtySertim;
  });
  const chartFG = Object.entries(produkMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  // Alerts
  const alerts: Alert[] = [];
  fgData
    .filter((r) => r._qtySertim > 0 && r._qtySertim <= thr)
    .slice(0, 20)
    .forEach((r) => {
      alerts.push({
        type: "danger",
        cat: "FG",
        msg: `Low Stock FG: ${r["ARTICLE"] || r["Article"] || "-"} - Qty: ${r._qtySertim}`,
        page: "stock-fg",
        tab: "low",
      });
    });
  sfgData
    .filter((r) => (r._qtySFG as number) > 0 && (r._qtySFG as number) <= thr)
    .slice(0, 20)
    .forEach((r) => {
      alerts.push({
        type: "warn",
        cat: "SFG",
        msg: `Low Stock SFG: ${r["Article SFG"] || "-"} - Qty: ${r._qtySFG}`,
        page: "stock-sfg",
        tab: "low",
      });
    });
  if (noSpkFG > 0) {
    alerts.push({
      type: "warn",
      cat: "SPK",
      msg: `${noSpkFG} item FG tanpa No SPK (Qty: ${noSpkQtyRel})`,
      page: "stock-fg",
      tab: "nospk",
    });
  }

  // Activity feed (simplified - dari serahterima FG)
  const serahterimaFG = await readStockSheet("OUTPUT", SHEET_NAMES.SERAHTERIMA_FG);
  const activity: ActivityItem[] = (serahterimaFG || []).slice(-20).map((r) => ({
    time: String(r["Tanggal"] || ""),
    type: "FG",
    icon: "📦",
    text: `Serahterima FG - No SPK: ${r["NO SPK"] || ""}`,
  }));

  return {
    stats: {
      totalFG,
      totalSFG,
      totalForecastCount,
      totalForecastQty,
      lowFG,
      lowSFG,
      noSpkFG,
      noSpkQtyRel,
      lemburToday: 0,
      co1fToday: 0,
      threshold: thr,
    },
    chartFG,
    chartLembur: [],
    chartCo1F: [],
    alerts,
    activity,
  };
}

/**
 * Mendapatkan quick stats (ringan, untuk dashboard)
 */
export async function getQuickStats(): Promise<DashboardData> {
  // Untuk quick stats, ambil data yang diperlukan saja
  return getDashboardData();
}

// ─────────────────────────────────────────────
// 📤 SERAHTERIMA FG
// ─────────────────────────────────────────────

export async function getAllSerahterimaFG(): Promise<Record<string, unknown>[]> {
  try {
    return await readStockSheet("OUTPUT", SHEET_NAMES.SERAHTERIMA_FG);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// 🏭 SERAHTERIMA SFG
// ─────────────────────────────────────────────

export async function getAllSerahterimaSFG(): Promise<Record<string, unknown>[]> {
  try {
    return await readStockSheet("OUTPUT", SHEET_NAMES.SPK_SERAHTERIMA);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// ✅ CO1F
// ─────────────────────────────────────────────

export async function getAllCo1F(): Promise<Record<string, unknown>[]> {
  try {
    return await readStockSheet("CO1F", SHEET_NAMES.DONE_CO1F);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// 📦 OUTPUT PACKING
// ─────────────────────────────────────────────

export async function getAllOutputPacking(): Promise<Record<string, unknown>[]> {
  try {
    const rows = await readStockSheet("OUTPUT", SHEET_NAMES.OUTPUT_HARIAN);
    return (rows || []).map((r) => ({
      Tanggal: r["Tanggal"] || "",
      Shift: r["Shift"] || "",
      Produk: r["Produk"] || "",
      "Qty Rel": r["Qty rel"] || "",
      "Jam Kerja": r["Jam Kerja"] || "",
      Reason: r["Reseon"] || r["Reason"] || "",
      _row: r._row,
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// ⏰ LEMBUR
// ─────────────────────────────────────────────

export interface LemburItem {
  [key: string]: unknown;
  "Durasi (jam)": number;
}

export async function getAllLembur(): Promise<LemburItem[]> {
  try {
    const rows = await readStockSheet("LEMBUR", SHEET_NAMES.LEMBUR);
    return (rows || []).map((r) => {
      const durKey =
        Object.keys(r).find((k) => /durasi/i.test(k)) ||
        Object.keys(r).find((k) => /jam/i.test(k) && !/mulai|selesai|start|end/i.test(k));
      return {
        ...r,
        "Durasi (jam)": durKey ? parseFloat(String(r[durKey])) || 0 : 0,
      } as LemburItem;
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// 👥 MASTER DATA
// ─────────────────────────────────────────────

export async function getMasterKaryawan(): Promise<Record<string, unknown>[]> {
  try {
    return await readStockSheet("LEMBUR", SHEET_NAMES.MASTER_KARYAWAN);
  } catch {
    return [];
  }
}

export async function getMasterProduk(): Promise<Record<string, unknown>[]> {
  try {
    return await readStockSheet("OUTPUT", SHEET_NAMES.MASTER_PRODUK);
  } catch {
    return [];
  }
}

export async function getMasterSPKList(): Promise<Record<string, unknown>[]> {
  try {
    return await readStockSheet("OUTPUT", SHEET_NAMES.MASTER_SPK);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// 📋 SPK SFG TRACKING
// ─────────────────────────────────────────────

export async function trackSPKSFG(): Promise<Record<string, unknown>[]> {
  try {
    const spkRows = await readStockSheet("OUTPUT", SHEET_NAMES.SPK_SERAHTERIMA);
    if (!spkRows || spkRows.length === 0) return [];

    // Filter SPK aktif (LINE = SFG, CO1F != TRUE)
    const activeSPK = spkRows.filter((r) => {
      const line = String(r["LINE"] || "").trim().toUpperCase();
      const co1f = String(r["CO1F"] || "").trim().toUpperCase();
      return line === "SFG" && co1f !== "TRUE";
    });

    if (activeSPK.length === 0) return [];

    // Sort FIFO
    activeSPK.sort((a, b) => {
      const dateA = new Date(String(a["Tanggal"] || "1900-01-01")).getTime();
      const dateB = new Date(String(b["Tanggal"] || "1900-01-01")).getTime();
      return dateA - dateB;
    });

    return activeSPK.map((spk) => ({
      spk: spk["Spk"] || "",
      article: spk["Article"] || "",
      articleFG: spk["Article FG"] || "",
      deskripsi: spk["Deskripsi"] || "",
      tanggal: spk["Tanggal"] || "",
      targetQty: parseFloat(String(spk["Qty"] ?? 0)) || 0,
      status: spk["Status"] || "",
    }));
  } catch {
    return [];
  }
}
