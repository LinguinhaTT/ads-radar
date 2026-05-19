import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLAN_LIMITS, PlanKey } from "@/lib/plans";
import { startOfDay } from "date-fns";
import { Search, Eye, Bookmark, History, Zap } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = session.user.id;
  const plan = (session.user.plan ?? "FREE") as PlanKey;
  const limits = PLAN_LIMITS[plan];

  const todayStart = startOfDay(new Date());

  const [searchesToday, totalSearches, totalFavorites, totalMonitors] = await Promise.all([
    db.search.count({ where: { userId, createdAt: { gte: todayStart } } }),
    db.search.count({ where: { userId } }),
    db.favorite.count({ where: { userId } }),
    db.monitor.count({ where: { userId } }),
  ]);

  const recentSearches = await db.search.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, term: true, totalFound: true, createdAt: true },
  });

  const stats = [
    { label: "Buscas hoje", value: searchesToday, limit: limits.searchesPerDay === Infinity ? null : limits.searchesPerDay, icon: Search, color: "#6366f1" },
    { label: "Buscas totais", value: totalSearches, limit: null, icon: History, color: "#22c55e" },
    { label: "Favoritos", value: totalFavorites, limit: null, icon: Bookmark, color: "#f59e0b" },
    { label: "Monitores ativos", value: totalMonitors, limit: limits.monitors === Infinity ? null : limits.monitors, icon: Eye, color: "#ec4899" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
          Olá, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Plano <strong style={{ color: "var(--color-text)" }}>{plan}</strong>
          {limits.searchesPerDay !== Infinity && ` · ${limits.searchesPerDay - searchesToday} buscas restantes hoje`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>{stat.value}</p>
            {stat.limit && (
              <div className="mt-2">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min((stat.value / stat.limit) * 100, 100)}%`, background: stat.color }} />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>de {stat.limit}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/busca"
          className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:border-indigo-500/50"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#6366f120" }}>
            <Search size={22} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Nova busca</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Mine ofertas escaladas pelo nome</p>
          </div>
        </Link>
        <Link href="/dashboard/spy"
          className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:border-pink-500/50"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#ec489920" }}>
            <Eye size={22} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Adicionar monitor</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Espie anúncios de uma página</p>
          </div>
        </Link>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Buscas recentes</h2>
            <Link href="/dashboard/historico" className="text-xs" style={{ color: "var(--color-primary)" }}>Ver todas</Link>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            {recentSearches.map((s, i) => (
              <div key={s.id}
                className="flex items-center justify-between px-5 py-3.5 border-b last:border-b-0"
                style={{ borderColor: "var(--color-border)", background: i % 2 === 0 ? "var(--color-card)" : "var(--color-surface)" }}>
                <div className="flex items-center gap-3">
                  <Search size={13} style={{ color: "var(--color-muted)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{s.term}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>{s.totalFound} resultados</span>
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan === "FREE" && (
        <div className="mt-8 rounded-xl p-5 border flex items-center justify-between gap-4"
          style={{ background: "#6366f108", borderColor: "#6366f130" }}>
          <div className="flex items-center gap-3">
            <Zap size={20} style={{ color: "#6366f1" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Quer mais buscas?</p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Upgrade para Pro e tenha 100 buscas/dia + 10 monitores</p>
            </div>
          </div>
          <Link href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0"
            style={{ background: "var(--color-primary)" }}>
            Fazer upgrade
          </Link>
        </div>
      )}
    </div>
  );
}
