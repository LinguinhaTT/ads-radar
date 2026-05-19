"use client";
import { useEffect, useState } from "react";
import { History, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SearchRecord {
  id: string;
  term: string;
  country: string;
  minDays: number;
  totalFound: number;
  createdAt: string;
}

export default function HistoricoPage() {
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/searches")
      .then(r => r.json())
      .then(d => { setSearches(d.searches ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Histórico</h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Todas as buscas que você realizou</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--color-card)" }} />)}
        </div>
      ) : searches.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
          <History size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma busca realizada ainda</p>
          <Link href="/dashboard/busca" className="inline-flex items-center gap-1 text-sm mt-2 font-medium"
            style={{ color: "var(--color-primary)" }}>
            Fazer primeira busca <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", background: "var(--color-surface)" }}>
            <span>Termo buscado</span>
            <span>País</span>
            <span>Resultados</span>
            <span>Data</span>
          </div>
          {searches.map((s, i) => (
            <Link key={s.id} href={`/dashboard/busca?term=${encodeURIComponent(s.term)}`}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center border-b last:border-b-0 transition-colors hover:bg-white/3"
              style={{ borderColor: "var(--color-border)", background: i % 2 === 0 ? "var(--color-card)" : "var(--color-surface)" }}>
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text)" }}>
                <Search size={13} style={{ color: "var(--color-muted)" }} />
                {s.term}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: "var(--color-border)", color: "var(--color-muted)" }}>
                {s.country}
              </span>
              <span className="text-sm font-semibold" style={{ color: s.totalFound > 0 ? "var(--color-success)" : "var(--color-muted)" }}>
                {s.totalFound}
              </span>
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {new Date(s.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
