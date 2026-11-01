import type { Patient } from "./types";

// TEMPORAL: ordena por gravedad (N1 primero) y luego por quien lleva más esperando.
// Esta cosa luego se reemplaza por el planner (A*) cuando esté listo.
// jiji
export function ordenPorGravedad(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => a.nivel - b.nivel || b.espera - a.espera);
}