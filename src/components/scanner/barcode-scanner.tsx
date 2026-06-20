"use client";

import { useEffect, useRef, useState } from "react";
import { X, Scan, Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  title?: string;
}

export function BarcodeScanner({ open, onClose, onScan, title = "Scan Barcode / QR" }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startScanner = async () => {
    setError(null);
    setResult(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("scanner-container");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          // Success callback
          setResult(decodedText);
          setCameraActive(false);
          scanner.stop().catch(() => {});
        },
        () => {
          // Ignore intermediate results
        }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      
      if (err?.toString?.()?.includes("NotAllowedError") || err?.toString?.()?.includes("Permission")) {
        setError("Izin kamera ditolak. Harap izinkan akses kamera di browser.");
      } else if (err?.toString?.()?.includes("NotFoundError")) {
        setError("Kamera tidak ditemukan di perangkat ini.");
      } else {
        setError("Tidak dapat mengakses kamera. Pastikan browser mendukung kamera.");
      }
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const handleUseResult = () => {
    if (result) {
      onScan(result);
      handleClose();
    }
  };

  const handleClose = () => {
    stopScanner();
    setError(null);
    setResult(null);
    onClose();
  };

  const handleRetry = () => {
    stopScanner();
    setTimeout(() => startScanner(), 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, []);

  if (!mounted || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <CameraOff className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleClose}>Tutup</Button>
                <Button onClick={handleRetry}>Coba Lagi</Button>
              </div>
            </div>
          ) : result ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                <Scan className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hasil Scan:</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono break-all">
                  {result}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleRetry}>
                  Scan Lagi
                </Button>
                <Button onClick={handleUseResult} className="gap-2">
                  <Scan className="w-4 h-4" />
                  Gunakan Hasil
                </Button>
              </div>
            </div>
          ) : scanning ? (
            <div className="text-center py-4">
              {/* Scanner viewport */}
              <div className="relative mx-auto w-64 h-64 rounded-xl overflow-hidden bg-black border-2 border-blue-500/50 shadow-lg shadow-blue-500/20">
                <div id="scanner-container" className="w-full h-full" />
                {/* Scanning overlay */}
                <div className="absolute inset-0 border-[3px] border-blue-500 rounded-xl pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-blue-400/30 rounded-lg" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Arahkan kamera ke barcode/QR...</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopScanner}
                className="mt-2 text-red-500 hover:text-red-600"
              >
                Batal Scan
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <Camera className="w-9 h-9 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Tekan tombol di bawah untuk mulai scan</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Mendukung: QR Code, Barcode (EAN, UPC, Code128, Code39, dll)
                </p>
              </div>
              <Button onClick={startScanner} size="lg" className="gap-2">
                <Camera className="w-5 h-5" />
                Mulai Scan
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
