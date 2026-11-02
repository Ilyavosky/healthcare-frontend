"use client";

import { usePlan } from "@/features/planner/usePlan";
import { PenaltySummary } from "./PenaltySummary";
import { StatTile } from "./StatTile";

function points(n: number) {
  return `${n} ${n === 1 ? "punto" : "puntos"}`;
}

export function AnalysisPanel() {
  const { plan, data, status, view, pending, total } = usePlan();

  let caption: string;
  if (total === 0) caption = "Agrega pacientes para calcular el orden óptimo.";
  else if (pending === 0) caption = "No hay pacientes en espera.";
  else if (status === "error") caption = "No se pudo calcular el orden.";
  else if (!data) caption = "Calculando el mejor orden…";
  else {
    const gap = data.baseline.cost - data.cost;
    if (data.reference === "baseline") caption = "Orden por gravedad: no hubo solución exacta a tiempo.";
    else if (view === "gravedad") caption = gap > 0 ? `${points(gap)} más que el orden óptimo.` : "Igual que el orden óptimo.";
    else caption = gap > 0 ? `${points(gap)} menos que ordenar solo por gravedad.` : "Ordenar por gravedad da el mismo resultado.";
  }

  return (
    <>
      <PenaltySummary total={plan ? plan.total : null} caption={caption} />
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Fin del turno" value={plan?.end != null ? `min ${plan.end}` : "—"} />
        <StatTile label="Con retraso" value={plan ? String(plan.late) : "—"} />
      </div>
    </>
  );
}
