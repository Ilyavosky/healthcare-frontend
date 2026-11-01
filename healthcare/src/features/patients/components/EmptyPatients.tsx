"use client";

import { HeartPlus, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUi } from "@/features/planner/ui-store";

export function EmptyPatients() {
  const openAdd = useUi((s) => s.openAdd);
  return (
    <div className="flex flex-col items-center px-6 pt-[63px] pb-[62px] text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-bluebg text-navy">
        <HeartPlus size={40} strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 text-xl font-semibold text-navy">Aún no hay pacientes en espera</h3>
      <p className="mt-2 text-sm text-muted">
        Agrega pacientes uno por uno, carga un archivo de Excel
      </p>
      <div className="mt-[14px] flex gap-2.5">
        <Button onClick={() => openAdd("individual")}>
          <Plus size={16} />
          Agregar paciente
        </Button>
        <Button variant="outline" onClick={() => openAdd("excel")}>
          <Upload size={16} />
          Cargar Excel
        </Button>
      </div>
    </div>
  );
}