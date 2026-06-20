import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadCsv, ORDER_HEADERS } from "@/lib/excel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = orders.map((o) => ({
    orderNumber: o.orderNumber,
    customerName: o.user?.name || "-",
    status: o.status,
    total: o.total,
    items: o.items.length,
    notes: o.notes || "",
    createdAt: o.createdAt.toLocaleDateString("id-ID"),
  }));

  return downloadCsv(data, ORDER_HEADERS, `order_${new Date().toISOString().split("T")[0]}`);
}
