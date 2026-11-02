"use client";

import { useUi } from "@/features/planner/ui-store";
import { useScenario } from "../store";
import { ScenarioCard } from "./ScenarioCard";

export function DoctorsCard() {
  const doctors = useScenario((s) => s.doctors);
  const freeAt = useScenario((s) => s.doctorsFreeAt);
  const setDoctorsDrawer = useUi((s) => s.setDoctorsDrawer);
  const count = `${doctors} ${doctors === 1 ? "médico" : "médicos"}`;
  const summary = freeAt ? `${count} · liberación personalizada` : `${count} · libres en t₀`;

  return (
    <ScenarioCard
      label="Médicos"
      summary={summary}
      actionLabel="Configurar médicos"
      onAction={() => setDoctorsDrawer(true)}
    />
  );
}
