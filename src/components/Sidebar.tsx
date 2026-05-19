"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Search, Eye, History, Bookmark,
  LogOut, ChevronRight, Zap
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard",          label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/busca",    label: "Busca",        icon: Search },
  { href: "/dashboard/spy",      label: "Spy",          icon: Eye },
  { href: "/dashboard/historico",label: "Histórico",    icon: History },
  { href: "/dashboard/favoritos",label: "Favoritos",    icon: Bookmark },
];

const PLAN_BADGE: Record<string, string> = {
  FREE:       "bg-slate-700 text-slate-300",
  PRO:        "bg-indigo-600/30 text-indigo-300",
  ENTERPRISE: "bg-amber-600/30 text-amber-300",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex flex-col w-60 min-h-screen border-r" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
          style={{ background: "var(--color-primary)" }}>A</div>
        <span className="font-bold text-lg" style={{ color: "var(--color-text)" }}>AdsRadar</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "text-white"
                  : "hover:bg-white/5"
              )}
              style={active ? { background: "var(--color-primary)", color: "white" } : { color: "var(--color-muted)" }}
            >
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 space-y-2">
        {session?.user.plan !== "ENTERPRISE" && (
          <Link href="/register"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
          >
            <Zap size={13} />
            Fazer upgrade
          </Link>
        )}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "var(--color-primary)" }}>
            {session?.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--color-text)" }}>{session?.user.name}</p>
            <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase", PLAN_BADGE[session?.user.plan ?? "FREE"])}>
              {session?.user.plan ?? "FREE"}
            </span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="opacity-40 hover:opacity-100 transition-opacity">
            <LogOut size={14} style={{ color: "var(--color-muted)" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
