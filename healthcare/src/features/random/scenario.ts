import type { PatientIn } from "@/lib/api/types";
import type { Patient } from "@/features/patients/types";
import type { Goal } from "@/features/scenario/store";
import { DEFAULT_GOAL } from "@/features/scenario/store";
import type { Nivel } from "@/lib/triage";

export const MAX_RANDOM_PATIENTS = 1000;
export const MAX_RANDOM_DOCTORS = 1000;
export const MAX_SEED = 999_999_999;
export const MAX_CUSTOM_DOCTORS = 50;

export type RandomOptions = {
  n: number;
  doctors: number;
  randomStart: boolean;
  randomGoal: boolean;
};

export type RandomScenario = {
  seed: number;
  patients: Patient[];
  t0: number;
  attended: string[];
  doctors: number;
  doctorsFreeAt: number[] | null;
  goal: Goal;
};

export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function sample<T>(rng: () => number, list: T[], size: number): T[] {
  const copy = [...list];
  for (let i = 0; i < size; i++) {
    const j = randInt(rng, i, copy.length - 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, size);
}

function randomStart(rng: () => number, patients: Patient[], doctors: number) {
  const t0 = randInt(rng, 0, 12) * 5;
  const maxAttended = Math.min(patients.length - 1, Math.floor(patients.length * 0.3));
  const attended = sample(rng, patients, randInt(rng, 0, maxAttended))
    .map((p) => p.id)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const doctorsFreeAt =
    doctors <= MAX_CUSTOM_DOCTORS ? Array.from({ length: doctors }, () => t0 + randInt(rng, 0, 9) * 5) : null;
  return { t0, attended, doctorsFreeAt };
}

function randomGoal(rng: () => number, pending: Patient[]): Goal {
  const tipos: Goal["tipo"][] = ["todos", "k", "t", "subconjunto"];
  if (pending.some((p) => p.nivel <= 2)) tipos.push("criticos");
  const tipo = tipos[randInt(rng, 0, tipos.length - 1)];
  const k = randInt(rng, 1, pending.length);
  const t = randInt(rng, 3, 24) * 10;
  const ids =
    tipo === "subconjunto"
      ? sample(rng, pending, randInt(rng, 1, Math.min(5, pending.length))).map((p) => p.id)
      : [];
  return { ...DEFAULT_GOAL, tipo, k: tipo === "k" ? k : DEFAULT_GOAL.k, t: tipo === "t" ? t : DEFAULT_GOAL.t, ids };
}

export function buildRandomScenario(seed: number, generated: PatientIn[], options: RandomOptions): RandomScenario {
  const patients: Patient[] = generated.map((p, i) => ({
    id: p.id,
    nombre: `Paciente ${i + 1}`,
    nivel: p.level as Nivel,
    espera: p.wait,
    duracion: p.duration,
  }));
  const rng = createRng(seed);
  const start = options.randomStart
    ? randomStart(rng, patients, options.doctors)
    : { t0: 0, attended: [], doctorsFreeAt: null };
  const done = new Set(start.attended);
  const pending = patients.filter((p) => !done.has(p.id));
  return {
    seed,
    patients,
    ...start,
    doctors: options.doctors,
    goal: options.randomGoal ? randomGoal(rng, pending) : DEFAULT_GOAL,
  };
}
