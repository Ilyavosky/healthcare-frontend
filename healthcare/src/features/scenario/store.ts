import { create } from "zustand";

export type GoalType = "todos" | "criticos" | "k" | "t" | "subconjunto";

export type Goal = {
  tipo: GoalType;
  k: number;
  t: number;
  ids: string[];
};

export const DEFAULT_GOAL: Goal = { tipo: "todos", k: 4, t: 60, ids: [] };

type ScenarioState = {
  t0: number;
  attended: string[];
  setStart: (t0: number, attended: string[]) => void;
  doctors: number;
  doctorsFreeAt: number[] | null;
  setDoctors: (doctors: number, freeAt: number[] | null) => void;
  goal: Goal;
  setGoal: (goal: Goal) => void;
  reset: () => void;
};

export const useScenario = create<ScenarioState>((set) => ({
  t0: 0,
  attended: [],
  setStart: (t0, attended) => set({ t0, attended }),
  doctors: 1,
  doctorsFreeAt: null,
  setDoctors: (doctors, doctorsFreeAt) => set({ doctors, doctorsFreeAt }),
  goal: DEFAULT_GOAL,
  setGoal: (goal) => set({ goal }),
  reset: () => set({ t0: 0, attended: [], doctors: 1, doctorsFreeAt: null, goal: DEFAULT_GOAL }),
}));
