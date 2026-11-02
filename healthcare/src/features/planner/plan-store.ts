import { create } from "zustand";
import type { Patient } from "@/features/patients/types";

/** Resultado de A* para un escenario concreto (se guarda con las referencias con que se calculó). */
export type Optimo = {
  patients: Patient[];
  attended: string[];
  t0: number;
  ids: string[]; // orden óptimo
  exacto: boolean;
};

type PlanState = {
  optimo: Optimo | null;
  setOptimo: (optimo: Optimo | null) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  optimo: null,
  setOptimo: (optimo) => set({ optimo }),
}));