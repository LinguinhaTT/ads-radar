"use client";
import { useState, useEffect } from "react";
import { Eye, Plus, Trash2, Bell, ExternalLink, AlertCircle } from "lucide-react";

interface Monitor {
  id: string;
  pageId: string;
  pageName: string;
  active: boolean;
  lastCheck?: string;
  createdAt: string;
  alerts: { id: string; adId: string; adDataJson: { snapshotUrl?: string; titulo?: string }; seen: boolean; createdAt: string }[];
}

export default function SpyPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [pageId, setPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function fetchMonitors() {
    setLoading(true);
    const res = await fetch("/api/spy");
    const data = await res.json();
    setMonitors(data.monitors ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchMonitors(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!pageId.trim()) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/spy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: pageId.trim(), pageName: pageName.trim() || pageId.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao adicionar monitor");
    } else {
      setPageId("");
      setPageName("");
      fetchMonitors();
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await fetch("/api/spy", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setMonitors(m => m.filter(x => x.id !== id));
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Spy de concorrentes</h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Monitore páginas do Facebook e veja todos os anúncios ativos
        </p>
      </div>

      {/* Add form */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>Adicionar monitor</h2>
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input
            value={pageId} onChange={e => setPageId(e.target.value)}
            placeholder="ID da página (ex: 123456789)"
            className="flex-1 min-w-48 px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
          <input
            value={pageName} onChange={e => setPageName(e.target.value)}
            placeholder="Nome da página (opcional)"
            className="flex-1 min-w-48 px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
          <button type="submit" disabled={adding || !pageId.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
            style={{ background: "var(--color-primary)" }}>
            <Plus size={15} />
            {adding ? "Adicionando..." : "Adicionar"}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: "var(--color-danger)" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <p className="text-xs mt-3" style={{ color: "var(--color-muted)" }}>
          Como encontrar o ID da página: acesse a página no Facebook → About → clique em &quot;Page Transparency&quot; → o ID aparece lá. Ou use ferramentas como findmyfbid.com
        </p>
      </div>

      {/* Monitors list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--color-card)" }} />)}
        </div>
      ) : monitors.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
          <Eye size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum monitor configurado</p>
          <p className="text-xs mt-1">Adicione o ID de uma página para começar a monitorar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {monitors.map(m => (
            <div key={m.id} className="rounded-xl border p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ec489918" }}>
                    <Eye size={18} style={{ color: "#ec4899" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{m.pageName}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      ID: {m.pageId} · desde {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.alerts.length > 0 && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: "#f59e0b18", color: "#f59e0b" }}>
                      <Bell size={11} />
                      {m.alerts.length} novo{m.alerts.length > 1 ? "s" : ""}
                    </span>
                  )}
                  <button onClick={() => handleDelete(m.id)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: "var(--color-muted)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {m.alerts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>Anúncios detectados:</p>
                  {m.alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: "var(--color-surface)" }}>
                      <span className="text-xs" style={{ color: "var(--color-text)" }}>
                        {alert.adDataJson?.titulo ?? `Ad #${alert.adId}`}
                      </span>
                      {alert.adDataJson?.snapshotUrl && (
                        <a href={alert.adDataJson.snapshotUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                          Ver <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
