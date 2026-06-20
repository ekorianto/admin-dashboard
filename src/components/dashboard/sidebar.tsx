"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useState } from "react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const stockfgNav = [
  { name: "StockFG Dash", href: "/dashboard/stockfg/dashboard", icon: LayoutDashboard },
  { name: "Stock FG", href: "/dashboard/stockfg/stock-fg", icon: Package },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ user, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-sidebar-border dark:border-slate-700 px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight">Admin Panel</span>
        )}
      </div>

      {/* Close button for mobile */}
      {mobileOpen && onMobileClose && (
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center hover:bg-sidebar-accent/80 transition-colors"
        >
          <X className="w-4 h-4 text-sidebar-foreground" />
        </button>
      )}

      {/* Desktop Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-14 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border dark:border-slate-700 items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
      >
        <ChevronLeft className={cn(
          "w-3 h-3 transition-transform",
          collapsed && "rotate-180"
        )} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {/* Main Menu */}
        {!collapsed && <div className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 px-3 pb-1 pt-2">Main Menu</div>}
        {mainNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobileOpen && onMobileClose?.()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-blue-500/10"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
              )} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* StockFG Menu */}
        {!collapsed && <div className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 px-3 pb-1 pt-4">StockFG Pro</div>}
        {stockfgNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobileOpen && onMobileClose?.()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-blue-500/10"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
              )} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={cn(
        "border-t border-sidebar-border dark:border-slate-700 p-4",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {user?.name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.role || "Staff"}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-2 mt-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden flex flex-col bg-sidebar dark:bg-slate-900 text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar dark:bg-slate-950 text-sidebar-foreground relative transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
