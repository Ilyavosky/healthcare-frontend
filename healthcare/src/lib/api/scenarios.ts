import { apiPost } from "./client";
import type { GenerateRequest, GenerateResponse } from "./types";

export function generatePatients(request: GenerateRequest, signal?: AbortSignal): Promise<GenerateResponse> {
  return apiPost<GenerateResponse>("/api/scenarios/generate", request, signal);
}
