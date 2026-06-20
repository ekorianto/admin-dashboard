import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTrelloCard } from "@/lib/trello";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    if (!process.env.TRELLO_KEY || !process.env.TRELLO_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "TRELLO_KEY/TRELLO_TOKEN belum diatur. Lihat halaman Settings > Integrations." },
        { status: 400 }
      );
    }

    if (!process.env.TRELLO_LIST_ID) {
      return NextResponse.json(
        { ok: false, error: "TRELLO_LIST_ID belum diatur" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "test": {
        result = await createTrelloCard({
          name: `✅ Test Trello Integration — ${new Date().toLocaleString("id-ID")}`,
          desc: "Ini adalah kartu test untuk memverifikasi integrasi Trello dengan Admin Dashboard.",
        });
        break;
      }
      case "order": {
        result = await createTrelloCard({
          name: `📦 Order: ${data.orderNumber}`,
          desc: `**Order Baru**\n\nNo: ${data.orderNumber}\nTotal: Rp ${(data.total || 0).toLocaleString("id-ID")}\nPelanggan: ${data.customerName || "-"}\n\n🔗 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/orders`,
        });
        break;
      }
      case "restock": {
        result = await createTrelloCard({
          name: `🔄 Restock: ${data.productName} (${data.sku})`,
          desc: `**Perlu Restock**\n\nProduk: ${data.productName}\nSKU: ${data.sku}\nStok: ${data.stock}\nMin: ${data.minStock}\n\n🔗 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/products`,
        });
        break;
      }
      default:
        return NextResponse.json({ ok: false, error: "Tipe tidak dikenal" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
