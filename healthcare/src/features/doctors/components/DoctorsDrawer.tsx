"use client";

import { Check, Info, Stethoscope } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { useUi } from "@/features/planner/ui-store";
import { useDoctors } from "../store";

function DoctorsForm({ onDone }: { onDone: () => void }) {
  const saved = useDoctors((s) => s.count);
  const setCount = useDoctors((s) => s.setCount);
  const [n, setN] = useState(saved);
  const valid = Number.isNaN(n) ? 1 : n;

  function apply() {
    setCount(valid);
    onDone();
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-5">
        <div>
          <p className="mb-2 text-[13px] font-medium text-text">Doctores disponibles</p>
          <NumberStepper value={n} onChange={setN} min={1} aria-label="Número de doctores" />
          <p className="mt-2 text-xs text-muted">Mínimo 1.</p>
        </div>

        <div className="rounded-xl border border-border bg-bg px-4 py-6 text-center">
          <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-navy text-white">
            <Stethoscope size={28} />
          </div>
          <p className="mt-4 text-sm font-semibold text-navy">
            {valid} {valid === 1 ? "doctor atendiendo" : "doctores atendiendo en paralelo"}
          </p>
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
    <Drawer open={open} onOpenChange={setOpen} title="Doctores" description="¿Cuántos doctores atienden al mismo tiempo?">
      <DoctorsForm onDone={() => setOpen(false)} />
    </Drawer>
  );
}