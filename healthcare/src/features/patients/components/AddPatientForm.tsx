"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { cn } from "@/lib/cn";
import { NIVEL_LISTA, NIVELES, type Nivel } from "@/lib/triage";
import { usePatients } from "../store";
import { LevelBadge } from "./LevelBadge";

type Errors = { nombre?: string; nivel?: string; espera?: string; duracion?: string };

export function AddPatientForm({ onDone }: { onDone: () => void }) {
  const addPatient = usePatients((s) => s.addPatient);
  const [nombre, setNombre] = useState("");
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [espera, setEspera] = useState(0);
  const [duracion, setDuracion] = useState(15);
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (nombre.trim().length < 2) e.nombre = "Escribe el nombre del paciente.";
    if (!nivel) e.nivel = "Elige un nivel de triage.";
    if (!Number.isInteger(espera) || espera < 0) e.espera = "Debe ser un entero de 0 o más.";
    if (!Number.isInteger(duracion) || duracion < 1) e.duracion = "Debe ser un entero de 1 min o más.";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0 || !nivel) return;
    addPatient({ nombre: nombre.trim(), nivel, espera, duracion });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <div className="space-y-6 px-6 pb-6">
        <div>
          <label htmlFor="nombre" className="mb-2 block text-[13px] font-medium text-text">
            Nombre del paciente
          </label>
          <input
            id="nombre"
            autoFocus
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrors((x) => ({ ...x, nombre: undefined }));
            }}
            placeholder="Ej. Rosa H."
            aria-invalid={!!errors.nombre}
            className={cn(
              "h-11 w-full rounded-[10px] border bg-surface px-3.5 text-[15px] text-text outline-none placeholder:text-subtle focus:border-blue focus:ring-2 focus:ring-blue/30",
              errors.nombre ? "border-n1" : "border-border",
            )}
          />
          <p className={cn("mt-1 text-xs", errors.nombre ? "text-n1" : "text-muted")}>
            {errors.nombre ?? "Nombre y apellido"}
          </p>
        </div>

        <div>
          <p id="nivel-label" className="mb-2 text-[13px] font-medium text-text">
            Nivel de triage
          </p>
          <div role="radiogroup" aria-labelledby="nivel-label" className="space-y-2">
            {NIVEL_LISTA.map((n) => {
              const data = NIVELES[n];
              const selected = nivel === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setNivel(n);
                    setErrors((x) => ({ ...x, nivel: undefined }));
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-[10px] border px-3.5 py-3 text-left",
                    selected ? cn("border-2", data.border) : "border-border hover:bg-bg",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-[16px] shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-navy" : "border-[#E5E7EB]",
                    )}
                  >
                    {selected && <span className="size-2 rounded-full bg-navy" />}
                  </span>
                  <LevelBadge nivel={n} withName />
                  <span className="ml-auto text-xs text-muted">
                    Espera máx. {data.limiteTxt} · peso {data.peso}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.nivel && <p className="mt-1.5 text-xs text-n1">{errors.nivel}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-text">Ya lleva esperando (W)</p>
            <NumberStepper value={espera} onChange={setEspera} unit="min" aria-label="Ya lleva esperando en minutos" />
            {errors.espera && <p className="mt-1.5 text-xs text-n1">{errors.espera}</p>}
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-text">Duración de consulta (d)</p>
            <NumberStepper value={duracion} onChange={setDuracion} min={1} unit="min" aria-label="Duración de consulta en minutos" />
            {errors.duracion && <p className="mt-1.5 text-xs text-n1">{errors.duracion}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit">
          <Check size={16} />
          Agregar
        </Button>
      </div>
    </form>
  );
}