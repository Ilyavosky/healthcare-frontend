import { create } from "zustand";
import type { NewPatient, Patient } from "./types";

type PatientsState = {
  patients: Patient[];
  nextId: number;
  addPatient: (p: NewPatient) => void;
  addMany: (list: NewPatient[]) => void;
  removePatient: (id: string) => void;
  replace: (list: Patient[]) => void;
  reset: () => void;
};

export const usePatients = create<PatientsState>((set) => ({
  patients: [],
  nextId: 1,
  addPatient: (p) =>
    set((s) => ({
      patients: [...s.patients, { ...p, id: `P${s.nextId}` }],
      nextId: s.nextId + 1,
    })),
  addMany: (list) =>
    set((s) => ({
      patients: [
        ...s.patients,
        ...list.map((p, i) => ({ ...p, id: `P${s.nextId + i}` })),
      ],
      nextId: s.nextId + list.length,
    })),
  removePatient: (id) =>
    set((s) => ({ patients: s.patients.filter((p) => p.id !== id) })),
  replace: (list) =>
    set({
      patients: list,
      nextId: list.reduce((max, p) => Math.max(max, Number(p.id.slice(1)) || 0), 0) + 1,
    }),
  reset: () => set({ patients: [], nextId: 1 }),
}));