"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: ReactNode;
  trend?: number;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200",
          iconBg
        )}>
          <div className={cn("w-6 h-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={cn(
            "text-sm font-medium",
            trend >= 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-400">vs bulan lalu</span>
        </div>
      )}
    </div>
  );
}
