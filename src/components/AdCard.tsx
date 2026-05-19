"use client";
import { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, Clock, TrendingUp } from "lucide-react";
import type { FbAd } from "@/lib/facebook";

interface Props {
  ad: FbAd;
  isFavorited?: boolean;
  onFavorite?: (ad: FbAd) => void;
}

export default function AdCard({ ad, isFavorited = false, onFavorite }: Props) {
  const [saved, setSaved] = useState(isFavorited);
  const [saving, setSaving] = useState(false);

  async function handleFavorite() {
    setSaving(true);
    if (saved) {
      await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: ad.id }) });
      setSaved(false);
    } else {
      await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: ad.id, adData: ad }) });
      setSaved(true);
      onFavorite?.(ad);
    }
    setSaving(false);
  }

  const scaleBadge =
    ad.ativoHaDias >= 180 ? { label: "🔥 Alta escala", color: "#f59e0b", bg: "#f59e0b18" } :
    ad.ativoHaDias >= 90  ? { label: "⚡ Em escala",  color: "#6366f1", bg: "#6366f118" } :
                            { label: "✓ Escalando",   color: "#22c55e", bg: "#22c55e18" };

  return (
    <div className="rounded-xl border p-5 flex flex-col gap-3 transition-all hover:border-indigo-500/40"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "var(--color-primary)" }}>
              {ad.pagina?.[0]?.toUpperCase()}
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{ad.pagina}</span>
          </div>
          {ad.titulo && (
            <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text)" }}>{ad.titulo}</p>
          )}
        </div>
        <button onClick={handleFavorite} disabled={saving}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: saved ? "#f59e0b" : "var(--color-muted)" }}>
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Body text */}
      {ad.texto && (
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--color-muted)" }}>
          {ad.texto}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ color: scaleBadge.color, background: scaleBadge.bg }}>
          <Clock size={11} />
          {scaleBadge.label} — {ad.ativoHaDias}d
        </span>

        {ad.impressoes?.lower_bound && (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
            <TrendingUp size={11} />
            {Number(ad.impressoes.lower_bound).toLocaleString("pt-BR")}+ impr.
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "var(--color-border)" }}>
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          Desde {ad.inicio ? new Date(ad.inicio).toLocaleDateString("pt-BR") : "—"}
        </span>
        {ad.snapshotUrl && (
          <a href={ad.snapshotUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--color-primary)" }}>
            Ver anúncio <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
