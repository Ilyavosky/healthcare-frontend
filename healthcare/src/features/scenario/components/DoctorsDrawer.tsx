"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Switch } from "@/components/ui/Switch";
import { useUi } from "@/features/planner/ui-store";
import { useScenario } from "../store";

const MAX_DOCTORS = 100000;
const MAX_CUSTOM = 50;

function clean(value: number, fallback: number) {
  return Number.isNaN(value) ? fallback : value;
}

function DoctorsForm({ onDone }: { onDone: () => void }) {
  const t0 = useScenario((s) => s.t0);
  const saved = useScenario((s) => s.doctors);
  const savedFreeAt = useScenario((s) => s.doctorsFreeAt);
  const setDoctors = useScenario((s) => s.setDoctors);
  const [count, setCount] = useState(saved);
  const [custom, setCustom] = useState(savedFreeAt !== null);
  const [freeAt, setFreeAt] = useState<number[]>(savedFreeAt ?? []);

  const size = Math.max(1, clean(count, 1));
  const canCustomize = size <= MAX_CUSTOM;
  const minutes = Array.from({ length: size }, (_, i) => freeAt[i] ?? t0);

  const setMinute = (index: number, value: number) =>
    setFreeAt(() => minutes.map((m, i) => (i === index ? value : m)));

  function apply() {
    const list = custom && canCustomize ? minutes.map((m) => Math.max(t0, clean(m, t0))) : null;
    setDoctors(size, list);
    onDone();
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6 pt-5">
        <div>
          <p className="mb-2 text-[13px] font-medium text-text">Número de médicos</p>
          <NumberStepper value={count} onChange={setCount} min={1} max={MAX_DOCTORS} aria-label="Número de médicos" />
          <p className="mt-2 text-xs text-muted">Todos atienden a cualquier paciente y trabajan en paralelo.</p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-text">Indicar cuándo se libera cada médico</p>
              <p className="text-xs text-muted">
                {canCustomize
                  ? `Si está apagado, todos están libres en el minuto ${t0}.`
                  : `Disponible con hasta ${MAX_CUSTOM} médicos.`}
              </p>
            </div>
            <Switch
              checked={custom && canCustomize}
              onChange={(v) => canCustomize && setCustom(v)}
              aria-label="Indicar cuándo se libera cada médico"
            />
          </div>

          {custom && canCustomize && (
            <ul className="mt-3 space-y-2">
              {minutes.map((m, i) => (
                <li key={i} className="flex items-center gap-3 rounded-[10px] border border-border bg-surface py-2 pl-4 pr-2">
                  <span className="min-w-0 flex-1 text-sm font-semibold text-text">Médico {i + 1}</span>
                  <div className="w-[180px]">
                    <NumberStepper
                      value={m}
                      onChange={(v) => setMinute(i, v)}
                      min={t0}
                      max={9999}
                      step={5}
                      unit="min"
                      aria-label={`Minuto en que se libera el médico ${i + 1}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="button" onClick={apply}>
          <Check size={16} />
          Aplicar
        </Button>
      </div>
    </>
  );
}

export function DoctorsDrawer() {
  const open = useUi((s) => s.doctorsDrawer);
  const setOpen = useUi((s) => s.setDoctorsDrawer);

  return (
    <Drawer open={open} onOpenChange={setOpen} title="Configurar médicos" description="Cuántos médicos atienden y cuándo se libera cada uno">
      <DoctorsForm onDone={() => setOpen(false)} />
    </Drawer>
  );
}
