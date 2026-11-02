import { fmt } from "@/lib/format";
import { NIVELES } from "@/lib/triage";
import type { Frame, FrameNode } from "../frames";

const STEP_X = 100;
const LEAF_H = 70;
const PAD_X = 56;
const PAD_Y = 46;
const R = 22;

const NAVY = "#1e3a5f";
const BROWN = "#7c4a1e"; // costo del paso
const RED = "#c81e1e"; // h
const GRAY = "#8a93a1";

const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: 4, strokeLinejoin: "round" } as const;

/** Acomoda los nodos como un árbol: la rama con menor f queda arriba y recta. */
function acomodar(nodes: FrameNode[]) {
  const hijos = new Map<number, FrameNode[]>();
  let raiz: FrameNode | undefined;
  for (const n of nodes) {
    if (n.parent < 0) raiz = n;
    else hijos.set(n.parent, [...(hijos.get(n.parent) ?? []), n]);
  }
  const pos = new Map<number, { x: number; y: number }>();
  let hoja = 0;
  const visitar = (n: FrameNode): number => {
    const ks = (hijos.get(n.id) ?? []).sort((a, b) => a.f - b.f || a.id - b.id);
    let fila: number;
    if (ks.length === 0) {
      fila = hoja++;
    } else {
      // El nodo se alinea con su mejor hijo; los demás hijos quedan debajo
      fila = visitar(ks[0]);
      for (const k of ks.slice(1)) visitar(k);
    }
    pos.set(n.id, { x: PAD_X + n.depth * STEP_X, y: PAD_Y + fila * LEAF_H });
    return fila;
  };
  if (raiz) visitar(raiz);
  return pos;
}

type Props = { frame: Frame; niveles: number; rutasVisibles: number; durationMs: number };

export function SearchTreeGraph({ frame, niveles, rutasVisibles, durationMs }: Props) {
  const pos = acomodar(frame.nodes);
  const width = PAD_X * 2 + niveles * STEP_X;
  const height = PAD_Y * 2 + rutasVisibles * LEAF_H;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      style={{ minWidth: 760, "--dur": `${durationMs}ms` } as React.CSSProperties}
      role="img"
      aria-label="Grafo de búsqueda del algoritmo"
    >
      {/* Aristas: el paso de un paciente a otro, con su costo */}
      {frame.nodes
        .filter((n) => n.parent >= 0)
        .map((n) => {
          const a = pos.get(n.parent);
          const b = pos.get(n.id);
          if (!a || !b) return null;
          const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
          const path = n.status === "path";
          return (
            <path
              key={`e-${n.id}`}
              className="graph-edge"
              d={d}
              style={{ d: `path("${d}")` } as React.CSSProperties}
              fill="none"
              stroke={path ? NAVY : GRAY}
              strokeWidth={path ? 4 : 1.8}
              strokeDasharray={n.status === "open" ? "5 5" : undefined}
            />
          );
        })}
      {frame.nodes
        .filter((n) => n.parent >= 0)
        .map((n) => {
          const a = pos.get(n.parent);
          const b = pos.get(n.id);
          if (!a || !b) return null;
          return (
            <text
              key={`c-${n.id}`}
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 8}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={BROWN}
              style={halo}
            >
              {fmt(n.cost)}
            </text>
          );
        })}

      {/* Nodos */}
      {frame.nodes.map((n) => {
        const p = pos.get(n.id);
        if (!p) return null;
        const color = n.nivel ? NIVELES[n.nivel].hex : "#fff";
        const abierto = n.status === "open";
        const raiz = n.parent < 0;
        const oscuro = n.nivel === 3;
        return (
          <g key={`n-${n.id}`} className="graph-node" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            <title>{`${n.label} · g = ${fmt(n.g)} · h = ${fmt(n.h)} · f = ${fmt(n.f)}`}</title>
            {n.current && <circle r={R + 7} fill="none" stroke="#2f7bd6" strokeWidth={2.5} opacity={0.55} />}
            <circle
              r={R}
              fill={raiz ? "#fff" : abierto ? "#fff" : color}
              stroke={raiz ? NAVY : abierto ? color : "none"}
              strokeWidth={2.5}
              strokeDasharray={abierto ? "4 3" : undefined}
            />
            <text
              y={4.5}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={raiz ? NAVY : abierto ? NAVY : oscuro ? "#4a3500" : "#fff"}
            >
              {n.label}
            </text>
            {/* h: lo que se estima que falta */}
            <text x={R * 0.8} y={-R * 0.9} fontSize={12} fontWeight={700} fill={RED} style={halo}>
              {fmt(n.h)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}