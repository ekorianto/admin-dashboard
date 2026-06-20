import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSlackNotification } from "@/lib/slack";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { ok: false, error: "SLACK_WEBHOOK_URL belum diatur. Lihat halaman Settings > Integrations." },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "test": {
        result = await sendSlackNotification({
          text: `✅ *Test Notifikasi Berhasil!*\nDashboard terintegrasi dengan Slack pada ${new Date().toLocaleString("id-ID")}`,
        });
        break;
      }
      case "order": {
        result = await sendSlackNotification({
          text: `🆕 *Order Baru!*\nNo: ${data.orderNumber}\nTotal: Rp ${(data.total || 0).toLocaleString("id-ID")}\nPelanggan: ${data.customerName || "-"}`,
        });
        break;
      }
      case "stock": {
        result = await sendSlackNotification({
          text: `⚠️ *Stok Menipis!*\nProduk: ${data.productName}\nSKU: ${data.sku}\nStok: ${data.stock} (min: ${data.minStock})`,
        });
        break;
      }
      default:
        return NextResponse.json({ ok: false, error: "Tipe notifikasi tidak dikenal" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
