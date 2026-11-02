"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/format";
import type { Patient } from "@/features/patients/types";
import { usePatients } from "@/features/patients/store";
import { ejecutarAEstrella } from "@/features/planner/astar";
import { useUi } from "@/features/planner/ui-store";
import { useScenario } from "@/features/scenario/store";
import { construirFotogramas, type Frames } from "../frames";
import { PlaybackControls } from "./PlaybackControls";
import { SearchTreeGraph } from "./SearchTreeGraph";

const RUTAS_VISIBLES = 5;
const DURACION_TOTAL_MS = 24000;

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
      <span className="flex items-center gap-2">
        <span className="size-3.5 rounded-full bg-n2" />
        Nodo expandido (color = nivel del paciente)
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3.5 rounded-full border-2 border-dashed border-n2" />
        En frontera (aún sin expandir)
      </span>
      <span className="flex items-center gap-2">
        <span className="font-bold text-[#c81e1e]">10</span>
        h · lo que se estima que falta
      </span>
      <span className="flex items-center gap-2">
        <span className="font-bold text-[#7c4a1e]">48</span>
        Costo del paso
      </span>
      <span className="flex items-center gap-2">
        <span className="h-[3px] w-6 rounded bg-navy" />
        Ruta óptima
      </span>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-border px-4 py-2.5">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={cn("text-lg font-bold tabular-nums", strong ? "text-navy" : "text-text")}>{value}</p>
    </div>
  );
}

function AnalysisContent() {
  const patients = usePatients((s) => s.patients);
  const attended = useScenario((s) => s.attended);
  const t0 = useScenario((s) => s.t0);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const pendientes = useMemo(() => patients.filter((p) => !attended.includes(p.id)), [patients, attended]);

  const [resultado, setResultado] = useState<{ para: Patient[]; t0: number; datos: Frames } | null>(null);
  useEffect(() => {
    if (pendientes.length === 0) return;
    const id = setTimeout(() => {
      const trace = ejecutarAEstrella(pendientes, t0);
      setResultado({ para: pendientes, t0, datos: construirFotogramas(trace, RUTAS_VISIBLES) });
      setIndex(0);
      setPlaying(true);
    }, 30);
    return () => clearTimeout(id);
  }, [pendientes, t0]);
  const vigente = resultado && resultado.para === pendientes && resultado.t0 === t0;
  const calculando = pendientes.length > 0 && !vigente;
  const busqueda = { n: pendientes.length, datos: vigente ? resultado.datos : null };

  const last = busqueda.datos ? busqueda.datos.frames.length - 1 : 0;

  const frameMs = Math.min(700, Math.max(35, DURACION_TOTAL_MS / (last + 1))) / speed;

  useEffect(() => {
    if (!playing || !busqueda.datos) return;
    const id = setInterval(() => {
      setIndex((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, frameMs);
    return () => clearInterval(id);
  }, [playing, frameMs, busqueda.datos, last]);

  if (busqueda.n === 0) {
    return <p className="py-10 text-center text-sm text-muted">No hay pacientes pendientes que analizar.</p>;
  }
  if (calculando || !busqueda.datos) {
    return <p className="py-10 text-center text-sm text-muted">Calculando la mejor ruta para {busqueda.n} pacientes…</p>;
  }

  const { frames, total, ruta, exacto, cota } = busqueda.datos;
  const frame = frames[Math.min(index, last)];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Nodos expandidos" value={fmt(frame.expandidos)} />
        <Stat label="En frontera" value={fmt(frame.frontera)} />
        <Stat label="Menor f en frontera" value={fmt(frame.minF)} />
        <Stat
          label={frame.done ? "Penalización total" : "Rutas que se muestran"}
          value={frame.done ? fmt(total) : `${RUTAS_VISIBLES} de ${fmt(frame.frontera)}`}
          strong={frame.done}
        />
      </div>

      <PlaybackControls
        index={Math.min(index, last)}
        last={last}
        playing={playing}
        speed={speed}
        onPlayPause={() => {
          if (index >= last) setIndex(0);
          setPlaying((p) => !p || index >= last);
        }}
        onStep={(d) => {
          setPlaying(false);
          setIndex((i) => Math.min(last, Math.max(0, i + d)));
        }}
        onSeek={(i) => {
          setPlaying(false);
          setIndex(i);
        }}
        onRestart={() => {
          setIndex(0);
          setPlaying(true);
        }}
        onSpeed={setSpeed}
      />

      <div className="overflow-x-auto rounded-xl border border-border">
        <SearchTreeGraph
          frame={frame}
          niveles={busqueda.n}
          rutasVisibles={RUTAS_VISIBLES}
          durationMs={playing ? Math.round(Math.min(450, frameMs * 0.9)) : 300}
        />
      </div>

            {frame.done && (
        <div
          role="status"
          className={cn(
            "rounded-xl border-l-4 px-5 py-4 text-[13px]",
            exacto ? "border-blue bg-bluebg" : "border-amber bg-amberbg",
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className={cn("text-[15px] font-bold tracking-tight", exacto ? "text-navy" : "text-amber")}>
              {exacto ? "Ruta óptima encontrada" : "Mejor ruta encontrada (aproximada)"}
            </p>
            <p className="text-muted">
              Penalización total{" "}
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-navy">{fmt(total)}</span>
            </p>
          </div>

          <p className="mt-2 break-words font-mono text-[13px] font-medium leading-relaxed text-navy">
            {ruta.join("  →  ")}
          </p>

          <p className="mt-2 text-xs text-muted">
            {exacto
              ? `Las demás rutas pendientes tienen f ≥ ${fmt(total)}, así que ninguna puede mejorarla.`
              : `Con ${busqueda.n} pacientes la búsqueda completa tarda demasiado. El óptimo real está entre ${fmt(cota)} y ${fmt(total)}.`}
          </p>
        </div>
      )}
    </div>
  );
}

export function AnalysisModal() {
  const open = useUi((s) => s.analysisOpen);
  const setOpen = useUi((s) => s.setAnalysisOpen);

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="¿Por qué este orden es el mejor?"
      description="Así construye A* la ruta: expande los nodos con menor f = g + h hasta llegar a la meta"
      header={<Legend />}
    >
      <AnalysisContent />
    </Modal>
  );
}