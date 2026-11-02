"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  "aria-label"?: string;
};

export function NumberStepper({ value, onChange, min = 0, max = Infinity, step = 1, unit, ...rest }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const btn = "flex h-full w-10 cursor-pointer items-center justify-center text-navy hover:bg-[#F1F2F4]";

  return (
    <div className="flex h-11 overflow-hidden rounded-[10px] border border-border bg-surface">
      <button type="button" className={btn} aria-label="Restar" onClick={() => onChange(clamp(value - step))}>
        <Minus size={16} />
      </button>
      <div className="flex flex-1 items-center justify-center gap-1 border-x border-border">
        <input
          type="number"
          value={Number.isNaN(value) ? "" : value}
          min={min}
          max={Number.isFinite(max) ? max : undefined}
          aria-label={rest["aria-label"]}
          onChange={(e) => onChange(e.target.value === "" ? NaN : clamp(Number(e.target.value)))}
          className="w-12 bg-transparent text-center text-[15px] font-semibold text-navy outline-none"
        />
        {unit && <span className="text-[13px] text-muted">{unit}</span>}
      </div>
      <button type="button" className={btn} aria-label="Sumar" onClick={() => onChange(clamp(value + step))}>
        <Plus size={16} />
      </button>
    </div>
  );
}