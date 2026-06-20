import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadCsv, PRODUCT_HEADERS } from "@/lib/excel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const data = products.map((p) => ({
    sku: p.sku,
    barcode: p.barcode || "",
    name: p.name,
    category: p.category?.name || "-",
    price: p.price,
    costPrice: p.costPrice,
    stock: p.stock,
    minStock: p.minStock,
    unit: p.unit,
    status: p.status,
  }));

  return downloadCsv(data, PRODUCT_HEADERS, `produk_${new Date().toISOString().split("T")[0]}`);
}
