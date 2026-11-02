import type { AlgorithmName, AlgorithmResultOut, SolveResponse } from "@/lib/api/types";
import { fmt } from "@/lib/format";

export const ALGORITHM_LABELS: Record<AlgorithmName, string> = {
  ucs: "Costo uniforme",
  astar_simple: "A* (h simple)",
  astar: "A*",
};

function ms(value: number) {
  return value < 1 ? "<1 ms" : value < 1000 ? `${fmt(value)} ms` : `${(value / 1000).toFixed(1)} s`;
}

export function describeReference(data: SolveResponse): string {
  const result = data.reference === "baseline" ? undefined : data.results[data.reference];
  if (data.referenceKind === "baseline" || !result) {
    return "Escenario muy grande para resolverlo a tiempo: se muestra el orden por gravedad.";
  }
  const name = ALGORITHM_LABELS[data.reference as AlgorithmName];
  if (data.referenceKind === "anytime" && result.anytime) {
    const intento = result.limitAttempts[0];
    return `${name} no terminó a tiempo (${fmt(intento?.expanded ?? 0)} nodos): agenda completada desde el mejor nodo · el óptimo es al menos ${fmt(result.anytime.lowerBound)}`;
  }
  const stats = [
    result.expanded !== null && `${fmt(result.expanded)} nodos`,
    result.ms !== null && ms(result.ms),
  ].filter(Boolean);
  const kind = data.referenceKind === "approximate" ? `Aproximado con ${name} ponderado (ε = ${result.weight})` : `Óptimo con ${name}`;
  return [kind, ...stats].join(" · ");
}

export function describeComparacion(ucs: AlgorithmResultOut | null, astar: AlgorithmResultOut | undefined): string | null {
  if (!ucs) return null;
  if (ucs.status === "limit_reached" || ucs.expanded === null) {
    const intento = ucs.limitAttempts[0];
    return `Costo uniforme no terminó a tiempo (${fmt(intento?.expanded ?? 0)} nodos en ${ms(intento?.ms ?? 0)}).`;
  }
  const base = `Costo uniforme: ${fmt(ucs.expanded)} nodos en ${ms(ucs.ms ?? 0)}`;
  if (astar?.status === "optimal" && astar.expanded !== null && astar.cost !== null && ucs.expanded > 0) {
    if (ucs.cost !== astar.cost) {
      return `${base} · Los costos no coinciden: Costo uniforme ${fmt(ucs.cost ?? 0)} y A* ${fmt(astar.cost)}.`;
    }
    const ahorro = Math.round(1000 * (1 - astar.expanded / ucs.expanded)) / 10;
    return `${base} · A* expande ${ahorro} % menos nodos con el mismo costo (${fmt(astar.cost)}).`;
  }
  return `${base}.`;
}
