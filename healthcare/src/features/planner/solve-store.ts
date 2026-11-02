import { create } from "zustand";
import { toApiError, type ApiError } from "@/lib/api/client";
import { solveScenario } from "@/lib/api/solve";
import type { AlgorithmResultOut, SolveRequest, SolveResponse } from "@/lib/api/types";

export type SolveStatus = "idle" | "loading" | "success" | "error";

export type Comparacion = {
  key: string;
  status: "loading" | "success" | "error" | "paused";
  ucs: AlgorithmResultOut | null;
};

type SolveState = {
  status: SolveStatus;
  key: string | null;
  data: SolveResponse | null;
  error: ApiError | null;
  comparacion: Comparacion | null;
  run: (request: SolveRequest | null) => Promise<void>;
  adoptar: (key: string, data: SolveResponse) => void;
  pausarComparacion: () => void;
  reanudarComparacion: () => void;
};

let controller: AbortController | null = null;
let comparador: AbortController | null = null;
let ultima: { request: SolveRequest; key: string } | null = null;

export function requestKey(request: SolveRequest | null): string | null {
  return request ? JSON.stringify(request) : null;
}

export const useSolve = create<SolveState>((set, get) => {
  async function comparar(request: SolveRequest, key: string) {
    const current = new AbortController();
    comparador = current;
    set({ comparacion: { key, status: "loading", ucs: null } });
    try {
      const data = await solveScenario({ ...request, algorithms: ["ucs"] }, current.signal);
      if (comparador === current) set({ comparacion: { key, status: "success", ucs: data.results.ucs ?? null } });
    } catch {
      if (!current.signal.aborted) set({ comparacion: { key, status: "error", ucs: null } });
    }
  }

  return {
    status: "idle",
    key: null,
    data: null,
    error: null,
    comparacion: null,
    run: async (request) => {
      controller?.abort();
      comparador?.abort();
      controller = null;
      comparador = null;
      ultima = null;
      const key = requestKey(request);
      if (!request || !key) {
        set({ status: "idle", key: null, data: null, error: null, comparacion: null });
        return;
      }
      const current = new AbortController();
      controller = current;
      set({ status: "loading", error: null });
      try {
        const data = await solveScenario(request, current.signal);
        if (controller !== current) return;
        set({ status: "success", key, data, error: null });
        ultima = { request, key };
        void comparar(request, key);
      } catch (error) {
        if (current.signal.aborted) return;
        set({ status: "error", key, data: null, error: toApiError(error) });
      }
    },
    adoptar: (key, data) => {
      if (get().key === key && get().status === "success") set({ data });
    },
    pausarComparacion: () => {
      const actual = get().comparacion;
      if (actual?.status !== "loading") return;
      comparador?.abort();
      comparador = null;
      set({ comparacion: { ...actual, status: "paused" } });
    },
    reanudarComparacion: () => {
      const actual = get().comparacion;
      if (actual?.status === "paused" && ultima && ultima.key === actual.key) void comparar(ultima.request, ultima.key);
    },
  };
});
