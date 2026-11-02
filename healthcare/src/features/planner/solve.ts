import type { AlertOut, GoalIn, SolveRequest, SolveResponse, StepOut } from "@/lib/api/types";
import type { FilaTabla, Nota, Patient } from "@/features/patients/types";
import { ordenPorGravedad } from "@/features/patients/utils";
import type { Goal } from "@/features/scenario/store";
import type { OrdenModo } from "./ui-store";

export type ScenarioInput = {
  patients: Patient[];
  t0: number;
  attended: string[];
  doctors: number;
  doctorsFreeAt: number[] | null;
  goal: Goal;
};

export type Plan = {
  filas: FilaTabla[];
  total: number;
  finTurno: number | null;
  conRetraso: number;
  pendientes: number;
};

function toGoal(goal: Goal, pending: number, ids: Set<string>): GoalIn {
  switch (goal.tipo) {
    case "criticos":
      return { type: "critical" };
    case "k":
      return { type: "k", value: Math.min(Math.max(1, goal.k), pending) };
    case "t":
      return { type: "horizon", value: Math.max(1, goal.t) };
    case "subconjunto": {
      const elegidos = goal.ids.filter((id) => ids.has(id));
      return elegidos.length > 0 ? { type: "subset", value: elegidos } : { type: "all" };
    }
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
    goal: toGoal(goal, pending, ids),
    algorithms: ["astar"],
  };
}

export function stepsFor(response: SolveResponse, modo: OrdenModo): StepOut[] {
  if (modo === "optimo" && response.reference !== "baseline") {
    const result = response.results[response.reference];
    if (response.referenceKind === "anytime" && result?.anytime) return [...result.anytime.steps, ...result.anytime.leftOut];
    if (result && result.steps.length + result.leftOut.length > 0) return [...result.steps, ...result.leftOut];
  }
  return [...response.baseline.steps, ...response.baseline.leftOut];
}

export function alertsFor(response: SolveResponse, modo: OrdenModo): AlertOut[] {
  return modo === "optimo" ? response.alerts : response.baseline.alerts;
}

function notaDe(alert: AlertOut): Nota | null {
  switch (alert.code) {
    case "ALREADY_LATE":
      return { texto: `Ya rebasaba su límite por ${alert.minutes} min`, critica: false };
    case "NEAR_LIMIT":
      return { texto: alert.minutes === 0 ? "Empieza justo en su límite" : `A ${alert.minutes} min de su límite`, critica: false };
    case "LEFT_OUT_CRITICAL":
      return { texto: "Crítico que queda fuera de la meta", critica: true };
    default:
      return null;
  }
}

function atendidosPrimero(patients: Patient[], attended: string[]): FilaTabla[] {
  const done = new Set(attended);
  return patients
    .filter((p) => done.has(p.id))
    .map((patient) => ({ patient, inicia: null, termina: null, sobre: null, penal: null, medico: null, estado: "atendido", notas: [] }));
}

function sinPlan(patient: Patient): FilaTabla {
  return { patient, inicia: null, termina: null, sobre: null, penal: null, medico: null, estado: "sin_plan", notas: [] };
}

export function buildPlan(patients: Patient[], attended: string[], steps: StepOut[], alerts: AlertOut[] = []): Plan {
  const done = new Set(attended);
  const notas = new Map<string, Nota[]>();
  for (const alert of alerts) {
    const nota = notaDe(alert);
    if (nota) notas.set(alert.patient, [...(notas.get(alert.patient) ?? []), nota]);
  }
  const byId = new Map(patients.map((p) => [p.id, p]));
  const filas = atendidosPrimero(patients, attended);
  const placed = new Set<string>();
  let total = 0;
  let finTurno: number | null = null;
  let conRetraso = 0;
  for (const step of steps) {
    const patient = byId.get(step.patient);
    if (!patient || done.has(patient.id)) continue;
    placed.add(patient.id);
    total += step.penalty;
    finTurno = Math.max(finTurno ?? step.end, step.end);
    if (step.delay > 0) conRetraso++;
    filas.push({
      patient,
      inicia: step.start,
      termina: step.end,
      sobre: step.delay,
      penal: step.penalty,
      medico: step.doctor,
      estado: step.afterGoal ? "fuera_meta" : step.delay > 0 ? "retraso" : "a_tiempo",
      notas: notas.get(patient.id) ?? [],
    });
  }
  for (const patient of patients) {
    if (!done.has(patient.id) && !placed.has(patient.id)) filas.push(sinPlan(patient));
  }
  return { filas, total, finTurno, conRetraso, pendientes: pendingCount(patients, attended) };
}

export function planPorGravedad(patients: Patient[], attended: string[]): Plan {
  const done = new Set(attended);
  const pendientes = patients.filter((p) => !done.has(p.id));
  return {
    filas: [...atendidosPrimero(patients, attended), ...ordenPorGravedad(pendientes).map(sinPlan)],
    total: 0,
    finTurno: null,
    conRetraso: 0,
    pendientes: pendientes.length,
  };
}
