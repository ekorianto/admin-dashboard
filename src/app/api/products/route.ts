import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  const safeProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: Number(p.costPrice),
  }));

  return NextResponse.json(safeProducts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name, sku, description, price, costPrice,
      stock, minStock, unit, categoryId, status,
    } = body;

    if (!name || !sku) {
      return NextResponse.json(
        { error: "Nama dan SKU harus diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json(
        { error: "SKU sudah digunakan" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        unit: unit || "pcs",
        status: status || "ACTIVE",
        categoryId: categoryId && categoryId !== "none" ? categoryId : null,
        createdById: session.user?.id,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Gagal membuat produk" },
      { status: 500 }
    );
  }
}
