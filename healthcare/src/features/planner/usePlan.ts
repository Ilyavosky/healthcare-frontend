"use client";

import { useMemo } from "react";
import { usePatients } from "@/features/patients/store";
import { useScenario } from "@/features/scenario/store";
import { buildPlan, pendingCount, stepsFor } from "./solve";
import { useSolve } from "./solve-store";
import { useUi } from "./ui-store";

export function usePlan() {
  const patients = usePatients((s) => s.patients);
  const attended = useScenario((s) => s.attended);
  const view = useUi((s) => s.view);
  const status = useSolve((s) => s.status);
  const data = useSolve((s) => s.data);
  const error = useSolve((s) => s.error);

  const plan = useMemo(
    () => (data ? buildPlan(patients, attended, stepsFor(data, view)) : null),
    [data, patients, attended, view],
  );

  return { plan, data, status, error, view, pending: pendingCount(patients, attended), total: patients.length };
}
