import { create } from "zustand";

export type GoalType = "todos" | "criticos" | "k" | "t";

export type Goal = {
  tipo: GoalType;
  k: number;
  t: number;
};

export const DEFAULT_GOAL: Goal = { tipo: "todos", k: 4, t: 60 };

type ScenarioState = {
  t0: number;
  attended: string[];
  setStart: (t0: number, attended: string[]) => void;
  goal: Goal;
  setGoal: (goal: Goal) => void;
  reset: () => void;
};

export const useScenario = create<ScenarioState>((set) => ({
  t0: 0,
  attended: [],
  setStart: (t0, attended) => set({ t0, attended }),
  goal: DEFAULT_GOAL,
  setGoal: (goal) => set({ goal }),
  reset: () => set({ t0: 0, attended: [], goal: DEFAULT_GOAL }),
}));