import type { Nivel } from "@/lib/triage";

export type Patient = {
  id: string;
  nombre: string;
  nivel: Nivel;
  espera: number;
  duracion: number;
};

export type Estado = "a-tiempo" | "retraso" | "fuera-meta" | "atendido";

export type PlannedPatient = Patient & {
  inicia?: number;
  termina?: number;
  sobreLimite?: number;
  penalizacion?: number;
  medico?: number;
  estado?: Estado;
};

export type NewPatient = Omit<Patient, "id">;
