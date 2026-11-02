import type { SearchTrace } from "@/features/planner/astar";
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
  cota: number;
  ruta: string[];
};

export function construirFotogramas(trace: SearchTrace, rutasVisibles = 5, maxFotogramas = 600): Frames {
  const { nodes, events, patients, goal, exacto, cota } = trace;
  const stride = Math.max(1, Math.ceil(events.length / maxFotogramas));

  const open = new Set<number>([0]);
  const expanded = new Set<number>();
  const latest = new Map<bigint, number>();
  latest.set(nodes[0].mask, 0);

  const meta = new Set<number>();
  for (let id = goal; id >= 0; id = nodes[id].parent) meta.add(id);

  const f = (id: number) => nodes[id].g + nodes[id].h;

  function fotograma(current: number, done: boolean): Frame {
    const semillas = [...open].sort((a, b) => f(a) - f(b) || nodes[b].depth - nodes[a].depth).slice(0, rutasVisibles);
    if (current >= 0) semillas.push(current);
    if (done) semillas.push(goal);

    const ids = new Set<number>();
    for (const s of semillas) for (let id = s; id >= 0; id = nodes[id].parent) ids.add(id);

    const lista: FrameNode[] = [...ids]
      .sort((a, b) => nodes[a].depth - nodes[b].depth || a - b)
      .map((id) => {
        const n = nodes[id];
        const p = n.patient >= 0 ? patients[n.patient] : undefined;
        return {
          id,
          parent: n.parent,
          label: p ? p.id : "Ø",
          nivel: p?.nivel,
          depth: n.depth,
          g: n.g,
          h: n.h,
          f: n.g + n.h,
          cost: n.cost,
          status: done && meta.has(id) ? "path" : expanded.has(id) ? "expanded" : "open",
          current: id === current && !done,
        };
      });

    let minF = Infinity;
    for (const id of open) minF = Math.min(minF, f(id));
    return {
      nodes: lista,
      expandidos: expanded.size,
      frontera: open.size,
      generados: nodes.length,
      minF: done ? nodes[goal].g : minF,
      done,
    };
  }

  const frames: Frame[] = [fotograma(-1, false)];

  events.forEach((e, i) => {
    open.delete(e.expanded);
    expanded.add(e.expanded);
    for (const id of e.generated) {
      const old = latest.get(nodes[id].mask);
      if (old !== undefined) open.delete(old);
      latest.set(nodes[id].mask, id);
      open.add(id);
    }
    if (i % stride === 0 && i < events.length - 1) frames.push(fotograma(e.expanded, false));
  });

  open.delete(goal);
  expanded.add(goal);
  frames.push(fotograma(-1, true));

  const ruta = [...meta]
    .reverse()
    .filter((id) => nodes[id].patient >= 0)
    .map((id) => patients[nodes[id].patient].id);

  return { frames, total: nodes[goal].g, exacto, cota, ruta };
}