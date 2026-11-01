"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  "aria-label": string;
};

export function CompactStepper({ value, onChange, min = 0, max = 999, step = 1, unit, ...rest }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const btn =
    "flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-bg text-navy hover:bg-border/60";

  return (
    <div className="flex h-11 items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5">
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        aria-label={rest["aria-label"]}
        onChange={(e) => onChange(e.target.value === "" ? NaN : clamp(Number(e.target.value)))}
        className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-navy outline-none"
      />
      {unit && <span className="text-[13px] text-muted">{unit}</span>}
      <button type="button" aria-label="Restar" className={btn} onClick={() => onChange(clamp((Number.isNaN(value) ? min : value) - step))}>
        <Minus size={14} />
      </button>
      <button type="button" aria-label="Sumar" className={btn} onClick={() => onChange(clamp((Number.isNaN(value) ? min : value) + step))}>
        <Plus size={14} />
      </button>
    </div>
  );
}