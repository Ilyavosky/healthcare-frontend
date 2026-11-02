import { create } from "zustand";
import { toApiError, type ApiError } from "@/lib/api/client";
import { solveScenario } from "@/lib/api/solve";
import type { SolveRequest, SolveResponse } from "@/lib/api/types";

export type SolveStatus = "idle" | "loading" | "success" | "error";

type SolveState = {
  status: SolveStatus;
  data: SolveResponse | null;
  error: ApiError | null;
  run: (request: SolveRequest | null) => Promise<void>;
};

let controller: AbortController | null = null;

export const useSolve = create<SolveState>((set) => ({
  status: "idle",
  data: null,
  error: null,
  run: async (request) => {
    controller?.abort();
    controller = null;
    if (!request) {
      set({ status: "idle", data: null, error: null });
      return;
    }
    const current = new AbortController();
    controller = current;
    set({ status: "loading", error: null });
    try {
      const data = await solveScenario(request, current.signal);
      if (controller === current) set({ status: "success", data, error: null });
    } catch (error) {
      if (current.signal.aborted) return;
      set({ status: "error", data: null, error: toApiError(error) });
    }
  },
}));
