import type { GoalIn, SolveRequest, SolveResponse, StepOut } from "@/lib/api/types";
import type { Patient, PlannedPatient } from "@/features/patients/types";
import type { Goal } from "@/features/scenario/store";
import type { PlanView } from "./ui-store";

export type ScenarioInput = {
  patients: Patient[];
  t0: number;
  attended: string[];
  doctors: number;
  doctorsFreeAt: number[] | null;
  goal: Goal;
};

export type Plan = {
  rows: PlannedPatient[];
  total: number;
  end: number | null;
  late: number;
};

function toGoal(goal: Goal, pending: number): GoalIn {
  switch (goal.tipo) {
    case "criticos":
      return { type: "critical" };
    case "k":
      return { type: "k", value: Math.min(Math.max(1, goal.k), pending) };
    case "t":
      return { type: "horizon", value: Math.max(1, goal.t) };
    default:
      return { type: "all" };
  }
}

export function pendingCount(patients: Patient[], attended: string[]): number {
  const done = new Set(attended);
  return patients.filter((p) => !done.has(p.id)).length;
}

export function buildSolveRequest(input: ScenarioInput): SolveRequest | null {
  const { patients, t0, doctors, doctorsFreeAt, goal } = input;
  const ids = new Set(patients.map((p) => p.id));
  const attended = input.attended.filter((id) => ids.has(id));
  const pending = pendingCount(patients, attended);
  if (pending === 0) return null;
  return {
    patients: patients.map((p) => ({ id: p.id, level: p.nivel, wait: p.espera, duration: p.duracion })),
    start: {
      t0,
      attended,
      ...(doctorsFreeAt && {
        doctorsFreeAt: Array.from({ length: doctors }, (_, i) => Math.max(t0, doctorsFreeAt[i] ?? t0)),
      }),
    },
    doctors,
    goal: toGoal(goal, pending),
    algorithms: ["ucs", "astar"],
  };
}

function toRow(patient: Patient, step: StepOut): PlannedPatient {
  return {
    ...patient,
    inicia: step.start,
    termina: step.end,
    sobreLimite: step.delay,
    penalizacion: step.penalty,
    medico: step.doctor,
    estado: step.afterGoal ? "fuera-meta" : step.delay > 0 ? "retraso" : "a-tiempo",
  };
}

export function stepsFor(response: SolveResponse, view: PlanView): StepOut[] {
  if (view === "optimo" && response.reference !== "baseline") {
    const result = response.results[response.reference];
    if (result && result.steps.length + result.leftOut.length > 0) return [...result.steps, ...result.leftOut];
  }
  return [...response.baseline.steps, ...response.baseline.leftOut];
}

export function buildPlan(patients: Patient[], attended: string[], steps: StepOut[]): Plan {
  const byId = new Map(patients.map((p) => [p.id, p]));
  const done = new Set(attended);
  const placed = new Set<string>();
  const rows: PlannedPatient[] = [];
  for (const step of steps) {
    const patient = byId.get(step.patient);
    if (!patient) continue;
    placed.add(patient.id);
    rows.push(toRow(patient, step));
  }
  for (const patient of patients) {
    if (placed.has(patient.id)) continue;
    rows.push(done.has(patient.id) ? { ...patient, estado: "atendido" } : patient);
  }
  const planned = rows.filter((r) => r.termina !== undefined);
  return {
    rows,
    total: planned.reduce((sum, r) => sum + (r.penalizacion ?? 0), 0),
    end: planned.length > 0 ? Math.max(...planned.map((r) => r.termina ?? 0)) : null,
    late: planned.filter((r) => (r.sobreLimite ?? 0) > 0).length,
  };
}
