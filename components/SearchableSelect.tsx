"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

export interface SearchableOption {
  value: string;
  label: string;
}

interface Props {
  id?: string;
  value: string;
  options: SearchableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  id,
  value,
  options,
  onChange,
  placeholder = "Search…",
  allLabel = "All",
  className = "",
  disabled = false,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selectedLabel = useMemo(() => {
    if (!value) return allLabel;
    return options.find((o) => o.value === value)?.label ?? value;
  }, [value, options, allLabel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter(
          (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
        )
      : options;
    return [{ value: "", label: allLabel }, ...list];
  }, [options, query, allLabel]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlight(0);
      // Focus search field when opened
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) pick(item.value);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="flex h-9 w-full min-w-[180px] items-center justify-between gap-2 rounded-md border border-ink-600/15 bg-white px-2.5 text-left text-sm text-ink focus:border-signal disabled:opacity-50"
      >
        <span className={`truncate ${value ? "text-ink" : "text-slate-line"}`}>{selectedLabel}</span>
        <svg
          aria-hidden
          className={`h-3.5 w-3.5 shrink-0 text-slate-line transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-md border border-ink-600/15 bg-white shadow-lg">
          <div className="border-b border-ink-600/10 p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder={placeholder}
              className="h-8 w-full rounded border border-ink-600/15 bg-paper/50 px-2 text-sm text-ink focus:border-signal"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-line">No matches</li>
            ) : (
              filtered.map((opt, i) => {
                const selected = opt.value === value;
                const active = i === highlight;
                return (
                  <li key={`${opt.value || "__all"}-${i}`} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={`flex w-full items-center px-3 py-1.5 text-left text-sm ${
                        active ? "bg-teal/10 text-ink" : "text-ink-700 hover:bg-ink-600/[0.04]"
                      } ${selected ? "font-medium text-ink" : ""}`}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => pick(opt.value)}
                    >
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
