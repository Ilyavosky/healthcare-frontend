import { create } from "zustand";

export type AddTab = "individual" | "excel";
export type OrdenModo = "optimo" | "gravedad";

type UiState = {
  addDrawer: AddTab | null;
  openAdd: (tab?: AddTab) => void;
  closeAdd: () => void;
  startDrawer: boolean;
  setStartDrawer: (open: boolean) => void;
  goalDrawer: boolean;
  setGoalDrawer: (open: boolean) => void;
  doctorsDrawer: boolean;
  setDoctorsDrawer: (open: boolean) => void;
  analysisOpen: boolean;
  setAnalysisOpen: (open: boolean) => void;
  orden: OrdenModo;
  setOrden: (orden: OrdenModo) => void;
};

export const useUi = create<UiState>((set) => ({
  addDrawer: null,
  openAdd: (tab = "individual") => set({ addDrawer: tab }),
  closeAdd: () => set({ addDrawer: null }),
  startDrawer: false,
  setStartDrawer: (open) => set({ startDrawer: open }),
  goalDrawer: false,
  setGoalDrawer: (open) => set({ goalDrawer: open }),
  doctorsDrawer: false,
  setDoctorsDrawer: (open) => set({ doctorsDrawer: open }),
  analysisOpen: false,
  setAnalysisOpen: (open) => set({ analysisOpen: open }),
  orden: "optimo",
  setOrden: (orden) => set({ orden }),
}));