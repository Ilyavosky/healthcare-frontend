import { cn } from "@/lib/cn";
import { NIVELES } from "@/lib/triage";
import type { Patient } from "../types";
import { LevelBadge } from "./LevelBadge";

const COLS = "grid grid-cols-[40px_1fr_110px_90px_90px] items-center gap-3";

export function PatientTable({ patients }: { patients: Patient[] }) {
  return (
    <div className="px-5 pb-2 pt-4">
      <div className={cn(COLS, "px-3 pb-2 text-xs text-muted")}>
        <span>#</span>
        <span>Paciente</span>
        <span>Nivel</span>
        <span>Espera (W)</span>
        <span>Consulta (d)</span>
      </div>
      <ul className="space-y-2">
        {patients.map((p, i) => (
          <li
            key={p.id}
            className={cn(COLS, "relative overflow-hidden rounded-[10px] border border-border bg-surface py-3 pl-4 pr-3")}
          >
            <span className={cn("absolute inset-y-0 left-0 w-1", NIVELES[p.nivel].bar)} />
            <span className="text-[13px] text-muted">{i + 1}</span>
            <span>
              <span className="block text-sm font-semibold text-text">{p.nombre}</span>
            </span>
            <span>
              <LevelBadge nivel={p.nivel} />
            </span>
            <span className="text-[13px] text-muted">{p.espera} min</span>
            <span className="text-[13px] text-muted">{p.duracion} min</span>
          </li>
        ))}
      </ul>
    </div>
  );
}