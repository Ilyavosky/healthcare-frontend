"use client";

import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyPatients } from "@/features/patients/components/EmptyPatients";
import { PatientTable } from "@/features/patients/components/PatientTable";
import { usePatients } from "@/features/patients/store";
import { useUi, type OrdenModo } from "../ui-store";
import { usePlan } from "../usePlan";

export function OrdenCard() {
  const total = usePatients((s) => s.patients.length);
  const modo = useUi((s) => s.orden);
  const setOrden = useUi((s) => s.setOrden);
  const plan = usePlan();

  return (
    <Card className="pb-3">
      <div className="flex items-center justify-between px-5 pt-[22px]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text">Orden de atención</h2>
          {total > 0 && (
            <span className="rounded-full bg-bg px-2.5 py-1 text-xs text-muted">
              {total} {total === 1 ? "paciente" : "pacientes"}
            </span>
          )}
          {plan.calculando && <span className="text-xs text-muted">Calculando orden óptimo…</span>}
        </div>
        <SegmentedControl<OrdenModo>
          value={modo}
          onChange={setOrden}
          options={[
            { value: "optimo", label: "Orden óptimo (A*)" },
            { value: "gravedad", label: "Orden por gravedad" },
          ]}
        />
      </div>
      {total === 0 ? <EmptyPatients /> : <PatientTable filas={plan.filas} />}
    </Card>
  );
}