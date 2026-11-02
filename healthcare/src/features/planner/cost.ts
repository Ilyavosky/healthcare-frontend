import type { Patient } from "@/features/patients/types";
import { NIVELES } from "@/lib/triage";

export function costo(p: Patient, start: number): number {
  const n = NIVELES[p.nivel];
  return n.peso * Math.max(0, p.espera + start - n.limite);
}