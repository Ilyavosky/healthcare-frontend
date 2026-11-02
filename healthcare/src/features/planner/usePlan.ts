"use client";

import { useMemo } from "react";
import { usePatients } from "@/features/patients/store";
import { useScenario } from "@/features/scenario/store";
import { buildPlan, planPorGravedad, stepsFor } from "./solve";
import { requestKey, useSolve } from "./solve-store";
import { useUi } from "./ui-store";
import { useSolveRequest } from "./useAutoSolve";

export function usePlan() {
  const patients = usePatients((s) => s.patients);
  const attended = useScenario((s) => s.attended);
  const modo = useUi((s) => s.orden);
  const request = useSolveRequest();
  const status = useSolve((s) => s.status);
  const dataKey = useSolve((s) => s.key);
  const response = useSolve((s) => s.data);
  const solveError = useSolve((s) => s.error);

  const key = useMemo(() => requestKey(request), [request]);
  const data = response && dataKey === key ? response : null;
  const error = status === "error" && dataKey === key ? solveError : null;

  const plan = useMemo(
    () => (data ? buildPlan(patients, attended, stepsFor(data, modo)) : planPorGravedad(patients, attended)),
    [data, patients, attended, modo],
  );

  const referencia = data && data.reference !== "baseline" ? data.results[data.reference] : undefined;

  return {
    ...plan,
    modo,
    data,
    error,
    hayPacientes: patients.length > 0,
    calculando: plan.pendientes > 0 && !data && !error,
    exacto: referencia?.status === "optimal",
    aproximado: referencia?.status === "approximate" ? referencia.weight : null,
    soloGravedad: data?.reference === "baseline",
    ahorro: data && modo === "optimo" && data.reference !== "baseline" ? data.baseline.cost - data.cost : null,
    exceso: data && modo === "gravedad" ? data.baseline.cost - data.cost : null,
  };
}
