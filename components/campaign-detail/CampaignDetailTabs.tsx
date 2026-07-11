"use client";

import { VISIBLE_CAMPAIGN_DETAIL_TABS, CampaignDetailTab } from "@/lib/campaignMetrics";

interface Props {
  activeTab: CampaignDetailTab;
  onTabChange: (tab: CampaignDetailTab) => void;
}

export default function CampaignDetailTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-ink-600/10">
      <nav className="-mb-px flex flex-wrap gap-1" aria-label="Campaign detail tabs">
        {VISIBLE_CAMPAIGN_DETAIL_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
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
