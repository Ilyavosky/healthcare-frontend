"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/cn";

export const VELOCIDADES = [0.5, 1, 2, 4] as const;

type Props = {
  index: number;
  last: number;
  playing: boolean;
  speed: number;
  onPlayPause: () => void;
  onStep: (delta: number) => void;
  onSeek: (index: number) => void;
  onRestart: () => void;
  onSpeed: (speed: number) => void;
};

const iconBtn =
  "flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-navy hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40";

export function PlaybackControls({ index, last, playing, speed, onPlayPause, onStep, onSeek, onRestart, onSpeed }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3">
      <button type="button" className={iconBtn} aria-label="Reiniciar" onClick={onRestart}>
        <RotateCcw size={16} />
      </button>
      <button type="button" className={iconBtn} aria-label="Paso atrás" disabled={index === 0} onClick={() => onStep(-1)}>
        <SkipBack size={16} />
      </button>
      <button
        type="button"
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-navy text-white hover:bg-navy/90"
        aria-label={playing ? "Pausar" : "Reproducir"}
        onClick={onPlayPause}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button type="button" className={iconBtn} aria-label="Paso adelante" disabled={index === last} onClick={() => onStep(1)}>
        <SkipForward size={16} />
      </button>

      <input
        type="range"
        min={0}
        max={last}
        value={index}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Progreso de la búsqueda"
        className="mx-1 min-w-40 flex-1 cursor-pointer accent-[#1e3a5f]"
      />
      <span className="w-28 whitespace-nowrap text-right text-xs tabular-nums text-muted">
        Paso {index} / {last}
      </span>

      <div className="flex rounded-lg border border-border bg-surface p-0.5" role="group" aria-label="Velocidad">
        {VELOCIDADES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onSpeed(v)}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold",
              speed === v ? "bg-navy text-white" : "text-muted hover:text-navy",
            )}
          >
            {v}×
          </button>
        ))}
      </div>
    </div>
  );
}