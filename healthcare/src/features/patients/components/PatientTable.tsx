import { cn } from "@/lib/cn";
import { NIVELES } from "@/lib/triage";
import type { Estado, PlannedPatient } from "../types";
import { LevelBadge } from "./LevelBadge";

const COLS =
  "grid grid-cols-[28px_minmax(110px,1.4fr)_80px_74px_84px_84px_96px_96px_minmax(100px,1fr)] items-center gap-2";

const HEADERS = ["#", "Paciente", "Nivel", "Espera", "Consulta", "Inicia en", "Sobre límite", "Penalización", "Estado"];

function Dash() {
  return <span className="text-subtle">—</span>;
}

const ESTADOS: Record<Estado, { label: string; className: string }> = {
  "a-tiempo": { label: "A tiempo", className: "text-ok" },
  retraso: { label: "Con retraso", className: "text-n1" },
  "fuera-meta": { label: "Fuera de la meta", className: "text-muted" },
  atendido: { label: "Atendido", className: "text-ok" },
};

function Status({ estado, medico }: { estado?: Estado; medico?: number }) {
  if (!estado) return <Dash />;
  const { label, className } = ESTADOS[estado];
  return (
    <span className="flex flex-col leading-tight">
      <span className={cn("font-medium", className)}>{label}</span>
      {medico !== undefined && <span className="text-[11px] text-muted">Médico {medico}</span>}
    </span>
  );
}

function Min({ value, className }: { value?: number; className?: string }) {
  if (value === undefined) return <Dash />;
  return <span className={className}>{value} min</span>;
}

export function PatientTable({ patients }: { patients: PlannedPatient[] }) {
  return (
    <div className="px-5 pb-2 pt-4">
      <div className={cn(COLS, "px-3 pb-2 text-xs text-muted")}>
        {HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <ul className="space-y-2">
        {patients.map((p, i) => (
          <li
            key={p.id}
            className={cn(COLS, "relative overflow-hidden rounded-[10px] border border-border bg-surface py-3 pl-4 pr-3")}
          >
            <span className={cn("absolute inset-y-0 left-0 w-1", NIVELES[p.nivel].bar)} />
            <span className="text-[13px] text-muted">{i + 1}</span>
            <span className="truncate text-sm font-semibold text-text">{p.nombre}</span>
            <span>
              <LevelBadge nivel={p.nivel} />
            </span>
            <span className="text-[13px] text-muted">{p.espera} min</span>
            <span className="text-[13px] text-muted">{p.duracion} min</span>
            <span className="text-[13px] font-semibold text-text">
              <Min value={p.inicia} />
            </span>
            <span className={cn("text-[13px] font-medium", p.sobreLimite ? "text-n1" : "text-muted")}>
              <Min value={p.sobreLimite} />
            </span>
            <span className="text-sm font-bold text-text">
              {p.penalizacion === undefined ? <Dash /> : p.penalizacion}
            </span>
            <span className="text-xs">
              <Status estado={p.estado} medico={p.medico} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}