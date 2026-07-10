export default function Header() {
  return (
    <header className="bg-ink text-paper">
      <div className="mx-auto max-w-[1180px] px-6 py-5 flex items-center justify-between">
        <div>
          <div className="eyebrow text-signal">Wheeler Adconnect</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Budget &amp; Delivery Report</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-paper/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          LIVE FROM API
        </div>
      </div>
    </header>
  );
}
