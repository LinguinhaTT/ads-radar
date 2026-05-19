"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANS = [
  { key: "FREE",       label: "Free",       price: "Grátis",   features: ["10 buscas/dia", "2 monitores"] },
  { key: "PRO",        label: "Pro",        price: "R$ 97/mês", features: ["100 buscas/dia", "10 monitores"] },
  { key: "ENTERPRISE", label: "Enterprise", price: "R$ 297/mês",features: ["Ilimitado", "Monitores ilimitados"] },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<"FREE" | "PRO" | "ENTERPRISE">("FREE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, plan }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao criar conta");
      setLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="rounded-2xl p-8 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Criar conta</h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>Comece a spiar anúncios agora</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "var(--color-danger)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: "var(--color-muted)" }}>Nome</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: "var(--color-muted)" }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: "var(--color-muted)" }}>Senha</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>

        <div>
          <label className="block text-sm mb-2 font-medium" style={{ color: "var(--color-muted)" }}>Plano</label>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map(p => (
              <button key={p.key} type="button" onClick={() => setPlan(p.key)}
                className="p-3 rounded-lg border text-left transition-all"
                style={{
                  background: plan === p.key ? "var(--color-primary-light)" : "var(--color-card)",
                  borderColor: plan === p.key ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                <div className="text-xs font-bold mb-0.5" style={{ color: plan === p.key ? "var(--color-primary)" : "var(--color-text)" }}>
                  {p.label}
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-text)" }}>{p.price}</div>
                {p.features.map(f => (
                  <div key={f} className="text-xs" style={{ color: "var(--color-muted)" }}>{f}</div>
                ))}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "var(--color-muted)" }}>
        Já tem conta?{" "}
        <Link href="/login" className="font-medium" style={{ color: "var(--color-primary)" }}>Entrar</Link>
      </p>
    </div>
  );
}
