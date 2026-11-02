"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/format";
import { NIVELES } from "@/lib/triage";
import type { Estado, FilaTabla } from "../types";
import { LevelBadge } from "./LevelBadge";

const COLS =
  "grid grid-cols-[40px_minmax(140px,1fr)_90px_80px_84px_64px_86px_86px_104px_104px_150px] items-center gap-3";

const dash = <span className="text-subtle">—</span>;

const ESTADO: Record<Exclude<Estado, "sin_plan">, { texto: string; clase: string }> = {
  atendido: { texto: "Atendido", clase: "bg-bg text-muted" },
  a_tiempo: { texto: "A tiempo", clase: "bg-[#e6f4ee] text-ok" },
  retraso: { texto: "Con retraso", clase: "bg-amberbg text-amber" },
  fuera_meta: { texto: "Fuera de la meta", clase: "bg-bg text-muted" },
};

const DURACION_MS = 550;

export function PatientTable({ filas }: { filas: FilaTabla[] }) {
  const filasRef = useRef(new Map<string, HTMLLIElement>());
  const alturas = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ahora = new Map<string, number>();
    const habiaFilas = alturas.current.size > 0;
    filasRef.current.forEach((el, id) => {
      const top = el.offsetTop;
      ahora.set(id, top);
      if (reducir) return;
      const antes = alturas.current.get(id);
      if (antes === undefined) {
        if (habiaFilas) el.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
      } else if (Math.abs(antes - top) > 1) {
        el.animate([{ transform: `translateY(${antes - top}px)` }, { transform: "translateY(0)" }], {
          duration: DURACION_MS,
          easing: "cubic-bezier(0.22, 0.8, 0.25, 1)",
        });
      }
    });
    alturas.current = ahora;
  });

  return (
    <div className="overflow-x-auto px-5 pb-2 pt-4">
      <div className="min-w-[1240px]">
        <div className={cn(COLS, "px-3 pb-2 text-xs text-muted")}>
          <span>#</span>
          <span>Paciente</span>
          <span>Nivel</span>
          <span>Espera</span>
          <span>Consulta</span>
          <span>Médico</span>
          <span>Inicia en</span>
          <span>Termina en</span>
          <span>Sobre límite</span>
          <span>Penalización</span>
          <span>Estado</span>
        </div>
        <ul className="space-y-2">
          {filas.map(({ patient: p, inicia, termina, sobre, penal, medico, estado, notas }, i) => (
            <li
              key={p.id}
              ref={(el) => {
                if (el) filasRef.current.set(p.id, el);
                else filasRef.current.delete(p.id);
              }}
              className={cn(
                COLS,
                "relative overflow-hidden rounded-[10px] border border-border bg-surface py-3 pl-4 pr-3",
                estado === "atendido" && "opacity-60",
              )}
            >
              <span className={cn("absolute inset-y-0 left-0 w-1", NIVELES[p.nivel].bar)} />
              <span className="text-[13px] text-muted">{i + 1}</span>
              <span className="text-sm font-semibold text-text">{p.nombre}</span>
              <span>
                <LevelBadge nivel={p.nivel} />
              </span>
              <span className="text-[13px] text-muted">{p.espera} min</span>
              <span className="text-[13px] text-muted">{p.duracion} min</span>
              <span className="text-[13px] text-text tabular-nums">{medico === null ? dash : medico}</span>
              <span className="text-[13px] text-text tabular-nums">{inicia === null ? dash : `Min ${fmt(inicia)}`}</span>
              <span className="text-[13px] text-text tabular-nums">{termina === null ? dash : `Min ${fmt(termina)}`}</span>
              <span className={cn("text-[13px] tabular-nums", sobre ? "text-text" : "text-muted")}>
                {sobre === null ? dash : `${fmt(sobre)} min`}
              </span>
              <span className={cn("text-[13px] font-semibold tabular-nums", penal ? "text-navy" : "text-muted")}>
                {penal === null ? dash : fmt(penal)}
              </span>
              <span className="flex flex-col items-start gap-1">
                {estado === "sin_plan" ? (
                  dash
                ) : (
                  <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", ESTADO[estado].clase)}>
                    {ESTADO[estado].texto}
                  </span>
                )}
                {notas.map((nota) => (
                  <span key={nota.texto} className={cn("text-[11px] leading-tight", nota.critica ? "font-semibold text-n1" : "text-muted")}>
                    {nota.texto}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
