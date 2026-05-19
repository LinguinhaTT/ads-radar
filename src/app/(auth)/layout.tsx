export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--color-primary)" }}>A</div>
            <span className="text-xl font-bold" style={{ color: "var(--color-text)" }}>AdsRadar</span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Spy de anúncios escalados no Facebook</p>
        </div>
        {children}
      </div>
    </div>
  );
}
