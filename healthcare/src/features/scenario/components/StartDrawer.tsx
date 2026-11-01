"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Switch } from "@/components/ui/Switch";
import { LevelBadge } from "@/features/patients/components/LevelBadge";
import { usePatients } from "@/features/patients/store";
import { useUi } from "@/features/planner/ui-store";
import { cn } from "@/lib/cn";
import { NIVELES } from "@/lib/triage";
import { useScenario } from "../store";

function StartForm({ onDone }: { onDone: () => void }) {
  const patients = usePatients((s) => s.patients);
  const { t0: savedT0, attended: savedAttended, setStart } = useScenario();
  const [t0, setT0] = useState(savedT0);
  const [attended, setAttended] = useState<string[]>(savedAttended);

  const toggle = (id: string, on: boolean) =>
    setAttended((a) => (on ? [...a, id] : a.filter((x) => x !== id)));

  function apply() {
    const ids = patients.filter((p) => attended.includes(p.id)).map((p) => p.id);
    setStart(Number.isNaN(t0) ? 0 : t0, ids);
    onDone();
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6 pt-5">
        <div>
          <p className="mb-2 text-[13px] font-medium text-text">Minuto actual del turno (t₀)</p>
          <NumberStepper value={t0} onChange={setT0} step={5} unit="min" aria-label="Minuto actual del turno" />
        </div>

        <div>
          <p className="mb-3 text-[13px] font-medium text-text">¿Quién ya fue atendido?</p>
          {patients.length === 0 ? (
            <p className="rounded-[10px] bg-bg px-4 py-3 text-[13px] text-muted">
              Agrega pacientes para marcar quién ya fue atendido.
            </p>
          ) : (
            <ul className="space-y-2">
              {patients.map((p) => {
                const on = attended.includes(p.id);
                return (
                  <li
                    key={p.id}
                    className="relative flex items-center gap-3 overflow-hidden rounded-[10px] border border-border bg-surface py-2.5 pl-4 pr-3"
                  >
                    <span className={cn("absolute inset-y-0 left-0 w-1", NIVELES[p.nivel].bar)} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{p.nombre}</span>
                    <LevelBadge nivel={p.nivel} />
                    <span className={cn("w-[62px] text-right text-xs", on ? "font-medium text-ok" : "text-muted")}>
                      {on ? "Atendido" : "En espera"}
                    </span>
                    <Switch checked={on} onChange={(v) => toggle(p.id, v)} aria-label={`${p.nombre} ya fue atendido`} />
                  </li>
                );
              })}
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

export function StartDrawer() {
  const open = useUi((s) => s.startDrawer);
  const setOpen = useUi((s) => s.setStartDrawer);

  return (
    <Drawer open={open} onOpenChange={setOpen} title="Configurar inicio del turno">
      <StartForm onDone={() => setOpen(false)} />
    </Drawer>
  );
}