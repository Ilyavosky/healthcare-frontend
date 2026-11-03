"use client";

import { Check, Dices, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Switch } from "@/components/ui/Switch";
import { LevelBadge } from "@/features/patients/components/LevelBadge";
import { usePatients } from "@/features/patients/store";
import { describeGoal } from "@/features/scenario/goal";
import { useScenario } from "@/features/scenario/store";
import { ApiError } from "@/lib/api/client";
import { generatePatients } from "@/lib/api/scenarios";
import { cn } from "@/lib/cn";
import { NIVEL_LISTA } from "@/lib/triage";
import {
  buildRandomScenario,
  MAX_RANDOM_DOCTORS,
  MAX_RANDOM_PATIENTS,
  MAX_SEED,
  type RandomScenario as Scenario,
} from "../scenario";

function clean(value: number, fallback: number) {
  return Number.isNaN(value) ? fallback : value;
}

function parseSeed(text: string): number | null | undefined {
  const value = text.trim();
  if (value === "") return null;
  if (!/^\d+$/.test(value)) return undefined;
  const seed = Number(value);
  return seed <= MAX_SEED ? seed : undefined;
}

function Toggle({ label, help, checked, onChange }: { label: string; help: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] font-medium text-text">{label}</p>
        <p className="text-xs text-muted">{help}</p>
      </div>
      <Switch checked={checked} onChange={onChange} aria-label={label} />
    </div>
  );
}

function describeDoctors(s: Scenario) {
  if (s.doctors === 1) return `1 médico, libre en el minuto ${s.doctorsFreeAt?.[0] ?? s.t0}`;
  if (!s.doctorsFreeAt) return `${s.doctors} médicos, libres en el minuto ${s.t0}`;
  return `${s.doctors} médicos, libres en los minutos ${s.doctorsFreeAt.join(", ")}`;
}

function describeStart(s: Scenario) {
  const atendidos = s.attended.length;
  return `Minuto ${s.t0} · ${atendidos === 0 ? "nadie atendido" : `${atendidos} ya ${atendidos === 1 ? "atendido" : "atendidos"}`}`;
}

function describeRandomGoal(s: Scenario) {
  const base = describeGoal(s.goal);
  if (s.goal.tipo !== "subconjunto") return base;
  const nombres = s.patients.filter((p) => s.goal.ids.includes(p.id)).map((p) => p.nombre);
  return `${base}: ${nombres.join(", ")}`;
}

function Preview({ scenario }: { scenario: Scenario }) {
  const conteo = NIVEL_LISTA.map((n) => ({ n, total: scenario.patients.filter((p) => p.nivel === n).length }));
  const filas = [
    ["Médicos", describeDoctors(scenario)],
    ["Inicio", describeStart(scenario)],
    ["Meta", describeRandomGoal(scenario)],
  ];

  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text">
          {scenario.patients.length} {scenario.patients.length === 1 ? "paciente" : "pacientes"}
        </p>
        <p className="text-xs text-muted">Semilla {scenario.seed}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {conteo.map(({ n, total }) => (
          <span key={n} className={cn("flex items-center gap-1.5 text-xs text-muted", total === 0 && "opacity-50")}>
            <LevelBadge nivel={n} />
            {total}
          </span>
        ))}
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        {filas.map(([label, texto]) => (
          <div key={label} className="flex gap-2">
            <dt className="w-14 shrink-0 text-muted">{label}</dt>
            <dd className="min-w-0 flex-1 text-text">{texto}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RandomScenario({ onDone }: { onDone: () => void }) {
  const replacePatients = usePatients((s) => s.replace);
  const loadScenario = useScenario((s) => s.load);
  const [n, setN] = useState(12);
  const [doctors, setDoctors] = useState(2);
  const [seedText, setSeedText] = useState("");
  const [randomStart, setRandomStart] = useState(false);
  const [randomGoal, setRandomGoal] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const seed = parseSeed(seedText);
  const seedError = seed === undefined ? `Escribe un entero de 0 a ${MAX_SEED.toLocaleString("es-MX")}.` : null;

  function change<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setScenario(null);
    };
  }

  async function generar() {
    if (seed === undefined) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const options = {
      n: Math.max(1, clean(n, 1)),
      doctors: Math.max(1, clean(doctors, 1)),
      randomStart,
      randomGoal,
    };
    setLoading(true);
    setError(null);
    try {
      const response = await generatePatients({ n: options.n, ...(seed !== null && { seed }) }, current.signal);
      setScenario(buildRandomScenario(response.seed, response.patients, options));
    } catch (e) {
      if (current.signal.aborted) return;
      setScenario(null);
      setError(e instanceof ApiError ? e.message : "No se pudo generar el escenario.");
    } finally {
      if (!current.signal.aborted) setLoading(false);
    }
  }

  function usar() {
    if (!scenario) return;
    replacePatients(scenario.patients);
    loadScenario(scenario);
    onDone();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6">
        <p className="rounded-[10px] bg-bluebg px-3 py-2.5 text-xs text-text">
          Crea un escenario de prueba. Al usarlo reemplaza a los pacientes, los médicos, el inicio y la meta actuales.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-text">Pacientes (N)</p>
            <NumberStepper
              value={n}
              onChange={change(setN)}
              min={1}
              max={MAX_RANDOM_PATIENTS}
              aria-label="Número de pacientes aleatorios"
            />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-text">Médicos (M)</p>
            <NumberStepper
              value={doctors}
              onChange={change(setDoctors)}
              min={1}
              max={MAX_RANDOM_DOCTORS}
              aria-label="Número de médicos del escenario aleatorio"
            />
          </div>
        </div>

        <div>
          <label htmlFor="semilla" className="mb-2 block text-[13px] font-medium text-text">
            Semilla (opcional)
          </label>
          <input
            id="semilla"
            inputMode="numeric"
            value={seedText}
            onChange={(e) => change(setSeedText)(e.target.value)}
            placeholder="Al azar"
            aria-invalid={!!seedError}
            className={cn(
              "h-11 w-full rounded-[10px] border bg-surface px-3.5 text-[15px] text-text outline-none placeholder:text-subtle focus:border-blue focus:ring-2 focus:ring-blue/30",
              seedError ? "border-n1" : "border-border",
            )}
          />
          <p className={cn("mt-1.5 text-xs", seedError ? "text-n1" : "text-muted")}>
            {seedError ?? "Con la misma semilla y las mismas opciones se obtiene el mismo escenario."}
          </p>
        </div>

        <div className="space-y-4">
          <Toggle
            label="Inicio aleatorio"
            help="Minuto actual, pacientes ya atendidos y cuándo se libera cada médico."
            checked={randomStart}
            onChange={change(setRandomStart)}
          />
          <Toggle
            label="Meta aleatoria"
            help="Una de las cinco metas, con su valor al azar."
            checked={randomGoal}
            onChange={change(setRandomGoal)}
          />
        </div>

        <Button type="button" variant="outline" className="w-full" disabled={loading || !!seedError} onClick={generar}>
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Dices size={16} />}
          {scenario && seed === null ? "Generar otro" : "Generar"}
        </Button>

        {error && (
          <div className="flex gap-2 rounded-[10px] bg-n1/10 px-3 py-2.5 text-[13px] text-n1" role="alert">
            <TriangleAlert size={16} className="mt-px shrink-0" />
            {error}
          </div>
        )}

        {scenario && <Preview scenario={scenario} />}
      </div>

      <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="button" disabled={!scenario || loading} onClick={usar}>
          <Check size={16} />
          Usar escenario
        </Button>
      </div>
    </div>
  );
}
