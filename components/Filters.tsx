"use client";

import type { ReactNode } from "react";
import SearchableSelect from "./SearchableSelect";

export interface FilterState {
  campaignId: string; // exact match via campaign_ids; "" = all
  campaignIdPrefix: string;
  campaignName: string;
  clientName: string;
  campaignType: string;
  startFromDate: string;
  endToDate: string;
  // Delivery-only filters
  dma: string;
  city: string;
  appName: string;
  strategy: string;
  deviceType: string;
}

export const EMPTY_FILTERS: FilterState = {
  campaignId: "",
  campaignIdPrefix: "",
  campaignName: "",
  clientName: "",
  campaignType: "",
  startFromDate: "",
  endToDate: "",
  dma: "",
  city: "",
  appName: "",
  strategy: "",
  deviceType: "",
};

const CAMPAIGN_TYPES = [
  { value: "OTT", label: "OTT" },
  { value: "CTV", label: "CTV" },
  { value: "Display", label: "Display" },
  { value: "Video", label: "Video" },
];

const DEVICE_TYPES = [
  { value: "Connected TV", label: "Connected TV" },
  { value: "Mobile", label: "Mobile" },
  { value: "Desktop", label: "Desktop" },
  { value: "Tablet", label: "Tablet" },
];

interface FiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  campaignIds: string[];
  loading?: boolean;
}

const inputClass =
  "h-9 rounded-md border border-ink-600/15 bg-white px-2.5 text-sm text-ink focus:border-signal";

export default function Filters({ value, onChange, campaignIds, loading }: FiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });
  const hasAdvanced =
    value.campaignIdPrefix ||
    value.campaignName ||
    value.campaignType ||
    value.dma ||
    value.city ||
    value.appName ||
    value.strategy ||
    value.deviceType;

  const campaignOptions = campaignIds.map((id) => ({ value: id, label: id }));

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Campaign ID" htmlFor="campaign">
          <SearchableSelect
            id="campaign"
            className="min-w-[240px]"
            value={value.campaignId}
            options={campaignOptions}
            onChange={(campaignId) => set({ campaignId })}
            allLabel="All campaigns"
            placeholder="Search campaign ID…"
          />
        </Field>

        <Field label="Client name contains" htmlFor="client">
          <input
            id="client"
            type="text"
            placeholder="e.g. Zoomers"
            className={`${inputClass} w-[180px]`}
            value={value.clientName}
            onChange={(e) => set({ clientName: e.target.value })}
          />
        </Field>

        <Field label="Start from" htmlFor="from">
          <input
            id="from"
            type="date"
            className={inputClass}
            value={value.startFromDate}
            onChange={(e) => set({ startFromDate: e.target.value })}
          />
        </Field>

        <Field label="End to" htmlFor="to">
          <input
            id="to"
            type="date"
            className={inputClass}
            value={value.endToDate}
            onChange={(e) => set({ endToDate: e.target.value })}
          />
        </Field>

        <div className="flex items-center gap-3 pb-0.5">
          {loading && <span className="text-xs text-slate-line ticker">refreshing…</span>}
          {(hasAdvanced ||
            value.campaignId ||
            value.clientName ||
            value.startFromDate ||
            value.endToDate) && (
            <button
              type="button"
              className="text-sm font-medium text-teal hover:underline"
              onClick={() => onChange({ ...EMPTY_FILTERS })}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-ink-600/10 pt-4">
        <div className="eyebrow mb-3">More filters</div>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Campaign ID prefix" htmlFor="prefix">
            <input
              id="prefix"
              type="text"
              placeholder="e.g. JUL26"
              className={`${inputClass} w-[140px]`}
              value={value.campaignIdPrefix}
              onChange={(e) => set({ campaignIdPrefix: e.target.value })}
            />
          </Field>

          <Field label="Campaign name contains" htmlFor="campaign-name">
            <input
              id="campaign-name"
              type="text"
              placeholder="e.g. SouthWest"
              className={`${inputClass} w-[180px]`}
              value={value.campaignName}
              onChange={(e) => set({ campaignName: e.target.value })}
            />
          </Field>

          <Field label="Campaign type" htmlFor="type">
            <SearchableSelect
              id="type"
              className="min-w-[140px]"
              value={value.campaignType}
              options={CAMPAIGN_TYPES}
              onChange={(campaignType) => set({ campaignType })}
              allLabel="All types"
              placeholder="Search type…"
            />
          </Field>

          <Field label="DMA contains" htmlFor="dma">
            <input
              id="dma"
              type="text"
              placeholder="e.g. Dallas"
              className={`${inputClass} w-[160px]`}
              value={value.dma}
              onChange={(e) => set({ dma: e.target.value })}
            />
          </Field>

          <Field label="City contains" htmlFor="city">
            <input
              id="city"
              type="text"
              placeholder="e.g. Azle"
              className={`${inputClass} w-[140px]`}
              value={value.city}
              onChange={(e) => set({ city: e.target.value })}
            />
          </Field>

          <Field label="App name contains" htmlFor="app">
            <input
              id="app"
              type="text"
              placeholder="e.g. Fox News"
              className={`${inputClass} w-[160px]`}
              value={value.appName}
              onChange={(e) => set({ appName: e.target.value })}
            />
          </Field>

          <Field label="Strategy contains" htmlFor="strategy">
            <input
              id="strategy"
              type="text"
              placeholder="e.g. News"
              className={`${inputClass} w-[160px]`}
              value={value.strategy}
              onChange={(e) => set({ strategy: e.target.value })}
            />
          </Field>

          <Field label="Device type" htmlFor="device">
            <SearchableSelect
              id="device"
              className="min-w-[160px]"
              value={value.deviceType}
              options={DEVICE_TYPES}
              onChange={(deviceType) => set({ deviceType })}
              allLabel="All devices"
              placeholder="Search device…"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="eyebrow" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
