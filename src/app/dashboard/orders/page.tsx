"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {  ShoppingCart, Download, Send, FileSpreadsheet, Loader2, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  notes: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [sendingSlack, setSendingSlack] = useState(false);
  const [sendingTrello, setSendingTrello] = useState(false);
  const [sendingSheets, setSendingSheets] = useState(false);
  const perPage = 10;

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Memuat data order...</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      SHIPPING: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-slate-100 text-slate-600";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Pending",
      PROCESSING: "Diproses",
      SHIPPING: "Dikirim",
      COMPLETED: "Selesai",
      CANCELLED: "Dibatalkan",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manajemen Pesanan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{orders.length} pesanan</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari pesanan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {/* Export CSV */}
              <Button
                variant="outline"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  try {
                    const res = await fetch("/api/export/orders");
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `order_${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: "Export berhasil", description: "File CSV terdownload" });
                  } catch {
                    toast({ title: "Export gagal", variant: "destructive" });
                  } finally {
                    setExporting(false);
                  }
                }}
                className="gap-2"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              {/* Slack */}
              <Button
                variant="outline"
                disabled={sendingSlack}
                onClick={async () => {
                  setSendingSlack(true);
                  try {
                    for (const order of paginated.slice(0, 5)) {
                      await fetch("/api/integrations/slack", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "order",
                          data: {
                            orderNumber: order.orderNumber,
                            total: order.total,
                            customerName: order.user?.name,
                          },
                        }),
                      });
                    }
                    toast({ title: "Notifikasi terkirim! ✅", description: `${Math.min(paginated.length, 5)} order dikirim ke Slack` });
                  } catch {
                    toast({ title: "Gagal kirim notifikasi", variant: "destructive" });
                  } finally {
                    setSendingSlack(false);
                  }
                }}
                className="gap-2"
              >
                {sendingSlack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Slack</span>
              </Button>
              {/* Trello */}
              <Button
                variant="outline"
                disabled={sendingTrello}
                onClick={async () => {
                  setSendingTrello(true);
                  try {
                    for (const order of paginated.slice(0, 3)) {
                      await fetch("/api/integrations/trello", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "order",
                          data: {
                            orderNumber: order.orderNumber,
                            total: order.total,
                            customerName: order.user?.name,
                          },
                        }),
                      });
                    }
                    toast({ title: "Kartu Trello dibuat! 📋", description: `${Math.min(paginated.length, 3)} kartu order dibuat` });
                  } catch {
                    toast({ title: "Gagal buat kartu Trello", variant: "destructive" });
                  } finally {
                    setSendingTrello(false);
                  }
                }}
                className="gap-2"
              >
                {sendingTrello ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Trello</span>
              </Button>
              {/* Google Sheets */}
              <Button
                variant="outline"
                disabled={sendingSheets}
                onClick={async () => {
                  setSendingSheets(true);
                  try {
                    const res = await fetch("/api/integrations/sheets", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "orders" }),
                    });
                    const data = await res.json();
                    if (data.ok) {
                      toast({ title: "Export ke Google Sheets berhasil! ✅", description: `${orders.length} order diexport` });
                    } else {
                      toast({ title: "Export gagal", description: data.error || "Unknown error", variant: "destructive" });
                    }
                  } catch {
                    toast({ title: "Export gagal", description: "Gagal terhubung ke server", variant: "destructive" });
                  } finally {
                    setSendingSheets(false);
                  }
                }}
                className="gap-2"
              >
                {sendingSheets ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span className="hidden sm:inline">Sheets</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Order</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    {search ? "Tidak ada pesanan ditemukan" : "Belum ada pesanan"}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300">{order.user?.name || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">{order.items.length} item</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Rp {(order.total || 0).toLocaleString("id-ID")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Menampilkan {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={page === p ? "default" : "outline"} size="icon" onClick={() => setPage(p)} className="h-8 w-8">{p}</Button>
              ))}
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2">
        💡 Tombol Slack/Trello mengirimkan data ke layanan yang terintegrasi. Atur di <button onClick={() => router.push("/dashboard/settings")} className="text-blue-500 hover:underline">Settings &gt; Integrations</button>
      </div>
    </div>
  );
}
