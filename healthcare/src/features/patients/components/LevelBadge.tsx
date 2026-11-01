import { Check, CircleAlert, Clock, HeartPulse } from "lucide-react";
import { cn } from "@/lib/cn";
import { NIVELES, type Nivel } from "@/lib/triage";

const ICONOS = { 1: HeartPulse, 2: CircleAlert, 3: Clock, 4: Check, 5: Clock } as const;

type Props = {
  nivel: Nivel;
  withName?: boolean;
  className?: string;
};

export function LevelBadge({ nivel, withName, className }: Props) {
  const n = NIVELES[nivel];
  const Icon = ICONOS[nivel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-[4px] text-xs font-semibold leading-none",
        n.badge,
        className,
      )}
    >
      <Icon size={13} strokeWidth={2.5} />
      {withName ? `${n.id} · ${n.nombre}` : n.id}
    </span>
  );
}