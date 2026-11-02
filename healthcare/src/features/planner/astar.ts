import type { Patient } from "@/features/patients/types";
import { NIVELES } from "@/lib/triage";
import { costo } from "./cost";
import { heuristica } from "./heuristic";

export type TraceNode = {
  id: number;
  mask: bigint;
  parent: number;
  patient: number;
  depth: number;
  g: number;
  h: number;
  cost: number;
  elapsed: number;
};

export type TraceEvent = { expanded: number; generated: number[] };

export type SearchTrace = {
  patients: Patient[];
  nodes: TraceNode[];
  events: TraceEvent[];
  goal: number;
  exacto: boolean;
  cota: number;
};

const ZERO = BigInt(0);
const ONE = BigInt(1);

export const LIMITE_MS = 1500;
export const LIMITE_NODOS = 60000;

class MinHeap {
  private a: { k: [number, number, number]; id: number }[] = [];
  get size() {
    return this.a.length;
  }
  private less(x: [number, number, number], y: [number, number, number]) {
    return x[0] !== y[0] ? x[0] < y[0] : x[1] !== y[1] ? x[1] < y[1] : x[2] < y[2];
  }
  push(k: [number, number, number], id: number) {
    const a = this.a;
    a.push({ k, id });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i].k, a[p].k)) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop(): number {
    const a = this.a;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l].k, a[m].k)) m = l;
        if (r < a.length && this.less(a[r].k, a[m].k)) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top.id;
  }
}

export function ejecutarAEstrella(patients: Patient[], t0: number): SearchTrace {
  const n = patients.length;
  const bit = (j: number) => ONE << BigInt(j);
  const full = (ONE << BigInt(n)) - ONE;
  const restantes = (mask: bigint) => patients.filter((_, j) => !(mask & bit(j)));

  const nodes: TraceNode[] = [];
  const events: TraceEvent[] = [];
  const mejor = new Map<bigint, number>();
  const open = new MinHeap();

  const crear = (mask: bigint, parent: number, patient: number, depth: number, g: number, cost: number, elapsed: number, h?: number) => {
    const hh = h ?? heuristica(restantes(mask), t0 + elapsed);
    const node: TraceNode = { id: nodes.length, mask, parent, patient, depth, g, h: hh, cost, elapsed };
    nodes.push(node);
    mejor.set(mask, node.id);
    open.push([g + hh, -depth, node.id], node.id);
    return node;
  };

  crear(ZERO, -1, -1, 0, 0, 0, 0);
  let goal = -1;
  let cota = 0;
  const inicio = performance.now();
  let iter = 0;
  let agotado = false;

  while (open.size > 0) {
    if (++iter % 32 === 0 && (performance.now() - inicio > LIMITE_MS || nodes.length > LIMITE_NODOS)) {
      agotado = true;
      break;
    }
    const id = open.pop();
    const node = nodes[id];
    if (mejor.get(node.mask) !== id) continue; // ya existe un camino mejor a este estado
    if (node.mask === full) {
      goal = id;
      cota = node.g;
      break;
    }
    const start = t0 + node.elapsed;
    const generated: number[] = [];
    for (let j = 0; j < n; j++) {
      if (node.mask & bit(j)) continue;
      const mask = node.mask | bit(j);
      const c = costo(patients[j], start);
      const g = node.g + c;
      const prev = mejor.get(mask);
      if (prev !== undefined && nodes[prev].g <= g) continue;
      generated.push(crear(mask, id, j, node.depth + 1, g, c, node.elapsed + patients[j].duracion).id);
    }
    events.push({ expanded: id, generated });
  }

  if (agotado) {
    let id = -1;
    while (open.size > 0) {
      const c = open.pop();
      if (mejor.get(nodes[c].mask) === c) {
        id = c;
        break;
      }
    }
    if (id < 0) id = 0;
    cota = nodes[id].g + nodes[id].h;

    let cur = nodes[id];
    const pend = patients
      .map((p, j) => ({ p, j }))
      .filter(({ j }) => !(cur.mask & bit(j)))
      .sort((a, b) => NIVELES[b.p.nivel].peso / b.p.duracion - NIVELES[a.p.nivel].peso / a.p.duracion);
    for (const { p, j } of pend) {
      const c = costo(p, t0 + cur.elapsed);
      const nodo: TraceNode = {
        id: nodes.length,
        mask: cur.mask | bit(j),
        parent: cur.id,
        patient: j,
        depth: cur.depth + 1,
        g: cur.g + c,
        h: 0,
        cost: c,
        elapsed: cur.elapsed + p.duracion,
      };
      nodes.push(nodo);
      cur = nodo;
    }
    goal = cur.id;
  }

  return { patients, nodes, events, goal, exacto: !agotado, cota };
}