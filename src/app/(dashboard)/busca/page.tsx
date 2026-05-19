"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react";
import AdCard from "@/components/AdCard";
import type { FbAd } from "@/lib/facebook";

const COUNTRIES = [
  { code: "BR", label: "Brasil" }, { code: "US", label: "EUA" },
  { code: "PT", label: "Portugal" }, { code: "AR", label: "Argentina" },
  { code: "MX", label: "México" }, { code: "CO", label: "Colômbia" },
];

export default function BuscaPage() {
  const [term, setTerm] = useState("");
  const [country, setCountry] = useState("BR");
  const [minDays, setMinDays] = useState(30);
  const [ads, setAds] = useState<FbAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    setError("");
    setAds([]);

    const res = await fetch(`/api/facebook/search?term=${encodeURIComponent(term)}&country=${country}&minDays=${minDays}`);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Erro ao buscar anúncios");
    } else {
      setAds(data.ads);
      setSearched(true);
    }
    setLoading(false);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Busca de ofertas</h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Encontre anúncios escalados pelo nome do produto ou marca
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
            <input
              value={term} onChange={e => setTerm(e.target.value)}
              placeholder="Ex: suplemento, emagrecimento, curso de inglês..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              background: showFilters ? "var(--color-primary-light)" : "var(--color-card)",
              borderColor: showFilters ? "var(--color-primary)" : "var(--color-border)",
              color: showFilters ? "var(--color-primary)" : "var(--color-muted)",
            }}>
            <SlidersHorizontal size={15} />
            Filtros
          </button>
          <button type="submit" disabled={loading || !term.trim()}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-opacity"
            style={{ background: "var(--color-primary)" }}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 rounded-xl border flex flex-wrap gap-6" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>País</label>
              <div className="flex gap-2 flex-wrap">
                {COUNTRIES.map(c => (
                  <button key={c.code} type="button" onClick={() => setCountry(c.code)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      background: country === c.code ? "var(--color-primary-light)" : "transparent",
                      borderColor: country === c.code ? "var(--color-primary)" : "var(--color-border)",
                      color: country === c.code ? "var(--color-primary)" : "var(--color-muted)",
                    }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                Mínimo de dias ativo: <strong style={{ color: "var(--color-text)" }}>{minDays}d</strong>
              </label>
              <input type="range" min={7} max={365} step={7} value={minDays} onChange={e => setMinDays(Number(e.target.value))}
                className="w-48 accent-indigo-500" />
            </div>
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border flex items-start gap-3"
          style={{ background: "#ef444410", borderColor: "#ef444430", color: "var(--color-danger)" }}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border h-48 animate-pulse" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />
          ))}
        </div>
      )}

      {!loading && searched && ads.length === 0 && (
        <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum anúncio escalado encontrado para <strong>&quot;{term}&quot;</strong></p>
          <p className="text-xs mt-1">Tente reduzir o mínimo de dias ou mudar o termo</p>
        </div>
      )}

      {!loading && ads.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
              <strong style={{ color: "var(--color-text)" }}>{ads.length}</strong> anúncios escalados encontrados · ordenados por tempo ativo
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        </>
      )}

      {!searched && !loading && (
        <div className="text-center py-20" style={{ color: "var(--color-muted)" }}>
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">Digite um termo acima para começar a minerar</p>
          <p className="text-xs mt-1">Ex: &quot;emagrecimento&quot;, &quot;renda extra&quot;, &quot;skin care&quot;</p>
        </div>
      )}
    </div>
  );
}
