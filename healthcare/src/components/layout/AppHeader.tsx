"use client";

import { HeartPulse, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePatients } from "@/features/patients/store";
import { useUi } from "@/features/planner/ui-store";

export function AppHeader() {
  const reset = usePatients((s) => s.reset);
  const openAdd = useUi((s) => s.openAdd);
  return (
    <header className="flex h-[64px] items-center gap-3 border-b border-border bg-surface px-8">
      <div className="flex size-10 items-center justify-center rounded-full bg-navy text-white">
        <HeartPulse size={20} />
      </div>
      <div className="leading-none">
        <h1 className="text-lg font-bold text-navy">Healthcare</h1>
        <p className="-mt-1 text-xs text-muted">Priorización de urgencias médicas</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" onClick={reset}>
          <RefreshCw size={16} strokeWidth={2.5} />
          Reiniciar
        </Button>
        <Button onClick={() => openAdd("individual")}>
          <Plus size={16} />
          Agregar pacientes
        </Button>
      </div>
    </header>
  );
}
