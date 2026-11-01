"use client";

import { cn } from "@/lib/cn";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  fullWidth?: boolean;
};

export function SegmentedControl<T extends string>({ options, value, onChange, fullWidth }: Props<T>) {
  return (
    <div
      className={cn(
        fullWidth ? "flex w-full" : "inline-flex",
        "rounded-[10px] bg-[#F1F2F4] p-[3px]",
      )}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-4 py-[8px]",
              fullWidth && "flex-1",
              "text-[13px] font-semibold transition-colors cursor-pointer",
              active
                ? "bg-surface text-navy shadow-[0_1px_2px_rgba(30,58,95,0.12)]"
                : "text-muted hover:text-navy",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}