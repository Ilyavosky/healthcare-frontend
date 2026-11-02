"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/format";
import { usePatients } from "@/features/patients/store";
import { requestKey, useSolve } from "@/features/planner/solve-store";
import { useUi } from "@/features/planner/ui-store";
import { useSolveRequest } from "@/features/planner/useAutoSolve";
import { toApiError } from "@/lib/api/client";
import { solveScenario } from "@/lib/api/solve";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { AlgorithmResultOut, SolveResponse } from "@/lib/api/types";
import { construirFotogramas, construirRutaCompletada, META, type Frames, type RutaCompletada } from "../frames";
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
        Ruta de A*
      </span>
      <span className="flex items-center gap-2">
        <span className="h-0 w-6 border-t-[3px] border-dashed border-amber" />
        Completada por gravedad
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

type Analisis = {
  key: string;
  result?: AlgorithmResultOut;
  response?: SolveResponse;
  datos?: Frames;
  ruta?: RutaCompletada | null;
  pendientes: number;
  aviso?: string;
  error?: string;
};

type Vista = "parcial" | "ruta";

function factorial(n: number): string {
  if (n <= 18) {
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return fmt(r);
  }
  let log = 0;
  for (let k = 2; k <= n; k++) log += Math.log10(k);
  const exp = Math.floor(log);
  return `${(10 ** (log - exp)).toFixed(1)} × 10^${exp}`;
}

function segundos(ms: number) {
  return ms < 1000 ? `${fmt(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function Reproductor({ datos, final }: { datos: Frames; final: (frame: Frames["frames"][number]) => React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const last = datos.frames.length - 1;
  const frameMs = Math.min(700, Math.max(35, DURACION_TOTAL_MS / (last + 1))) / speed;

  useEffect(() => {
    if (!playing) return;
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
  }, [playing, frameMs, last]);

  const frame = datos.frames[Math.min(index, last)];
  const parcialFinal = frame.done && !datos.completa;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Nodos expandidos"
          value={parcialFinal && datos.trazados < datos.expandidos ? `${fmt(frame.expandidos)} de ${fmt(datos.expandidos)}` : fmt(frame.done ? datos.expandidos : frame.expandidos)}
        />
        <Stat label="En frontera" value={fmt(frame.frontera)} />
        <Stat label="Menor f en frontera" value={fmt(frame.minF)} />
        <Stat
          label={frame.done && datos.completa ? "Penalización total" : "Rutas que se muestran"}
          value={frame.done && datos.completa ? fmt(datos.total) : `${Math.min(RUTAS_VISIBLES, frame.frontera)} de ${fmt(frame.frontera)}`}
          strong={frame.done && datos.completa}
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
          niveles={datos.profundidad}
          rutasVisibles={RUTAS_VISIBLES}
          durationMs={playing ? Math.round(Math.min(450, frameMs * 0.9)) : 300}
        />
      </div>

      {frame.done && final(frame)}
    </div>
  );
}

function FinalCompleta({ datos }: { datos: Frames }) {
  const { total, ruta, cierre, exacto, peso, cota, expandidos, trazados, completa } = datos;
  return (
    <div
      role="status"
      className={cn("rounded-xl border-l-4 px-5 py-4 text-[13px]", exacto ? "border-blue bg-bluebg" : "border-amber bg-amberbg")}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className={cn("text-[15px] font-bold tracking-tight", exacto ? "text-navy" : "text-amber")}>
          {exacto ? "Ruta óptima encontrada" : "Mejor ruta encontrada (aproximada)"}
        </p>
        <p className="text-muted">
          Penalización total <span className="text-xl font-extrabold tabular-nums tracking-tight text-navy">{fmt(total)}</span>
        </p>
      </div>
      <p className="mt-2 break-words font-mono text-[13px] font-medium leading-relaxed text-navy">{[...ruta, META].join("  →  ")}</p>
      {cierre.length > 0 && <p className="mt-1 break-words text-xs text-muted">Fuera de la meta, en orden de triage: {cierre.join(", ")}</p>}
      <p className="mt-2 text-xs text-muted">
        {exacto
          ? `Las demás rutas pendientes tienen f ≥ ${fmt(total)}, así que ninguna puede mejorarla.`
          : `A* normal no terminó a tiempo; A* ponderado (ε = ${peso}) garantiza que el óptimo real está entre ${fmt(cota)} y ${fmt(total)}.`}
        {!completa && ` La animación muestra las primeras ${fmt(trazados)} de ${fmt(expandidos)} expansiones.`}
      </p>
    </div>
  );
}

function Explicacion({ result, n }: { result: AlgorithmResultOut; n: number }) {
  const intento = result.limitAttempts[0];
  const cota = result.anytime?.lowerBound;
  return (
    <div className="rounded-xl border-l-4 border-amber bg-amberbg px-5 py-4 text-[13px] text-text">
      <p className="text-[15px] font-bold tracking-tight text-amber">A* no alcanzó la meta en el tiempo límite</p>
      <p className="mt-1.5 leading-relaxed">
        Con {n} pacientes hay {factorial(n)} órdenes de atención posibles. A* garantiza el óptimo, pero el número de estados crece de forma
        exponencial con los pacientes: resuelve en milisegundos salas de 12 pacientes y en unos 2 segundos una de 16, pero aquí expandió{" "}
        {fmt(intento?.expanded ?? 0)} nodos en {segundos(intento?.ms ?? 0)} sin llegar a la meta
        {result.limitAttempts.length > 1 && `, y tampoco terminó con A* ponderado (ε hasta ${result.limitAttempts[result.limitAttempts.length - 1].weight})`}.
      </p>
      {cota !== undefined && (
        <p className="mt-1.5 text-xs text-muted">
          Lo que sí se sabe: ninguna agenda puede costar menos de {fmt(cota)}. Es la menor g + h que quedó en la frontera al cortar la búsqueda
          (la mejor entre A* y A* ponderado); como h es admisible, nunca sobrestima lo que falta.
        </p>
      )}
    </div>
  );
}

function FinalParcial({ result }: { result: AlgorithmResultOut }) {
  const cota = result.anytime?.lowerBound;
  return (
    <div role="status" className="rounded-xl border-l-4 border-blue bg-bluebg px-5 py-4 text-[13px]">
      <p className="text-[15px] font-bold tracking-tight text-navy">Búsqueda detenida por tiempo</p>
      <p className="mt-1.5 text-xs text-muted">
        Así quedó A* (ε = 1) al cortarse: se muestran las {RUTAS_VISIBLES} rutas más prometedoras de la frontera, y su menor f también es una cota
        inferior del óptimo{cota !== undefined && ` (la mejor cota encontrada es ${fmt(cota)})`}. La pestaña «Ruta completada» toma el nodo más prometedor y
        termina la agenda.
      </p>
    </div>
  );
}

function RutaCompletadaVista({ ruta, result, response }: { ruta: RutaCompletada; result: AlgorithmResultOut; response: SolveResponse }) {
  const anytime = result.anytime!;
  const brecha = anytime.lowerBound > 0 ? Math.round((100 * (anytime.cost - anytime.lowerBound)) / anytime.lowerBound) : null;
  const usada = response.referenceKind === "anytime";
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <SearchTreeGraph frame={ruta.frame} niveles={ruta.profundidad} rutasVisibles={1} durationMs={300} />
      </div>
      <div role="status" className="rounded-xl border-l-4 border-amber bg-amberbg px-5 py-4 text-[13px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-[15px] font-bold tracking-tight text-amber">Ruta completada desde el mejor nodo (A* anytime)</p>
          <p className="text-muted">
            Penalización total <span className="text-xl font-extrabold tabular-nums tracking-tight text-navy">{fmt(anytime.cost)}</span>
          </p>
        </div>
        <p className="mt-2 break-words font-mono text-[13px] font-medium leading-relaxed">
          <span className="text-navy">{["Ø", ...ruta.buscados].join("  →  ")}</span>
          {ruta.completados.length > 0 && <span className="text-amber">{"  ⇢  " + ruta.completados.join("  ⇢  ")}</span>}
          <span className="text-navy">{"  →  " + META}</span>
        </p>
        {ruta.cierre.length > 0 && <p className="mt-1 break-words text-xs text-muted">Fuera de la meta, en orden de triage: {ruta.cierre.join(", ")}</p>}
        <p className="mt-2 text-xs text-muted">
          Los primeros {ruta.buscados.length} pasos los eligió A*; los siguientes {ruta.completados.length} se completaron por gravedad (nivel y
          luego mayor espera). El óptimo está entre {fmt(anytime.lowerBound)} y {fmt(anytime.cost)}
          {brecha !== null && `: esta agenda está a lo más ${brecha} % por encima`}.{" "}
          {usada
            ? `Es mejor que ordenar solo por gravedad (${fmt(response.baseline.cost)}), así que es la que muestra la tabla.`
            : `Ordenar solo por gravedad cuesta ${fmt(response.baseline.cost)}, así que la tabla muestra ese orden.`}
        </p>
      </div>
    </div>
  );
}

function AnalysisContent() {
  const patients = usePatients((s) => s.patients);
  const request = useSolveRequest();
  const key = useMemo(() => requestKey(request), [request]);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [vista, setVista] = useState<Vista>("parcial");
  const pausarComparacion = useSolve((s) => s.pausarComparacion);
  const reanudarComparacion = useSolve((s) => s.reanudarComparacion);
  const adoptar = useSolve((s) => s.adoptar);

  useEffect(() => {
    pausarComparacion();
    return () => reanudarComparacion();
  }, [pausarComparacion, reanudarComparacion]);

  useEffect(() => {
    if (!request || !key) return;
    const controller = new AbortController();
    const pendientes = patients.length - request.start.attended.length;
    solveScenario({ ...request, algorithms: ["astar"], includeTrace: true, traceLimit: TRACE_LIMIT }, controller.signal)
      .then((response) => {
        const result = response.results.astar;
        if (!result || (result.trace.length === 0 && !result.anytime)) {
          setAnalisis({ key, pendientes, aviso: "A* no terminó en el tiempo límite. La tabla muestra el orden por gravedad." });
          return;
        }
        adoptar(key, response);
        const datos = result.trace.length > 0 ? construirFotogramas(result, patients, RUTAS_VISIBLES) : undefined;
        const ruta = result.status === "limit_reached" ? construirRutaCompletada(result, patients, datos?.nodos ?? new Map()) : null;
        setAnalisis({ key, result, response, datos, ruta, pendientes });
        setVista(datos ? "parcial" : "ruta");
      })
      .catch((error) => {
        if (!controller.signal.aborted) setAnalisis({ key, pendientes, error: toApiError(error).message });
      });
    return () => controller.abort();
  }, [request, key, patients, adoptar]);

  const vigente = analisis !== null && analisis.key === key ? analisis : null;

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
  if (!vigente?.result || !vigente.response) {
    return <p className="py-10 text-center text-sm text-muted">Calculando la búsqueda A* en el servidor…</p>;
  }

  const { result, response, datos, ruta, pendientes } = vigente;

  if (result.status !== "limit_reached" && datos) {
    return <Reproductor key={key} datos={datos} final={() => <FinalCompleta datos={datos} />} />;
  }

  return (
    <div className="space-y-4">
      <Explicacion result={result} n={pendientes} />
      <SegmentedControl<Vista>
        value={vista}
        onChange={setVista}
        options={[
          { value: "parcial", label: "Búsqueda A* (parcial)" },
          { value: "ruta", label: "Ruta completada (A* anytime)" },
        ]}
      />
      {vista === "parcial" && datos && <Reproductor key={key} datos={datos} final={() => <FinalParcial result={result} />} />}
      {vista === "parcial" && !datos && <p className="py-6 text-center text-sm text-muted">No hay traza parcial disponible.</p>}
      {vista === "ruta" && ruta && <RutaCompletadaVista ruta={ruta} result={result} response={response} />}
      {vista === "ruta" && !ruta && <p className="py-6 text-center text-sm text-muted">No se pudo completar una ruta.</p>}
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