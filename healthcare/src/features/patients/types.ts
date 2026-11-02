import type { Nivel } from "@/lib/triage";

export type Patient = {
  id: string;
  nombre: string;
  nivel: Nivel;
  espera: number;
  duracion: number;
};

export type NewPatient = Omit<Patient, "id">;

export type Estado = "atendido" | "a_tiempo" | "retraso" | "fuera_meta" | "sin_plan";

export type FilaTabla = {
  patient: Patient;
  inicia: number | null;
  sobre: number | null;
  penal: number | null;
  medico: number | null;
  estado: Estado;
};
