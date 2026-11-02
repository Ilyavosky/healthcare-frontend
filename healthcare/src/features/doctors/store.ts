import { create } from "zustand";

type DoctorsState = {
  count: number;
  setCount: (count: number) => void;
  reset: () => void;
};

export const useDoctors = create<DoctorsState>((set) => ({
  count: 1,
  setCount: (count) => set({ count }),
  reset: () => set({ count: 1 }),
}));