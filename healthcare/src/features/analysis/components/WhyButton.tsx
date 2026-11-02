"use client";

import { Button } from "@/components/ui/Button";
import { usePatients } from "@/features/patients/store";
import { useUi } from "@/features/planner/ui-store";

export function WhyButton() {
  const hayPacientes = usePatients((s) => s.patients.length > 0);
  const setOpen = useUi((s) => s.setAnalysisOpen);

  return (
    <Button
      variant="block"
      className="py-[15px] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!hayPacientes}
      onClick={() => setOpen(true)}
    >
      ¿Por qué este orden es el mejor?
    </Button>
  );
}