"use client";

import { Bell, Search, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Header({ user, onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <Menu className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        )}

        {/* Search */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Cari sesuatu..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
          <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 lg:pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.role || "Staff"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
