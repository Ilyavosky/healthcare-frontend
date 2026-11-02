"use client";

import { PenaltySummary } from "@/features/analysis/components/PenaltySummary";
import { StatTile } from "@/features/analysis/components/StatTile";
import { fmt } from "@/lib/format";
import { usePlan } from "../usePlan";

/** Penalización total + fin del turno + pacientes con retraso, del orden que se está mostrando. */
export function SummaryPanel() {
  const plan = usePlan();

  let nota = "Agrega pacientes para calcular el orden óptimo.";
  if (plan.hayPacientes && plan.pendientes === 0) nota = "Todos los pacientes ya fueron atendidos.";
  else if (plan.calculando) nota = "Calculando el orden óptimo…";
  else if (plan.pendientes > 0 && plan.modo === "gravedad") nota = "Con orden por gravedad. Cambia a «Orden óptimo» para ver la menor penalización.";
  else if (plan.pendientes > 0 && !plan.exacto) nota = "Mejor orden encontrado (aproximado): con tantos pacientes no se puede garantizar el óptimo.";
  else if (plan.pendientes > 0)
    nota = plan.ahorro && plan.ahorro > 0 ? `Es el mínimo posible: ahorras ${fmt(plan.ahorro)} frente al orden por gravedad.` : "Es el mínimo posible.";

  const hay = plan.pendientes > 0 && !plan.calculando;

  return (
    <>
      <PenaltySummary total={plan.pendientes > 0 ? plan.total : null} nota={nota} />
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Fin del turno" value={hay ? `Min ${fmt(plan.finTurno)}` : "—"} />
        <StatTile label="Con retraso" value={hay ? `${plan.conRetraso} de ${plan.pendientes}` : "—"} />
      </div>
    </>
  );
}