"use client";

import { GeographyView } from "@/lib/campaignMetrics";

const GEOGRAPHY_SUB_TABS: { id: GeographyView; label: string }[] = [
  { id: "zip", label: "Zip Code" },
  { id: "city", label: "City" },
];

interface Props {
  activeView: GeographyView;
  onViewChange: (view: GeographyView) => void;
}

export default function CampaignGeographySubTabs({ activeView, onViewChange }: Props) {
  return (
    <div className="border-b border-ink-600/10">
      <nav className="-mb-px flex flex-wrap gap-1" aria-label="Geography sub-tabs">
        {GEOGRAPHY_SUB_TABS.map((tab) => {
          const active = tab.id === activeView;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                active
                  ? "border-signal text-ink"
                  : "border-transparent text-slate-line hover:text-ink hover:border-ink-600/20"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
