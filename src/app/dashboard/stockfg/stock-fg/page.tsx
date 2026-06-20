"use client";

import { useState, useEffect } from "react";
import { Package, Search, AlertTriangle, Receipt, TrendingUp, RefreshCw, AlertCircle, Inbox, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function StockFGPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  async function loadData(type: string = "fg", filterVal: string = "all") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stockfg/stock?type=${type}&filter=${filterVal}`);
      if (!res.ok) {
        const errData = await res.json();
        if (errData.setup) { setSetupNeeded(true); setError(errData.message); return; }
        setError(errData.error || "Gagal memuat data");
        return;
      }
      const d = await res.json();
      setData(d || []);
      setSetupNeeded(false);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData("fg", filter);
  }, [filter]);

  const filtered = data.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(r.Produk || "").toLowerCase().includes(q) ||
      String(r.ARTICLE || r.Article || "").toLowerCase().includes(q) ||
      String(r["No SPK"] || "").toLowerCase().includes(q) ||
      String(r["PO KRISBOW"] || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleExport = () => {
    if (!filtered.length) { toast({ title: "Tidak ada data", variant: "destructive" }); return; }
    const headers = ["Tanggal", "Produk", "Article", "Qty Rel", "No SPK", "PO KRISBOW"];
    const rows = filtered.map((r: any) => [
      r.Tanggal || "", r.Produk || "", r.ARTICLE || r.Article || "",
      r["Qty rel"] || "", r["No SPK"] || "", r["PO KRISBOW"] || ""
    ]);
    const csv = [headers.join(","), ...rows.map((row: string[]) => row.map(c => `"${String(c||"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `stock_fg_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "CSV berhasil diunduh" });
  };

  const filterBtns = [
    { id: "all", label: "Semua", icon: Package },
    { id: "low", label: "Low Stock", icon: AlertTriangle },
    { id: "nospk", label: "Tanpa SPK", icon: Receipt },
    { id: "forecast", label: "Forecast", icon: TrendingUp },
  ];

  if (setupNeeded) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />
        <p className="text-slate-500 text-sm mb-4 text-center max-w-md">{error}</p>
        <Button onClick={() => window.open("/dashboard/settings", "_self")} className="gap-2">Buka Settings</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Stock FG</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Finished Goods - {data.length} item</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadData("fg", filter)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {filterBtns.map((btn) => (
          <button
            key={btn.id}
            onClick={() => { setFilter(btn.id); setPage(1); setSearch(""); }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === btn.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <btn.icon className="w-3.5 h-3.5" />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari produk, article, No SPK..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">Produk</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">Article</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">Qty Rel</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">Qty PO</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">No SPK</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase">PO Krisbow</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {search ? "Tidak ada data yang cocok" : "Belum ada data"}
                  </td>
                </tr>
              ) : (
                paginated.map((r: any, i: number) => {
                  const qtyRel = parseFloat(r["Qty rel"] || r._qtyRel || 0);
                  const isLow = qtyRel > 0 && qtyRel <= 10;
                  return (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs">{r.Tanggal || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{r.Produk || "-"}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {r.ARTICLE || r.Article || "-"}
                        </code>
                      </td>
                      <td className={cn("px-4 py-3 text-right font-semibold", isLow ? "text-red-600" : "text-slate-900 dark:text-slate-100")}>
                        {qtyRel || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{r["Qty PO"] || "-"}</td>
                      <td className="px-4 py-3">
                        {r["No SPK"] ? (
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {r["No SPK"]}
                          </code>
                        ) : (
                          <span className="text-xs text-amber-500 italic">Belum ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          String(r["PO KRISBOW"] || "").toUpperCase() === "FORECAST"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {r["PO KRISBOW"] || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              {filtered.length} data - Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
