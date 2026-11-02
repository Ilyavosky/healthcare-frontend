import { create } from "zustand";

export type AddTab = "individual" | "excel";

export type PlanView = "optimo" | "gravedad";

type UiState = {
  addDrawer: AddTab | null;
  openAdd: (tab?: AddTab) => void;
  closeAdd: () => void;
  startDrawer: boolean;
  setStartDrawer: (open: boolean) => void;
  doctorsDrawer: boolean;
  setDoctorsDrawer: (open: boolean) => void;
  goalDrawer: boolean;
  setGoalDrawer: (open: boolean) => void;
  view: PlanView;
  setView: (view: PlanView) => void;
};

export const useUi = create<UiState>((set) => ({
  addDrawer: null,
  openAdd: (tab = "individual") => set({ addDrawer: tab }),
  closeAdd: () => set({ addDrawer: null }),
  startDrawer: false,
  setStartDrawer: (open) => set({ startDrawer: open }),
  doctorsDrawer: false,
  setDoctorsDrawer: (open) => set({ doctorsDrawer: open }),
  goalDrawer: false,
  setGoalDrawer: (open) => set({ goalDrawer: open }),
  view: "optimo",
  setView: (view) => set({ view }),
}));
