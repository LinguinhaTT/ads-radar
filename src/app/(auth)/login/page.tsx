"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email ou senha inválidos");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="rounded-2xl p-8 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Entrar</h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>Acesse sua conta AdsRadar</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "var(--color-danger)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: "var(--color-muted)" }}>Email</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={{ color: "var(--color-muted)" }}>Senha</label>
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "var(--color-muted)" }}>
        Não tem conta?{" "}
        <Link href="/register" className="font-medium" style={{ color: "var(--color-primary)" }}>
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
