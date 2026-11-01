"use client";

import { cn } from "@/lib/cn";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label": string;
};

export function Switch({ checked, onChange, ...rest }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest["aria-label"]}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-[42px] shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-ok" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}