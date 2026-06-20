/**
 * Utility untuk export data ke CSV dan Excel
 */

/**
 * Convert array of objects ke CSV string
 */
export function toCsv<T extends Record<string, unknown>>(
  data: T[],
  headers: Record<keyof T, string>
): string {
  const headerRow = Object.values(headers).join(",");
  const rows = data.map((item) => {
    return Object.keys(headers)
      .map((key) => {
        const value = item[key];
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Escape quotes dan wrap dengan quotes jika ada koma
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
}

/**
 * Download data sebagai file CSV
 */
export function downloadCsv<T extends Record<string, unknown>>(
  data: T[],
  headers: Record<keyof T, string>,
  filename: string
): Response {
  const csv = toCsv(data, headers);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

  return new Response(blob, {
    headers: {
      "Content-Type": "text/csv;charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}

/**
 * Headers untuk export Products
 */
export const PRODUCT_HEADERS = {
  sku: "SKU",
  barcode: "Barcode",
  name: "Nama Produk",
  category: "Kategori",
  price: "Harga Jual",
  costPrice: "Harga Modal",
  stock: "Stok",
  minStock: "Min Stok",
  unit: "Satuan",
  status: "Status",
} as const;

/**
 * Headers untuk export Orders
 */
export const ORDER_HEADERS = {
  orderNumber: "No. Order",
  customerName: "Pelanggan",
  status: "Status",
  total: "Total",
  items: "Jumlah Item",
  notes: "Catatan",
  createdAt: "Tanggal",
} as const;

/**
 * Headers untuk export Users
 */
export const USER_HEADERS = {
  name: "Nama",
  email: "Email",
  role: "Role",
  status: "Status",
  position: "Jabatan",
  department: "Departemen",
  phone: "Telepon",
  joinDate: "Tanggal Bergabung",
} as const;
