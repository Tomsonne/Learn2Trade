// src/components/Sidebar.jsx — super slim 160px
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, TrendingUp, History, Newspaper } from "lucide-react";

/** Sidebar, slim (160px)*/
const DEFAULT_ITEMS = [
  { label: "Dashboard", to: "/dashboard",        icon: LayoutDashboard },
  { label: "Learn",     to: "/learn",   icon: BookOpen },
  { label: "Trades",    to: "/trades",  icon: TrendingUp },
  { label: "History",   to: "/history", icon: History },
  { label: "News",      to: "/news",    icon: Newspaper },
];

function SidebarItem({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-5 transition ${
        active
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-slate-100"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function SidebarLayout({ items = DEFAULT_ITEMS, children }) {
  const location = useLocation();
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <div className="min-h-full grid grid-cols-[160px_minmax(0,1fr)] bg-white dark:bg-gray-900">
      <aside className="min-h-full border-r border-slate-200 dark:border-gray-700 p-3">
        {/* menu */}
        <nav className="space-y-0.5">
          {items.map((it) => (
            <SidebarItem
              key={it.to}
              to={it.to}
              label={it.label}
              icon={it.icon}
              active={isActive(it.to)}
            />
          ))}
        </nav>

        <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Learn2Trade
        </div>
      </aside>

      <main className="p-5 overflow-y-auto text-slate-900 dark:text-slate-100">
        {children}
      </main>
    </div>
  );
}
