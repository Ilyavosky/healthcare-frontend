import type { Patient } from "./types";

export function ordenPorGravedad(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => a.nivel - b.nivel || b.espera - a.espera);
}
