"use client";

import { usePatients } from "@/features/patients/store";
import { useUi } from "@/features/planner/ui-store";
import { useScenario } from "../store";
import { ScenarioCard } from "./ScenarioCard";

export function StartCard() {
  const t0 = useScenario((s) => s.t0);
  const attended = useScenario((s) => s.attended);
  const patients = usePatients((s) => s.patients);
  const setStartDrawer = useUi((s) => s.setStartDrawer);
  const n = patients.filter((p) => attended.includes(p.id)).length;
  const summary =
    n === 0 ? `Nadie atendido aún · minuto ${t0}` : `${n} ${n === 1 ? "atendido" : "atendidos"} · minuto ${t0}`;

  return (
    <ScenarioCard
      label="Inicio"
      summary={summary}
      actionLabel="Configurar inicio"
      onAction={() => setStartDrawer(true)}
    />
  );
}