import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/products/product-table";
import { Package } from "lucide-react";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manajemen Produk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{products.length} produk terdaftar</p>
        </div>
      </div>

      <ProductTable products={safeProducts as any} />
    </div>
  );
}
