"use client";

interface Props {
  label?: string;
  /** When true, covers the full viewport. Otherwise fills its parent. */
  fullscreen?: boolean;
}

export default function PageLoader({ label = "Loading report data…", fullscreen = false }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-paper/80 backdrop-blur-[2px]"
          : "absolute inset-0 z-20 flex items-center justify-center rounded-card bg-paper/75 backdrop-blur-[1px]"
      }
    >
      <div className="flex flex-col items-center gap-4 px-6 py-5">
        <div className="relative h-11 w-11">
          <span className="absolute inset-0 rounded-full border-2 border-ink-600/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-signal border-r-teal" />
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-ink">{label}</p>
          <p className="mt-1 text-xs text-slate-line ticker">fetching budget &amp; delivery</p>
        </div>
      </div>
    </div>
  );
}
