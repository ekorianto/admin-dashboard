import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint untuk export data ke Google Sheets
 *
 * Catatan: Fitur ini membutuhkan package "googleapis" dan konfigurasi Google Cloud.
 * Untuk setup lengkap, lihat halaman Settings > Integrations.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type } = body;

    // Cek apakah googleapis sudah terinstall
    try {
      require.resolve("googleapis");
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Package 'googleapis' belum terinstall. Jalankan: npm install googleapis",
        },
        { status: 400 }
      );
    }

    // Cek env vars
    if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      return NextResponse.json(
        {
          ok: false,
          error: "Google Sheets credentials belum diatur. Lihat halaman Settings > Integrations.",
        },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      return NextResponse.json(
        { ok: false, error: "GOOGLE_SHEETS_SPREADSHEET_ID belum diatur" },
        { status: 400 }
      );
    }

    // Import googleapis
    const { google } = await import("googleapis");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // --- TEST: Lightweight connection check ---
    if (type === "test") {
      await sheets.spreadsheets.get({
        spreadsheetId,
        ranges: [],
      });
      return NextResponse.json({
        ok: true,
        message: "Koneksi ke Google Sheets berhasil! ✅",
      });
    }

    // --- DEMO: Export sample data ---
    if (type === "demo") {
      const now = new Date().toLocaleString("id-ID");

      // Cari sheet tab yang ada (coba "Demo", fallback ke sheet pertama yang ditemukan)
      let sheetName = "Demo";
      try {
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId,
          ranges: [],
        });
        const existingSheets = spreadsheet.data.sheets?.map((s: { properties?: { title?: string } }) => s.properties?.title || "") || [];
        if (!existingSheets.includes("Demo") && existingSheets.length > 0) {
          sheetName = existingSheets[0];
        }
      } catch {
        // If we can't get sheet names, still try "Demo"
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            ["Timestamp", "Tipe", "Deskripsi", "Nilai"],
            [now, "🎉 Demo", "Test integrasi Google Sheets", "Berhasil!"],
            [now, "📦 Produk", "Contoh data produk", "OK"],
            [now, "📋 Order", "Contoh data order", "OK"],
            [now, "👤 User", "Contoh data user", "OK"],
          ],
        },
      });

      return NextResponse.json({
        ok: true,
        message: `Demo data berhasil dikirim ke Google Sheets! Cek sheet '${sheetName}'.`,
      });
    }

    switch (type) {
      case "products": {
        const products = await prisma.product.findMany({
          include: { category: true },
          orderBy: { createdAt: "desc" },
        });

        const headers = ["SKU", "Nama Produk", "Kategori", "Harga", "Stok", "Min Stok", "Status"];
        const rows = products.map((p) => [
          p.sku,
          p.name,
          p.category?.name || "-",
          String(p.price),
          String(p.stock),
          String(p.minStock),
          p.status,
        ]);

        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: "Produk!A:Z",
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Produk!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headers, ...rows] },
        });

        return NextResponse.json({
          ok: true,
          message: `Berhasil export ${rows.length} produk ke Google Sheets!`,
        });
      }
      case "orders": {
        const orders = await prisma.order.findMany({
          include: { user: true, items: true },
          orderBy: { createdAt: "desc" },
        });

        const headers = ["No. Order", "Pelanggan", "Status", "Total", "Items", "Tanggal"];
        const rows = orders.map((o) => [
          o.orderNumber,
          o.user?.name || "-",
          o.status,
          String(o.total),
          String(o.items.length),
          o.createdAt.toLocaleDateString("id-ID"),
        ]);

        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: "Order!A:Z",
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Order!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headers, ...rows] },
        });

        return NextResponse.json({
          ok: true,
          message: `Berhasil export ${rows.length} order ke Google Sheets!`,
        });
      }
      case "users": {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
        });

        const headers = ["Nama", "Email", "Role", "Status", "Departemen", "Bergabung"];
        const rows = users.map((u) => [
          u.name,
          u.email,
          u.role,
          u.status,
          u.department || "-",
          u.joinDate.toLocaleDateString("id-ID"),
        ]);

        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: "User!A:Z",
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "User!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headers, ...rows] },
        });

        return NextResponse.json({
          ok: true,
          message: `Berhasil export ${rows.length} user ke Google Sheets!`,
        });
      }
      case "all": {
        // Export semua data ke sheet terpisah

        // Products
        const products = await prisma.product.findMany({
          include: { category: true },
        });
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: "Produk!A:Z",
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Produk!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              ["SKU", "Nama", "Kategori", "Harga", "Stok", "Status"],
              ...products.map((p) => [p.sku, p.name, p.category?.name || "-", String(p.price), String(p.stock), p.status]),
            ],
          },
        });

        // Orders
        const orders = await prisma.order.findMany({
          include: { user: true, items: true },
        });
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: "Order!A:Z",
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Order!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              ["No. Order", "Pelanggan", "Status", "Total", "Tanggal"],
              ...orders.map((o) => [o.orderNumber, o.user?.name || "-", o.status, String(o.total), o.createdAt.toLocaleDateString("id-ID")]),
            ],
          },
        });

        // Users
        const users = await prisma.user.findMany();
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: "User!A:Z",
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "User!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              ["Nama", "Email", "Role", "Status"],
              ...users.map((u) => [u.name, u.email, u.role, u.status]),
            ],
          },
        });

        return NextResponse.json({
          ok: true,
          message: "Semua data berhasil diexport ke Google Sheets! (3 sheet: Produk, Order, User)",
        });
      }
      default:
        return NextResponse.json({ ok: false, error: "Tipe tidak dikenal. Gunakan: test, demo, products, orders, users, atau all" }, { status: 400 });
    }
  } catch (err) {
    console.error("[Google Sheets Export] Error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
