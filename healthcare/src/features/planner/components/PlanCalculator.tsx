"use client";

import { useEffect } from "react";
import { usePatients } from "@/features/patients/store";
import { useScenario } from "@/features/scenario/store";
import { ejecutarAEstrella, ordenDeTrace } from "../astar";
import { usePlanStore } from "../plan-store";

/**
 * No dibuja nada: cada vez que cambian los pacientes o el inicio de turno,
 * recalcula el orden óptimo con A* y lo guarda en el store del plan.
 */
export function PlanCalculator() {
  const patients = usePatients((s) => s.patients);
  const attended = useScenario((s) => s.attended);
  const t0 = useScenario((s) => s.t0);
  const setOptimo = usePlanStore((s) => s.setOptimo);

  useEffect(() => {
    const pendientes = patients.filter((p) => !attended.includes(p.id));
    if (pendientes.length === 0) return;
    // Pequeña espera para no recalcular en cada cambio seguido (ej. al importar un Excel)
    const id = setTimeout(() => {
      const trace = ejecutarAEstrella(pendientes, t0);
      const ids = ordenDeTrace(trace).map((j) => pendientes[j].id);
      setOptimo({ patients, attended, t0, ids, exacto: trace.exacto });
    }, 150);
    return () => clearTimeout(id);
  }, [patients, attended, t0, setOptimo]);

  return null;
}