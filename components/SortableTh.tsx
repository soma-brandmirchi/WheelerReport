"use client";

import { TableSort } from "@/lib/sort";

interface Props {
  label: string;
  column: string;
  sort: TableSort;
  onSort: (column: string) => void;
  align?: "left" | "right";
}

export default function SortableTh({ label, column, sort, onSort, align = "left" }: Props) {
  const active = sort.column === column;
  const indicator = active ? (sort.direction === "asc" ? " ↑" : " ↓") : "";

  return (
    <th className={`px-5 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSort(column);
        }}
        className={`eyebrow font-normal inline-flex items-center gap-0.5 cursor-pointer select-none hover:text-ink transition-colors ${
          active ? "text-ink" : "text-slate-line"
        } ${align === "right" ? "float-right" : ""}`}
      >
        <span>{label}</span>
        <span className="ticker text-[10px] leading-none" aria-hidden>
          {indicator || " ↕"}
        </span>
      </button>
    </th>
  );
}
