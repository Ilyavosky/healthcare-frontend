import { create } from "zustand";

export type AddTab = "individual" | "excel";

type UiState = {
  addDrawer: AddTab | null;
  openAdd: (tab?: AddTab) => void;
  closeAdd: () => void;
  startDrawer: boolean;
  setStartDrawer: (open: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  addDrawer: null,
  openAdd: (tab = "individual") => set({ addDrawer: tab }),
  closeAdd: () => set({ addDrawer: null }),
  startDrawer: false,
  setStartDrawer: (open) => set({ startDrawer: open }),
}));