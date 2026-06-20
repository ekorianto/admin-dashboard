import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const safeProduct = {
    ...product,
    price: Number(product.price),
    costPrice: Number(product.costPrice),
  };

  return <ProductForm product={safeProduct as any} categories={categories} mode="edit" />;
}
