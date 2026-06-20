"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { ProductWithCategory } from "@/types";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: ProductWithCategory | null;
  categories?: Category[];
  mode: "create" | "edit";
}

export function ProductForm({ product, categories = [], mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    costPrice: product?.costPrice?.toString() || "",
    stock: product?.stock?.toString() || "0",
    minStock: product?.minStock?.toString() || "0",
    unit: product?.unit || "pcs",
    categoryId: product?.category?.id || "",
    status: product?.status || "ACTIVE",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          costPrice: parseFloat(form.costPrice) || 0,
          stock: parseInt(form.stock) || 0,
          minStock: parseInt(form.minStock) || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan produk");
      }

      toast({
        title: mode === "create" ? "Produk berhasil dibuat" : "Produk berhasil diperbarui",
        variant: "success",
      });

      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-10 w-10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
          </h2>
          <p className="text-sm text-slate-500">
            {mode === "create" ? "Isi data produk baru" : "Perbarui data produk"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama produk"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              placeholder="ELC-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Harga Jual (Rp)</Label>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Harga Modal (Rp)</Label>
            <Input
              id="costPrice"
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStock">Min. Stok</Label>
            <Input
              id="minStock"
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Satuan</Label>
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">Pcs</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="liter">Liter</SelectItem>
                <SelectItem value="meter">Meter</SelectItem>
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="rim">Rim</SelectItem>
                <SelectItem value="botol">Botol</SelectItem>
                <SelectItem value="kaleng">Kaleng</SelectItem>
                <SelectItem value="karung">Karung</SelectItem>
                <SelectItem value="pasang">Pasang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                <SelectItem value="DISCONTINUED">Dihentikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi produk..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === "create" ? "Simpan Produk" : "Perbarui Produk"}
          </Button>
        </div>
      </form>
    </div>
  );
}
