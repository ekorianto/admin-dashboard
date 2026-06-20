/**
 * Utility untuk integrasi Trello API
 * Membuat kartu di Trello dari event di dashboard
 */

const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID;
const TRELLO_LIST_ID = process.env.TRELLO_LIST_ID;

interface TrelloCard {
  id?: string;
  url?: string;
  shortUrl?: string;
}

/**
 * Buat kartu baru di Trello
 */
export async function createTrelloCard(params: {
  name: string;
  desc?: string;
  due?: string;
  labels?: string[];
}): Promise<{ ok: boolean; card?: TrelloCard; error?: string }> {
  if (!TRELLO_KEY || !TRELLO_TOKEN) {
    console.warn("[Trello] TRELLO_KEY/TRELLO_TOKEN belum diatur");
    return { ok: false, error: "Trello credentials not configured" };
  }

  const listId = TRELLO_LIST_ID;
  if (!listId) {
    return { ok: false, error: "TRELLO_LIST_ID not configured" };
  }

  try {
    const url = new URL("https://api.trello.com/1/cards");
    url.searchParams.set("key", TRELLO_KEY);
    url.searchParams.set("token", TRELLO_TOKEN);
    url.searchParams.set("idList", listId);
    url.searchParams.set("name", params.name);
    if (params.desc) url.searchParams.set("desc", params.desc);
    if (params.due) url.searchParams.set("due", params.due);

    const res = await fetch(url.toString(), { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      console.error("[Trello] Gagal buat kartu:", data);
      return { ok: false, error: data.message || "Unknown error" };
    }

    return {
      ok: true,
      card: {
        id: data.id,
        url: data.url,
        shortUrl: data.shortUrl,
      },
    };
  } catch (err) {
    console.error("[Trello] Error:", err);
    return { ok: false, error: String(err) };
  }
}

/**
 * Buat kartu order baru di Trello
 */
export async function trelloNewOrder(order: {
  orderNumber: string;
  total: number;
  customerName?: string;
  items: number;
}) {
  return createTrelloCard({
    name: `📦 Order: ${order.orderNumber}`,
    desc: `**Order Baru**\n\n*No Order:* ${order.orderNumber}\n*Total:* Rp ${order.total.toLocaleString("id-ID")}\n*Items:* ${order.items} produk\n*Pelanggan:* ${order.customerName || "-"}\n\n---\n🔗 Buka di Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/orders`,
    labels: ["order"],
  });
}

/**
 * Buat kartu restock produk di Trello
 */
export async function trelloRestockProduct(product: {
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}) {
  return createTrelloCard({
    name: `🔄 Restock: ${product.name} (${product.sku})`,
    desc: `**Produk Perlu Restock**\n\n*Nama:* ${product.name}\n*SKU:* ${product.sku}\n*Stok Saat Ini:* ${product.stock}\n*Minimal Stok:* ${product.minStock}\n*Kekurangan:* ${Math.max(0, product.minStock - product.stock)} unit\n\n---\n🔗 Buka di Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/products`,
    labels: ["restock", "urgent"],
  });
}
