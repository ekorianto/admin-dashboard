import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueAgg,
      allActiveProducts,
      usersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { stock: true, minStock: true },
      }),
      prisma.user.groupBy({ by: ["status"], _count: true }),
    ]);

    const lowStockProducts = allActiveProducts.filter(
      (p) => p.stock <= p.minStock
    ).length;

  const activeUsers = usersByStatus.find((s) => s.status === "ACTIVE")?._count || 0;
  const totalRevenue = revenueAgg._sum.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Selamat datang kembali, {session.user?.name || "User"}! 👋
        </h1>
        <p className="text-slate-500 mt-1">Berikut overview sistem hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total User"
          value={totalUsers.toString()}
          description={`${activeUsers} aktif`}
          icon={<Users className="w-full h-full" />}
          trend={12}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total Produk"
          value={totalProducts.toString()}
          description={`${lowStockProducts} stok menipis`}
          icon={<Package className="w-full h-full" />}
          trend={8}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Total Pesanan"
          value={totalOrders.toString()}
          description="Semua waktu"
          icon={<ShoppingCart className="w-full h-full" />}
          trend={23}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(Number(totalRevenue))}
          description="Pendapatan kotor"
          icon={<DollarSign className="w-full h-full" />}
          trend={15}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{lowStockProducts}</p>
            <p className="text-xs text-slate-500">Produk stok menipis</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalProducts - lowStockProducts}</p>
            <p className="text-xs text-slate-500">Produk stok aman</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalUsers - activeUsers}</p>
            <p className="text-xs text-slate-500">User nonaktif</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
            <p className="text-xs text-slate-500">Total produk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
