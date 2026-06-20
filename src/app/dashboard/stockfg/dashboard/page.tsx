"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Package, Warehouse, TrendingUp, AlertTriangle, Receipt, Clock,
  CheckCircle, RefreshCw, AlertCircle, Inbox, Activity,
  LayoutDashboard, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#f97316"];

interface DashboardData {
  stats: {
    totalFG: number; totalSFG: number; totalForecastCount: number; totalForecastQty: number;
    lowFG: number; lowSFG: number; noSpkFG: number; noSpkQtyRel: number;
    lemburToday: number; co1fToday: number; threshold: number;
  };
  chartFG: { label: string; value: number }[];
  alerts: { type: string; cat: string; msg: string; page: string }[];
  activity: { time: string; type: string; icon: string; text: string }[];
}

export default function StockFGDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stockfg/dashboard?mode=full");
      if (!res.ok) {
        const errData = await res.json();
        if (errData.setup) {
          setSetupNeeded(true);
          setError(errData.message);
        } else {
          setError(errData.error || "Gagal memuat data");
        }
        return;
      }
      const d = await res.json();
      setData(d);
      setSetupNeeded(false);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center animate-pulse" />
          <div>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (setupNeeded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Setup Google Sheets</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Untuk mengakses data dari Google Sheets StockFG Pro, kamu perlu setup:
        </p>
        <ol className="text-left text-sm text-slate-600 dark:text-slate-300 space-y-3 mb-6">
          <li className="flex gap-2"><span className="font-bold text-blue-500">1.</span> Buka CMD, jalankan: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">npm install googleapis</code></li>
          <li className="flex gap-2"><span className="font-bold text-blue-500">2.</span> Buat Service Account di Google Cloud Console</li>
          <li className="flex gap-2"><span className="font-bold text-blue-500">3.</span> Share spreadsheet dengan email service account</li>
          <li className="flex gap-2"><span className="font-bold text-blue-500">4.</span> Set variabel di file .env</li>
        </ol>
        <Button onClick={() => window.open("/dashboard/settings", "_self")} className="gap-2">
          <ExternalLink className="w-4 h-4" /> Buka Settings
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-slate-500 text-sm mb-4">{error}</p>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Inbox className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500">Tidak ada data. Klik Refresh untuk memuat.</p>
        <Button onClick={loadData} className="mt-4 gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dashboard StockFG</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan stok & aktivitas operasional</p>
          </div>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total FG" value={s.totalFG} icon={Package} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total SFG" value={s.totalSFG} icon={Warehouse} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Forecast Qty" value={s.totalForecastQty} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" sub={`${s.totalForecastCount} item`} />
        <StatCard label="Low Stock FG" value={s.lowFG} icon={AlertTriangle} color={s.lowFG > 0 ? "text-red-600" : "text-emerald-600"} bg={s.lowFG > 0 ? "bg-red-50" : "bg-emerald-50"} sub={`≤ ${s.threshold} qty`} />
        <StatCard label="Low Stock SFG" value={s.lowSFG} icon={AlertTriangle} color={s.lowSFG > 0 ? "text-amber-600" : "text-emerald-600"} bg={s.lowSFG > 0 ? "bg-amber-50" : "bg-emerald-50"} sub={`≤ ${s.threshold} qty`} />
        <StatCard label="No SPK (FG)" value={s.noSpkFG} icon={Receipt} color={s.noSpkFG > 0 ? "text-amber-600" : "text-emerald-600"} bg={s.noSpkFG > 0 ? "bg-amber-50" : "bg-emerald-50"} sub={`${s.noSpkQtyRel} pcs`} />
        <StatCard label="Lembur Hari Ini" value={`${s.lemburToday}j`} icon={Clock} color="text-sky-600" bg="bg-sky-50" />
        <StatCard label="Co1F Hari Ini" value={s.co1fToday} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FG per Produk Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Stock FG per Produk</h3>
          {data.chartFG.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.chartFG} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
              Belum ada data chart
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Alerts & Peringatan
          </h3>
          {data.alerts.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {data.alerts.map((a, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-3 p-3 rounded-lg text-sm",
                  a.type === "danger" ? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20" :
                  "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20"
                )}>
                  <AlertCircle className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    a.type === "danger" ? "text-red-500" : "text-amber-500"
                  )} />
                  <div>
                    <span className={cn(
                      "text-xs font-semibold px-1.5 py-0.5 rounded",
                      a.type === "danger" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>{a.cat}</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{a.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
              Semua dalam kondisi normal ✅
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" /> Aktivitas Terbaru
        </h3>
        {data.activity.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data.activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="text-lg">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{a.text}</p>
                  <p className="text-xs text-slate-400">{a.time}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {a.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100px] text-slate-400 text-sm">
            Belum ada aktivitas
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; bg: string; sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bg)}>
          <Icon className={cn("w-4.5 h-4.5", color)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
