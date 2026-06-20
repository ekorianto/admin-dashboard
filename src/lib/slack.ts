/**
 * Utility untuk mengirim notifikasi ke Slack via Webhook
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackMessage {
  text: string;
  blocks?: unknown[];
}

/**
 * Kirim notifikasi ke Slack
 */
export async function sendSlackNotification(message: SlackMessage): Promise<{ ok: boolean; error?: string }> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("[Slack] SLACK_WEBHOOK_URL belum diatur. Lewati notifikasi.");
    return { ok: false, error: "SLACK_WEBHOOK_URL not configured" };
  }

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Slack] Gagal mengirim:", text);
      return { ok: false, error: text };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Slack] Error:", err);
    return { ok: false, error: String(err) };
  }
}

/**
 * Kirim notifikasi order baru ke Slack
 */
export async function notifyNewOrder(order: {
  orderNumber: string;
  total: number;
  customerName?: string;
  items: number;
}) {
  return sendSlackNotification({
    text: `🆕 *Order Baru!*\n*No:* ${order.orderNumber}\n*Total:* Rp ${order.total.toLocaleString("id-ID")}\n*Items:* ${order.items} produk\n*Pelanggan:* ${order.customerName || "-"}`,
  });
}

/**
 * Kirim notifikasi low stock ke Slack
 */
export async function notifyLowStock(product: {
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}) {
  return sendSlackNotification({
    text: `⚠️ *Stok Menipis!*\n*Produk:* ${product.name} (${product.sku})\n*Stok:* ${product.stock} (min: ${product.minStock})`,
  });
}

/**
 * Kirim notifikasi user baru ke Slack
 */
export async function notifyNewUser(user: { name: string; email: string; role: string }) {
  return sendSlackNotification({
    text: `👤 *User Baru Terdaftar*\n*Nama:* ${user.name}\n*Email:* ${user.email}\n*Role:* ${user.role}`,
  });
}
