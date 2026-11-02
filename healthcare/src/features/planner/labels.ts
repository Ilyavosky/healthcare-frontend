import type { AlgorithmName, SolveResponse } from "@/lib/api/types";

export const ALGORITHM_LABELS: Record<AlgorithmName, string> = {
  ucs: "Costo uniforme",
  astar_simple: "A* (h simple)",
  astar: "A*",
};

export function describeReference(data: SolveResponse): string {
  if (data.reference === "baseline") {
    return "Escenario muy grande para resolverlo exacto a tiempo: se muestra el orden por gravedad.";
  }
  const result = data.results[data.reference];
  const name = ALGORITHM_LABELS[data.reference];
  if (!result) return name;
  const stats = [
    result.expanded !== null && `${result.expanded.toLocaleString("es-MX")} nodos`,
    result.ms !== null && (result.ms < 1 ? "<1 ms" : `${Math.round(result.ms).toLocaleString("es-MX")} ms`),
  ].filter(Boolean);
  const kind = result.status === "approximate" ? `Aproximado con ${name} ponderado (w = ${result.weight})` : `Óptimo con ${name}`;
  return [kind, ...stats].join(" · ");
}
