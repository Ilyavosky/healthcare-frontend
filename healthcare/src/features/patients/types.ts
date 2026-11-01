import type { Nivel } from "@/lib/triage";

export type Patient = {
  id: string;
  nombre: string;
  nivel: Nivel;
  espera: number;
  duracion: number;
};

export type PlannedPatient = Patient & {
  inicia?: number;
  sobreLimite?: number;
  penalizacion?: number;
};

export type NewPatient = Omit<Patient, "id">;