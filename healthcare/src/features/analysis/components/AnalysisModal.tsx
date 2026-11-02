"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/format";
import { usePatients } from "@/features/patients/store";
import { requestKey } from "@/features/planner/solve-store";
import { useUi } from "@/features/planner/ui-store";
import { useSolveRequest } from "@/features/planner/useAutoSolve";
import { toApiError } from "@/lib/api/client";
import { solveScenario } from "@/lib/api/solve";
import { construirFotogramas, META, type Frames } from "../frames";
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

const TRACE_LIMIT = 30000;

type Analisis = { key: string; datos?: Frames; aviso?: string; error?: string };

function AnalysisContent() {
  const patients = usePatients((s) => s.patients);
  const request = useSolveRequest();
  const key = useMemo(() => requestKey(request), [request]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);

  useEffect(() => {
    if (!request || !key) return;
    const controller = new AbortController();
    solveScenario({ ...request, algorithms: ["astar"], includeTrace: true, traceLimit: TRACE_LIMIT }, controller.signal)
      .then((response) => {
        const result = response.results.astar;
        if (!result || result.status === "limit_reached" || result.trace.length === 0) {
          setAnalisis({
            key,
            aviso: "A* no terminó en el tiempo límite, ni con la versión ponderada. La tabla muestra el orden por gravedad.",
          });
        } else {
          setAnalisis({ key, datos: construirFotogramas(result, patients, RUTAS_VISIBLES) });
        }
        setIndex(0);
        setPlaying(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setAnalisis({ key, error: toApiError(error).message });
      });
    return () => controller.abort();
  }, [request, key, patients]);

  const vigente = analisis !== null && analisis.key === key ? analisis : null;
  const datos = vigente?.datos ?? null;
  const last = datos ? datos.frames.length - 1 : 0;
  const frameMs = Math.min(700, Math.max(35, DURACION_TOTAL_MS / (last + 1))) / speed;

  useEffect(() => {
    if (!playing || !datos) return;
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
  }, [playing, frameMs, datos, last]);

  if (!request) {
    return <p className="py-10 text-center text-sm text-muted">No hay pacientes pendientes que analizar.</p>;
  }
  if (vigente?.error) {
    return (
      <p role="alert" className="py-10 text-center text-sm text-n1">
        {vigente.error}
      </p>
    );
  }
  if (vigente?.aviso) {
    return <p className="py-10 text-center text-sm text-muted">{vigente.aviso}</p>;
  }
  if (!datos) {
    return <p className="py-10 text-center text-sm text-muted">Calculando la búsqueda A* en el servidor…</p>;
  }

  const { frames, total, ruta, cierre, exacto, peso, cota, expandidos, trazados, completa, profundidad } = datos;
  const frame = frames[Math.min(index, last)];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Nodos expandidos"
          value={frame.done && !completa ? `${fmt(frame.expandidos)} de ${fmt(expandidos)}` : fmt(frame.done ? expandidos : frame.expandidos)}
        />
        <Stat label="En frontera" value={fmt(frame.frontera)} />
        <Stat label="Menor f en frontera" value={fmt(frame.minF)} />
        <Stat
          label={frame.done ? "Penalización total" : "Rutas que se muestran"}
          value={frame.done ? fmt(total) : `${Math.min(RUTAS_VISIBLES, frame.frontera)} de ${fmt(frame.frontera)}`}
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
          niveles={profundidad}
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
            {[...ruta, META].join("  →  ")}
          </p>
          {cierre.length > 0 && (
            <p className="mt-1 break-words text-xs text-muted">
              Fuera de la meta, en orden de triage: {cierre.join(", ")}
            </p>
          )}

          <p className="mt-2 text-xs text-muted">
            {exacto
              ? `Las demás rutas pendientes tienen f ≥ ${fmt(total)}, así que ninguna puede mejorarla.`
              : `A* normal no terminó a tiempo; A* ponderado (ε = ${peso}) garantiza que el óptimo real está entre ${fmt(cota)} y ${fmt(total)}.`}
            {!completa && ` La animación muestra las primeras ${fmt(trazados)} de ${fmt(expandidos)} expansiones.`}
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