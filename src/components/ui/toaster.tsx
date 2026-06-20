"use client";

import { useToast } from "@/components/ui/use-toast";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
  warning: AlertTriangle,
};

const colorMap = {
  default: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  destructive: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const iconColorMap = {
  default: "text-blue-500",
  success: "text-emerald-500",
  destructive: "text-red-500",
  warning: "text-amber-500",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const variant = toast.variant || "default";
        const Icon = iconMap[variant as keyof typeof iconMap] || Info;
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-4 fade-in duration-300",
              colorMap[variant as keyof typeof colorMap] || colorMap.default
            )}
          >
            <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColorMap[variant as keyof typeof iconColorMap])} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-sm font-semibold">{toast.title}</p>
              )}
              {toast.description && (
                <p className="text-sm opacity-80 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
