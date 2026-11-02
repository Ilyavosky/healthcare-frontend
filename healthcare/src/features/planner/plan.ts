import type { FilaTabla, Patient } from "@/features/patients/types";
import { NIVELES } from "@/lib/triage";
import { costo } from "./cost";

export type Plan = {
  filas: FilaTabla[];
  total: number; // penalización total
  finTurno: number; // minuto en que termina la última consulta
  conRetraso: number; // pacientes que pasan de su límite de espera
  pendientes: number;
};

/**
 * Dado un orden de atención, calcula para cada paciente cuándo empieza,
 * cuánto se pasa de su límite y cuánta penalización genera.
 * Los pacientes ya atendidos van primero, sin datos de plan.
 */
export function construirPlan(atendidos: Patient[], orden: Patient[], t0: number): Plan {
  const filas: FilaTabla[] = atendidos.map((patient) => ({
    patient,
    inicia: null,
    sobre: null,
    penal: null,
    estado: "atendido",
  }));

  let t = t0;
  let total = 0;
  let conRetraso = 0;
  for (const patient of orden) {
    const sobre = Math.max(0, patient.espera + t - NIVELES[patient.nivel].limite);
    const penal = costo(patient, t);
    total += penal;
    if (sobre > 0) conRetraso++;
    filas.push({ patient, inicia: t, sobre, penal, estado: sobre > 0 ? "retraso" : "a_tiempo" });
    t += patient.duracion;
  }

  return { filas, total, finTurno: t, conRetraso, pendientes: orden.length };
}