import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Parameter 'q' (query) diperlukan" },
      { status: 400 }
    );
  }

  // Cari produk berdasarkan SKU atau barcode
  // SQLite bersifat case-insensitive untuk default string comparison
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { sku: { equals: query } },
        { barcode: { equals: query } },
      ],
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Produk tidak ditemukan", found: false },
      { status: 404 }
    );
  }

  return NextResponse.json({
    found: true,
    product: {
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
    },
  });
}
