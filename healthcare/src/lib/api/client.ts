export class ApiError extends Error {
  readonly code: string;
  readonly field: string | null;
  readonly status: number;

  constructor(message: string, code: string, field: string | null = null, status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.field = field;
    this.status = status;
  }
}

type ErrorBody = { code?: string; message?: string; field?: string | null };

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", "Content-Type": "application/json", ...init.headers },
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError("No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.", "NETWORK_ERROR");
  }
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  throw new ApiError(
    body.message ?? `El servidor respondió con error ${response.status}`,
    body.code ?? "HTTP_ERROR",
    body.field ?? null,
    response.status,
  );
}

export function apiPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body), signal });
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError("Ocurrió un error inesperado al calcular el orden", "CLIENT_ERROR");
}
