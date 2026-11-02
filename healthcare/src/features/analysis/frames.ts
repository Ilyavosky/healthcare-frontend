import type { Patient } from "@/features/patients/types";
import type { AlgorithmResultOut } from "@/lib/api/types";
import type { Nivel } from "@/lib/triage";

export type FrameStatus = "expanded" | "open" | "path";

export type FrameNode = {
  id: number;
  parent: number;
  label: string;
  nivel?: Nivel;
  depth: number;
  g: number;
  h: number;
  f: number;
  cost: number;
  status: FrameStatus;
  current: boolean;
};

export type Frame = {
  nodes: FrameNode[];
  expandidos: number;
  frontera: number;
  generados: number;
  minF: number;
  done: boolean;
};

export type Frames = {
  frames: Frame[];
  total: number;
  exacto: boolean;
  peso: number;
  cota: number;
  ruta: string[];
  cierre: string[];
  expandidos: number;
  trazados: number;
  completa: boolean;
  profundidad: number;
};

type Nodo = Omit<FrameNode, "status" | "current">;

type Evento = { expanded: number; generated: number[] };

export const META = "META";

function mejores(open: Set<number>, nodos: Map<number, Nodo>, k: number): number[] {
  const top: number[] = [];
  const antes = (a: number, b: number) => {
    const x = nodos.get(a)!;
    const y = nodos.get(b)!;
    return x.f !== y.f ? x.f < y.f : x.depth !== y.depth ? x.depth > y.depth : a < b;
  };
  for (const id of open) {
    if (top.length < k) {
      top.push(id);
      top.sort((a, b) => (antes(a, b) ? -1 : 1));
    } else if (antes(id, top[k - 1])) {
      top[k - 1] = id;
      top.sort((a, b) => (antes(a, b) ? -1 : 1));
    }
  }
  return top;
}

export function construirFotogramas(
  result: AlgorithmResultOut,
  patients: Patient[],
  rutasVisibles = 5,
  maxFotogramas = 600,
): Frames {
  const nivelDe = new Map(patients.map((p) => [p.id, p.nivel]));
  const trace = result.trace;
  const raiz = trace[0];
  const nodos = new Map<number, Nodo>();
  nodos.set(raiz.id, { id: raiz.id, parent: -1, label: "Ø", depth: 0, g: raiz.g, h: raiz.h, f: raiz.f, cost: 0 });

  const events: Evento[] = [];
  let profundidad = 0;
  for (const row of trace) {
    const padre = nodos.get(row.id);
    if (!padre) break;
    const generated: number[] = [];
    for (const child of row.children) {
      const depth = padre.depth + 1;
      profundidad = Math.max(profundidad, depth);
      nodos.set(child.id, {
        id: child.id,
        parent: row.id,
        label: child.patient ?? META,
        nivel: child.patient ? nivelDe.get(child.patient) : undefined,
        depth,
        g: child.g,
        h: child.h,
        f: child.f,
        cost: child.g - row.g,
      });
      generated.push(child.id);
    }
    events.push({ expanded: row.id, generated });
  }

  const ultima = trace[trace.length - 1];
  const goal = ultima.isGoal && nodos.has(ultima.id) ? ultima.id : -1;
  const meta = new Set<number>();
  for (let id = goal; id >= 0; id = nodos.get(id)?.parent ?? -1) meta.add(id);

  const stride = Math.max(1, Math.ceil(events.length / maxFotogramas));
  const open = new Set<number>([raiz.id]);
  const expanded = new Set<number>();

  function fotograma(current: number, done: boolean): Frame {
    const semillas = mejores(open, nodos, rutasVisibles);
    if (current >= 0) semillas.push(current);
    if (done && goal >= 0) semillas.push(goal);

    const ids = new Set<number>();
    for (const s of semillas) for (let id = s; id >= 0 && !ids.has(id); id = nodos.get(id)?.parent ?? -1) ids.add(id);

    const lista: FrameNode[] = [...ids]
      .map((id) => nodos.get(id)!)
      .sort((a, b) => a.depth - b.depth || a.id - b.id)
      .map((n) => ({
        ...n,
        status: done && meta.has(n.id) ? "path" : expanded.has(n.id) ? "expanded" : "open",
        current: n.id === current && !done,
      }));

    let minF = Infinity;
    for (const id of open) minF = Math.min(minF, nodos.get(id)!.f);
    return {
      nodes: lista,
      expandidos: expanded.size,
      frontera: open.size,
      generados: nodos.size,
      minF: done ? result.cost ?? minF : minF,
      done,
    };
  }

  const frames: Frame[] = [fotograma(-1, false)];
  events.forEach((e, i) => {
    open.delete(e.expanded);
    expanded.add(e.expanded);
    for (const id of e.generated) open.add(id);
    if (i % stride === 0 && i < events.length - 1) frames.push(fotograma(e.expanded, false));
  });
  frames.push(fotograma(-1, true));

  const peso = result.weight;
  const total = result.cost ?? 0;
  return {
    frames,
    total,
    exacto: result.status === "optimal",
    peso,
    cota: peso > 1 ? Math.ceil(total / peso) : total,
    ruta: result.steps.map((s) => s.patient),
    cierre: result.leftOut.map((s) => s.patient),
    expandidos: result.expanded ?? expanded.size,
    trazados: events.length,
    completa: goal >= 0,
    profundidad: Math.max(1, profundidad),
  };
}
