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
  UserPlus,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { formatDateShort, getStatusColor, getStatusLabel, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import type { UserWithCounts } from "@/types";

interface UserTableProps {
  users: UserWithCounts[];
  onDelete?: (id: string) => void;
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sendingSheets, setSendingSheets] = useState(false);
  const perPage = 8;

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.position?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  const res = await fetch("/api/export/users");
                  if (!res.ok) throw new Error();
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
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
                    body: JSON.stringify({ type: "users" }),
                  });
                  const data = await res.json();
                  if (data.ok) {
                    toast({ title: "Export ke Google Sheets berhasil! ✅", description: `${users.length} user diexport` });
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
            <Button onClick={() => router.push("/dashboard/users/new")} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Tambah User
            </Button>
          </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  Tidak ada user ditemukan
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onMouseEnter={() => setSelectedUser(user.id)}
                  onMouseLeave={() => setSelectedUser(null)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : user.role === "MANAGER" ? "info" : "secondary"}>
                      {getStatusLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      getStatusColor(user.status)
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user.status === "ACTIVE" ? "bg-emerald-500" :
                        user.status === "INACTIVE" ? "bg-gray-400" : "bg-red-500"
                      )} />
                      {getStatusLabel(user.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{user.department || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500">{formatDateShort(user.joinDate)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      "flex items-center justify-end gap-1 transition-opacity",
                      selectedUser === user.id ? "opacity-100" : "opacity-0"
                    )}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/users/${user.id}`)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.role !== "ADMIN" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleting === user.id}
                          onClick={async () => {
                            setDeleting(user.id);
                            try {
                              const res = await fetch(`/api/users/${user.id}`, {
                                method: "DELETE",
                              });
                              if (!res.ok) throw new Error();
                              router.refresh();
                            } catch {
                              // ignore
                            } finally {
                              setDeleting(null);
                            }
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="icon"
                onClick={() => setPage(p)}
                className="h-8 w-8"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
