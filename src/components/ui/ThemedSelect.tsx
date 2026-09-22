"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface ThemedSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ThemedSelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  options: ThemedSelectOption[];
  placeholder?: string;
  /** Classes for the visible trigger button. Defaults match the site's".contact-input" field look. */
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const DEFAULT_TRIGGER =
"w-full flex items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-sm text-left transition-all" +
"bg-[#F8FAFC] dark:bg-white/5 border-[#E2E8F0] dark:border-white/10 text-[#0F172A] dark:text-white" +
"hover:border-brand-blue/40 dark:hover:border-brand-yellow/40" +
"focus:outline-none focus:border-brand-blue dark:focus:border-brand-yellow focus:ring-4 focus:ring-brand-blue/10 dark:focus:ring-brand-yellow/10";

/**
 * Fully custom dropdown - the popup list is our own themed markup, not the browser's
 * native OS-styled <select> menu. Drop-in for a native <select>: same name/value/onChange
 * shape, so it also submits correctly inside a plain <form> via FormData (a hidden native
 * select mirrors the value, invisible, for that purpose only).
 */
export default function ThemedSelect({
  name,
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  required,
  disabled,
  id,
  onFocus,
  onBlur,
}: ThemedSelectProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value! : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const listboxId = `themed-select-list-${reactId}`;

  const selected = options.find((o) => o.value === current);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key ==="Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, options.findIndex((o) => o.value === current)));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (val: string) => {
    if (!isControlled) setInternal(val);
    onChange?.({ target: { name, value: val } });
    setOpen(false);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt && !opt.disabled) commit(opt.value);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Hidden native select: carries no visible/interactive UI, exists only so a plain
          <form> (FormData-based submit) still sees this field under `name`. */}
      {name && (
        <select
          name={name}
          value={current}
          onChange={() => {}}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`${DEFAULT_TRIGGER} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      >
        <span className={selected ? "" : "text-brand-zinc-400 dark:text-zinc-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-brand-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          ref={listRef}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#12121e] p-1.5 shadow-[0_20px_50px_rgba(3,6,172,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {options.map((o, i) => {
            const isSelected = o.value === current;
            const isActive = i === activeIndex;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={o.disabled}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => !o.disabled && commit(o.value)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                  o.disabled
                    ? "text-brand-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                    : isSelected
                      ? "bg-brand-blue text-white dark:bg-brand-yellow dark:text-brand-dark font-semibold"
                      : isActive
                        ? "bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-dark dark:text-white"
                        : "text-brand-dark dark:text-white hover:bg-brand-blue/10 dark:hover:bg-brand-yellow/10"
                }`}
              >
                <span>{o.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
