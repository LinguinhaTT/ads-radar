"use client";
import { useEffect, useState } from "react";
import { Bookmark, Trash2, ExternalLink, FolderOpen } from "lucide-react";
import type { FbAd } from "@/lib/facebook";

interface FavoriteRecord {
  id: string;
  adId: string;
  collection: string;
  createdAt: string;
  adDataJson: FbAd;
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState("Todos");

  useEffect(() => {
    fetch("/api/favorites")
      .then(r => r.json())
      .then(d => { setFavorites(d.favorites ?? []); setLoading(false); });
  }, []);

  async function handleRemove(adId: string) {
    await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId }) });
    setFavorites(f => f.filter(x => x.adId !== adId));
  }

  const collections = ["Todos", ...Array.from(new Set(favorites.map(f => f.collection)))];
  const filtered = activeCollection === "Todos" ? favorites : favorites.filter(f => f.collection === activeCollection);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Favoritos</h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Anúncios salvos para referência</p>
      </div>

      {/* Collections filter */}
      {collections.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {collections.map(c => (
            <button key={c} onClick={() => setActiveCollection(c)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background: activeCollection === c ? "var(--color-primary-light)" : "transparent",
                borderColor: activeCollection === c ? "var(--color-primary)" : "var(--color-border)",
                color: activeCollection === c ? "var(--color-primary)" : "var(--color-muted)",
              }}>
              {c} {c !== "Todos" && `(${favorites.filter(f => f.collection === c).length})`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "var(--color-card)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
          <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum favorito salvo</p>
          <p className="text-xs mt-1">Clique no ícone de favorito em qualquer anúncio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(fav => {
            const ad = fav.adDataJson;
            return (
              <div key={fav.id} className="rounded-xl border p-5 flex flex-col gap-3"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "var(--color-primary)" }}>
                        {ad?.pagina?.[0]?.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{ad?.pagina}</span>
                    </div>
                    {ad?.titulo && <p className="text-sm" style={{ color: "var(--color-text)" }}>{ad.titulo}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                      style={{ background: "var(--color-border)", color: "var(--color-muted)" }}>
                      <FolderOpen size={10} />
                      {fav.collection}
                    </span>
                    <button onClick={() => handleRemove(fav.adId)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      style={{ color: "var(--color-muted)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {ad?.texto && (
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--color-muted)" }}>{ad.texto}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t mt-auto" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {ad?.ativoHaDias}d ativo
                  </span>
                  {ad?.snapshotUrl && (
                    <a href={ad.snapshotUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                      Ver <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
