"use client";

import { useEffect, useMemo } from "react";
import { usePatients } from "@/features/patients/store";
import { useScenario } from "@/features/scenario/store";
import { buildSolveRequest } from "./solve";
import { useSolve } from "./solve-store";

const DEBOUNCE_MS = 450;

export function useAutoSolve() {
  const patients = usePatients((s) => s.patients);
  const t0 = useScenario((s) => s.t0);
  const attended = useScenario((s) => s.attended);
  const doctors = useScenario((s) => s.doctors);
  const doctorsFreeAt = useScenario((s) => s.doctorsFreeAt);
  const goal = useScenario((s) => s.goal);
  const run = useSolve((s) => s.run);

  const request = useMemo(
    () => buildSolveRequest({ patients, t0, attended, doctors, doctorsFreeAt, goal }),
    [patients, t0, attended, doctors, doctorsFreeAt, goal],
  );

  useEffect(() => {
    const id = setTimeout(() => void run(request), request ? DEBOUNCE_MS : 0);
    return () => clearTimeout(id);
  }, [request, run]);
}
