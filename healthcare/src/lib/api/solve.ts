import { apiPost } from "./client";
import type { SolveRequest, SolveResponse } from "./types";

export function solveScenario(request: SolveRequest, signal?: AbortSignal): Promise<SolveResponse> {
  return apiPost<SolveResponse>("/api/solve", request, signal);
}
