"use client";

import { PenaltySummary } from "@/features/analysis/components/PenaltySummary";
import { StatTile } from "@/features/analysis/components/StatTile";
import { fmt } from "@/lib/format";
import { usePlan } from "../usePlan";

function puntos(n: number) {
  return `${fmt(n)} ${n === 1 ? "punto" : "puntos"}`;
}

export function SummaryPanel() {
  const plan = usePlan();

  let nota = "Agrega pacientes para calcular el orden óptimo.";
  if (plan.hayPacientes && plan.pendientes === 0) nota = "Todos los pacientes ya fueron atendidos.";
  else if (plan.error) nota = "No se pudo calcular el orden.";
  else if (plan.calculando) nota = "Calculando el orden óptimo…";
  else if (plan.soloGravedad) nota = "Escenario muy grande para resolverlo a tiempo: se muestra el orden por gravedad.";
  else if (plan.modo === "gravedad")
    nota = plan.exceso ? `Con orden por gravedad: ${puntos(plan.exceso)} más que el orden óptimo.` : "Con orden por gravedad: igual que el orden óptimo.";
  else if (plan.anytime)
    nota = `A* no terminó a tiempo: agenda completada desde el mejor nodo. El óptimo está entre ${fmt(plan.anytime.lowerBound)} y ${fmt(plan.anytime.cost)}.`
  else if (plan.aproximado !== null)
    nota = `Mejor orden encontrado con A* ponderado (ε = ${plan.aproximado}): como mucho ${Math.round((plan.aproximado - 1) * 100)} % sobre el óptimo.`;
  else if (plan.hayPacientes)
    nota = plan.ahorro ? `Es el mínimo posible: ahorras ${puntos(plan.ahorro)} frente al orden por gravedad.` : "Es el mínimo posible.";

  const hay = plan.pendientes > 0 && plan.data !== null;

  return (
    <>
      <PenaltySummary total={hay ? plan.total : null} nota={nota} />
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Fin del turno" value={hay && plan.finTurno !== null ? `Min ${fmt(plan.finTurno)}` : "—"} />
        <StatTile label="Con retraso" value={hay ? `${plan.conRetraso} de ${plan.pendientes}` : "—"} />
      </div>
    </>
  );
}
