import { create } from "zustand";

export type AddTab = "individual" | "excel";

type UiState = {
  addDrawer: AddTab | null;
  openAdd: (tab?: AddTab) => void;
  closeAdd: () => void;
};

export const useUi = create<UiState>((set) => ({
  addDrawer: null,
  openAdd: (tab = "individual") => set({ addDrawer: tab }),
  closeAdd: () => set({ addDrawer: null }),
}));