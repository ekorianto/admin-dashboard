"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  AlertTriangle,
  Scan,
  Download,
  Send,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import type { ProductWithCategory } from "@/types";

interface ProductTableProps {
  products: ProductWithCategory[];
  onDelete?: (id: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningProduct, setScanningProduct] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sendingSlack, setSendingSlack] = useState(false);
  const [sendingTrello, setSendingTrello] = useState(false);
  const [sendingSheets, setSendingSheets] = useState(false);
  const perPage = 8;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesStock =
      stockFilter === "all" ? true :
      stockFilter === "low" ? p.stock <= p.minStock :
      stockFilter === "out" ? p.stock === 0 :
      true;

    return matchesSearch && matchesStock;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  async function handleScanResult(decodedText: string) {
    setScanningProduct(true);
    setScannerOpen(false);

    try {
      // First try to find product in local data
      const localMatch = products.find(
        (p) =>
          p.sku.toLowerCase() === decodedText.toLowerCase() ||
          p.barcode?.toLowerCase() === decodedText.toLowerCase()
      );

      if (localMatch) {
        toast({
          title: "Produk ditemukan!",
          description: `${localMatch.name} (${localMatch.sku})`,
          variant: "success",
        });
        // Scroll to and highlight the product (set search to match)
        setSearch(localMatch.sku);
        setPage(1);
        return;
      }

      // Try API search
      const res = await fetch(`/api/products/sby-barcode?q=${encodeURIComponent(decodedText)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          toast({
            title: "Produk ditemukan!",
            description: `${data.product.name} (${data.product.sku})`,
            variant: "success",
          });
          setSearch(data.product.sku);
          setPage(1);
          return;
        }
      }

      // Product not found
      toast({
        title: "Produk tidak ditemukan",
        description: `Kode "${decodedText}" tidak cocok dengan produk manapun`,
        variant: "destructive",
      });
      // Set search text to the scanned value so user can see it
      setSearch(decodedText);
    } catch {
      toast({
        title: "Error",
        description: "Gagal mencari produk",
        variant: "destructive",
      });
    } finally {
      setScanningProduct(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setScannerOpen(true)}
              className="gap-2 flex-shrink-0"
              title="Scan Barcode / QR"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scan</span>
            </Button>
          </div>
          <div className="flex gap-2">
            {/* Export CSV */}
            <Button
              variant="outline"
              onClick={async () => {
                setExporting(true);
                try {
                  const res = await fetch("/api/export/products");
                  if (!res.ok) throw new Error();
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `produk_${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: "Export berhasil", description: "File CSV terdownload" });
                } catch {
                  toast({ title: "Export gagal", variant: "destructive" });
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="gap-2"
              title="Download CSV"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            {/* Slack Notification */}
            <Button
              variant="outline"
              disabled={sendingSlack}
              onClick={async () => {
                setSendingSlack(true);
                try {
                  const lowStockItems = products.filter(p => p.stock <= p.minStock);
                  for (const item of lowStockItems.slice(0, 5)) {
                    await fetch("/api/integrations/slack", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "stock",
                        data: {
                          productName: item.name,
                          sku: item.sku,
                          stock: item.stock,
                          minStock: item.minStock,
                        },
                      }),
                    });
                  }
                  toast({ title: "Notifikasi terkirim! ✅", description: `${Math.min(lowStockItems.length, 5)} produk low-stok dikirim ke Slack` });
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
                  const lowStockItems = products.filter(p => p.stock <= p.minStock);
                  for (const item of lowStockItems.slice(0, 3)) {
                    await fetch("/api/integrations/trello", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "restock",
                        data: {
                          productName: item.name,
                          sku: item.sku,
                          stock: item.stock,
                          minStock: item.minStock,
                        },
                      }),
                    });
                  }
                  toast({ title: "Kartu Trello dibuat! 📋", description: `${Math.min(lowStockItems.length, 3)} kartu restock dibuat` });
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
                    body: JSON.stringify({ type: "products" }),
                  });
                  const data = await res.json();
                  if (data.ok) {
                    toast({ title: "Export ke Google Sheets berhasil! ✅", description: `${products.length} produk diexport` });
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
            <Button onClick={() => router.push("/dashboard/products/new")} className="gap-2">
              <PackagePlus className="w-4 h-4" />
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* Stock filters */}
        <div className="flex gap-2">
          <button
            onClick={() => { setStockFilter("all"); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              stockFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Semua ({products.length})
          </button>
          <button
            onClick={() => { setStockFilter("low"); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5",
              stockFilter === "low" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            Stok Menipis ({lowStockCount})
          </button>
          <button
            onClick={() => { setStockFilter("out"); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              stockFilter === "out" ? "bg-red-500 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"
            )}
          >
            Stok Habis ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  Tidak ada produk ditemukan
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((product) => {
                const isLowStock = product.stock <= product.minStock && product.stock > 0;
                const isOutOfStock = product.stock === 0;

                return (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onMouseEnter={() => setSelectedId(product.id)}
                    onMouseLeave={() => setSelectedId(null)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                          📦
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.unit}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{product.category?.name || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-slate-900"
                        )}>
                          {product.stock}
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        product.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                        product.status === "INACTIVE" ? "bg-slate-100 text-slate-600" :
                        product.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {product.status === "ACTIVE" ? "Aktif" :
                         product.status === "INACTIVE" ? "Nonaktif" :
                         product.status === "OUT_OF_STOCK" ? "Stok Habis" : "Dihentikan"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        "flex items-center justify-end gap-1 transition-opacity",
                        selectedId === product.id ? "opacity-100" : "opacity-0"
                      )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/products/${product.id}`)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(product.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
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

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
        title="Scan Barcode Produk"
      />

      {/* Scanning loading overlay */}
      {scanningProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Mencari produk...</span>
          </div>
        </div>
      )}
    </div>
  );
}
