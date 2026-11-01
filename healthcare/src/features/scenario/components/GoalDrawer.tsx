"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CompactStepper } from "@/components/ui/CompactStepper";
import { Drawer } from "@/components/ui/Drawer";
import { useUi } from "@/features/planner/ui-store";
import { cn } from "@/lib/cn";
import { GOAL_OPTIONS } from "../goal";
import { useScenario, type Goal } from "../store";

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="pt-3">
      <p className="mb-2 text-[13px] font-medium text-text">{label}</p>
      {children}
      {help && <p className="mt-2 text-xs text-muted">{help}</p>}
    </div>
  );
}

function GoalForm({ onDone }: { onDone: () => void }) {
  const saved = useScenario((s) => s.goal);
  const setGoal = useScenario((s) => s.setGoal);
  const [draft, setDraft] = useState<Goal>(saved);
  const patch = (p: Partial<Goal>) => setDraft((d) => ({ ...d, ...p }));

  function apply() {
    setGoal({
      ...draft,
      k: Number.isNaN(draft.k) ? 1 : draft.k,
      t: Number.isNaN(draft.t) ? 1 : draft.t,
    });
    onDone();
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5">
        <p id="meta-label" className="mb-3 text-[13px] font-medium text-text">
          ¿Hasta dónde quieres planear?
        </p>
        <div role="radiogroup" aria-labelledby="meta-label" className="space-y-3">
          {GOAL_OPTIONS.map((o) => {
            const selected = draft.tipo === o.tipo;
            return (
              <div
                key={o.tipo}
                className={cn(
                  "rounded-xl border px-4 py-3.5",
                  selected ? "border-2 border-blue bg-bluebg" : "border-border bg-surface",
                )}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => patch({ tipo: o.tipo })}
                  className="flex w-full cursor-pointer items-start gap-3 text-left"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 bg-white",
                      selected ? "border-blue" : "border-subtle",
                    )}
                  >
                    {selected && <span className="size-2 rounded-full bg-blue" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-navy">{o.titulo}</span>
                    <span className="block text-xs text-muted">{o.desc}</span>
                  </span>
                </button>

                {selected && o.tipo === "k" && (
                  <Field label="Número de pacientes (K)" help="Se toman los primeros K según el orden óptimo.">
                    <CompactStepper value={draft.k} onChange={(v) => patch({ k: v })} min={1} max={99} aria-label="Número de pacientes K" />
                  </Field>
                )}

                {selected && o.tipo === "t" && (
                  <Field label="Minutos disponibles (T)" help="Tiempo contado desde el minuto inicial del turno.">
                    <CompactStepper value={draft.t} onChange={(v) => patch({ t: v })} min={1} max={999} step={5} unit="min" aria-label="Minutos disponibles T" />
                  </Field>
                )}
              </div>
            );
          })}
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

export function GoalDrawer() {
  const open = useUi((s) => s.goalDrawer);
  const setOpen = useUi((s) => s.setGoalDrawer);

  return (
    <Drawer open={open} onOpenChange={setOpen} title="Configurar meta del turno" description="Define hasta dónde planear el turno">
      <GoalForm onDone={() => setOpen(false)} />
    </Drawer>
  );
}