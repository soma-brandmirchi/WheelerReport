import SignalBars from "./SignalBars";

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  signal?: number; // 0-1, renders the signal-bars meter if provided
}

export default function KpiCard({ label, value, sublabel, signal }: KpiCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {signal !== undefined && <SignalBars value={signal} />}
      </div>
      <div className="font-display text-3xl font-semibold text-ink leading-none">{value}</div>
      {sublabel && <div className="text-sm text-slate-line">{sublabel}</div>}
    </div>
  );
}
