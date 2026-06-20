"use client";

import { cn } from "@/lib/utils";
import { Package, Users, ShoppingCart, AlertTriangle, ArrowUpRight } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "order",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-100",
    title: "Pesanan baru #ORD-2025-006",
    description: "oleh Ahmad Fauzi",
    time: "2 menit yang lalu",
  },
  {
    id: 2,
    type: "product",
    icon: Package,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    title: "Stok produk Monitor LED diperbarui",
    description: "Penambahan 10 unit",
    time: "15 menit yang lalu",
  },
  {
    id: 3,
    type: "user",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100",
    title: "User baru terdaftar",
    description: "Dewi Lestari - Staff Keuangan",
    time: "1 jam yang lalu",
  },
  {
    id: 4,
    type: "alert",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    title: "Stok menipis",
    description: "Lemari Arsip hanya tersisa 8 unit",
    time: "2 jam yang lalu",
  },
  {
    id: 5,
    type: "order",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-100",
    title: "Pesanan #ORD-2025-003 diproses",
    description: "oleh Rudi Hartono",
    time: "3 jam yang lalu",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h3>
          <p className="text-sm text-slate-500">Riwayat aktivitas hari ini</p>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
          Lihat semua
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", activity.bg)}>
              <activity.icon className={cn("w-5 h-5", activity.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{activity.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
