interface SignalBarsProps {
  /** 0 to 1 */
  value: number;
  bars?: number;
  className?: string;
}

// A small "signal strength" meter — a nod to the broadcast/CTV inventory
// this dashboard reports on. Reused wherever a proportion needs a quick
// glance rather than a full chart (KPI cards, table rows).
export default function SignalBars({ value, bars = 5, className = "" }: SignalBarsProps) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const lit = Math.round(clamped * bars);

  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const isLit = i < lit;
        const height = 6 + i * 4; // ascending bar heights
        return (
          <span
            key={i}
            style={{ height }}
            className={`w-[4px] rounded-[1px] transition-colors ${
              isLit ? "bg-signal" : "bg-ink-600/15"
            }`}
          />
        );
      })}
    </div>
  );
}
