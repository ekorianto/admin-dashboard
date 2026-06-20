import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
    SUSPENDED: "bg-red-50 text-red-600 border-red-200",
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    PROCESSING: "bg-blue-50 text-blue-600 border-blue-200",
    SHIPPED: "bg-purple-50 text-purple-600 border-purple-200",
    DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
    OUT_OF_STOCK: "bg-orange-50 text-orange-600 border-orange-200",
    DISCONTINUED: "bg-red-50 text-red-600 border-red-200",
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
    STAFF: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-600 border-gray-200";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
    SUSPENDED: "Ditangguhkan",
    PENDING: "Menunggu",
    PROCESSING: "Diproses",
    SHIPPED: "Dikirim",
    DELIVERED: "Selesai",
    CANCELLED: "Dibatalkan",
    OUT_OF_STOCK: "Stok Habis",
    DISCONTINUED: "Dihentikan",
    ADMIN: "Admin",
    MANAGER: "Manajer",
    STAFF: "Staf",
  };
  return labels[status] || status;
}
