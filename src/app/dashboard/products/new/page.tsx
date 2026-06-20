import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/product-form";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return <ProductForm mode="create" categories={categories} />;
}
