import { create } from "zustand";

type ScenarioState = {
  t0: number;
  attended: string[];
  setStart: (t0: number, attended: string[]) => void;
  reset: () => void;
};

export const useScenario = create<ScenarioState>((set) => ({
  t0: 0,
  attended: [],
  setStart: (t0, attended) => set({ t0, attended }),
  reset: () => set({ t0: 0, attended: [] }),
}));