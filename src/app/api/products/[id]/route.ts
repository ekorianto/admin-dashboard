import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    costPrice: Number(product.costPrice),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check SKU uniqueness if changed
    if (body.sku && body.sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku: body.sku } });
      if (skuTaken) {
        return NextResponse.json({ error: "SKU sudah digunakan" }, { status: 409 });
      }
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.sku) updateData.sku = body.sku;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.costPrice !== undefined) updateData.costPrice = parseFloat(body.costPrice);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.minStock !== undefined) updateData.minStock = parseInt(body.minStock);
    if (body.unit) updateData.unit = body.unit;
    if (body.status) updateData.status = body.status;
    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId && body.categoryId !== "none" ? body.categoryId : null;
    }
    updateData.updatedById = session.user?.id;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
