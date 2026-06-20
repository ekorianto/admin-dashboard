"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Settings, Send, Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface EnvStatus {
  slack: boolean;
  trello: boolean;
  sheets: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchEnvStatus();
    }
  }, [status]);

  async function fetchEnvStatus() {
    try {
      const [slackRes, trelloRes, sheetsRes] = await Promise.all([
        fetch("/api/integrations/slack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "test" }),
        }),
        fetch("/api/integrations/trello", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "test" }),
        }),
        fetch("/api/integrations/sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "test" }),
        }),
      ]);

      const slackResult = await slackRes.json();
      const trelloResult = await trelloRes.json();
      const sheetsResult = await sheetsRes.json();

      setEnvStatus({
        slack: slackResult.ok === true,
        trello: trelloResult.ok === true,
        sheets: sheetsResult.ok === true,
      });
    } catch {
      // Silent fail
    } finally {
      setChecking(false);
    }
  }

  async function testIntegration(type: string) {
    setTesting(type);
    try {
      const endpoint = type === "slack" ? "/api/integrations/slack"
        : type === "trello" ? "/api/integrations/trello"
        : "/api/integrations/sheets";

      const body = type === "sheets"
        ? JSON.stringify({ type: "products" })
        : JSON.stringify({ type: "test" });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();

      if (data.ok) {
        toast({ title: `${type.toUpperCase()} berhasil! ✅`, description: "Integrasi berfungsi dengan baik" });
        fetchEnvStatus();
      } else {
        toast({ title: `${type.toUpperCase()} gagal`, description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: `Gagal test ${type}`, variant: "destructive" });
    } finally {
      setTesting(null);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied!", description: "Teks sudah dicopy" });
  }

  if (status === "loading" || checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!session) redirect("/login");

  const integrations = [
    {
      id: "slack",
      name: "Slack Notifications",
      icon: Send,
      description: "Kirim notifikasi otomatis ke channel Slack saat ada order baru, stok menipis, atau user baru.",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      status: envStatus?.slack,
      setupGuide: [
        { label: "1. Buat Slack App", desc: "Buka api.slack.com/apps → Create New App → From scratch", link: "https://api.slack.com/apps" },
        { label: "2. Aktifkan Webhooks", desc: "Incoming Webhooks → Activate Incoming Webhooks → Add New Webhook" },
        { label: "3. Pilih channel", desc: "Pilih channel Slack tujuan notifikasi → Install → Copy Webhook URL" },
        { label: "4. Set .env", desc: "Tambah SLACK_WEBHOOK_URL di file .env", envKey: "SLACK_WEBHOOK_URL", envExample: "https://hooks.slack.com/services/xxx/xxx/xxx" },
      ],
    },
    {
      id: "trello",
      name: "Trello Cards",
      icon: FileSpreadsheet,
      description: "Buat kartu Trello otomatis untuk order baru dan produk yang perlu di-restock.",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      status: envStatus?.trello,
      setupGuide: [
        { label: "1. Dapatkan API Key", desc: "Buka trello.com/power-ups/admin → Buat integrasi → Copy API Key", link: "https://trello.com/power-ups/admin" },
        { label: "2. Generate Token", desc: "Klik 'Generate Token' di halaman yang sama → Copy Token" },
        { label: "3. Cari Board & List ID", desc: "Buka board Trello → URL mengandung board ID. Gunakan API untuk list ID." },
        { label: "4. Set .env", desc: "Tambah variabel di file .env", envKey: "TRELLO_KEY, TRELLO_TOKEN, TRELLO_LIST_ID", envExample: "TRELLO_KEY=your_key\nTRELLO_TOKEN=your_token\nTRELLO_LIST_ID=your_list_id" },
      ],
    },
    {
      id: "sheets",
      name: "Google Sheets",
      icon: Upload,
      description: "Export data produk, order, dan user otomatis ke Google Sheets.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      status: envStatus?.sheets,
      setupGuide: [
        { label: "1. Buat Google Cloud Project", desc: "Buka console.cloud.google.com → Buat project baru", link: "https://console.cloud.google.com" },
        { label: "2. Enable Google Sheets API", desc: "Library → Cari 'Google Sheets API' → Enable" },
        { label: "3. Buat Service Account", desc: "Credentials → Create Credentials → Service Account → JSON key" },
        { label: "4. Share spreadsheet", desc: "Buat Google Sheet → Share dengan email service account (client_email)" },
        { label: "5. Install package", desc: "Jalankan: npm install googleapis", envKey: "npm install googleapis" },
        { label: "6. Set .env", desc: "Tambah variabel di file .env", envKey: "GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_SPREADSHEET_ID" },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Atur integrasi dengan layanan eksternal</p>
        </div>
      </div>

      {/* Integrations */}
      <div className="space-y-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isActive = integration.status === true;
          const isInactive = integration.status === false;

          return (
            <div key={integration.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="p-6 flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", integration.bgColor)}>
                  <Icon className={cn("w-6 h-6", integration.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{integration.name}</h3>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Terhubung
                      </span>
                    )}
                    {isInactive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <XCircle className="w-3 h-3" /> Belum diatur
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{integration.description}</p>
                </div>
              </div>

              {/* Setup Guide */}
              <div className="px-6 pb-6">
                <details className="group">
                  <summary className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700">
                    <span>📖 Panduan Setup</span>
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 space-y-3 pl-2">
                    {integration.setupGuide.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <span className="text-xs font-mono text-slate-400 mt-0.5 w-4">{step.label.charAt(0)}</span>
                        <div className="flex-1">
                          <p className="text-slate-700 dark:text-slate-300">{step.desc}</p>
                          {step.link && (
                            <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mt-1 text-xs">
                              Buka link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {step.envKey && (
                            <div className="mt-2 flex items-center gap-2">
                              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1 break-all">
                                {step.envExample || step.envKey}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={() => copyToClipboard(step.envExample || step.envKey, `${integration.id}-${idx}`)}
                              >
                                {copiedIndex === `${integration.id}-${idx}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  variant={isActive ? "outline" : "default"}
                  onClick={() => testIntegration(integration.id)}
                  disabled={testing === integration.id}
                  className="gap-2"
                >
                  {testing === integration.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isActive ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {testing === integration.id ? "Testing..." : isActive ? "Test Ulang" : "Test Koneksi"}
                </Button>
                {isActive && (
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      let endpoint: string;
                      let body: string;

                      if (integration.id === "sheets") {
                        endpoint = "/api/integrations/sheets";
                        body = JSON.stringify({ type: "demo" });
                      } else {
                        endpoint = integration.id === "slack" ? "/api/integrations/slack" : "/api/integrations/trello";
                        body = JSON.stringify({
                          type: "order",
                          data: {
                            orderNumber: "TEST-001",
                            total: 500000,
                            customerName: "Test User",
                          },
                        });
                      }

                      await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body,
                      }).then(r => r.json()).then(data => {
                        if (data.ok) {
                          toast({ title: "Demo berhasil!", description: "Contoh data terkirim" });
                        } else {
                          toast({ title: "Error", description: data.error, variant: "destructive" });
                        }
                      });
                    }}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Demo
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Env File Note */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">Cara mengatur file .env</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300">
              <li>Buka file <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">admin-dashboard/.env</code> di notepad/text editor</li>
              <li>Tambah baris sesuai panduan di atas untuk setiap layanan</li>
              <li>Simpan file (Ctrl+S)</li>
              <li>Restart server: <strong>Ctrl+C</strong> di CMD, lalu <strong>npm run dev</strong></li>
              <li>Kembali ke halaman ini dan klik <strong>Test Koneksi</strong></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
