"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { usePatients } from "../store";
import { ordenPorGravedad } from "../utils";
import { EmptyPatients } from "./EmptyPatients";
import { PatientTable } from "./PatientTable";

type Order = "optimo" | "gravedad";

export function PatientListCard() {
  const [order, setOrder] = useState<Order>("optimo");
  const patients = usePatients((s) => s.patients);

  const ordered = useMemo(() => ordenPorGravedad(patients), [patients]);

  return (
    <Card className="pb-3">
      <div className="flex items-center justify-between px-5 pt-[22px]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text">Orden de atención</h2>
          {patients.length > 0 && (
            <span className="rounded-full bg-bg px-2.5 py-1 text-xs text-muted">
              {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
            </span>
          )}
        </div>
        <SegmentedControl<Order>
          value={order}
          onChange={setOrder}
          options={[
            { value: "optimo", label: "Orden óptimo (A*)" },
            { value: "gravedad", label: "Orden por gravedad" },
          ]}
        />
      </div>
      {patients.length === 0 ? <EmptyPatients /> : <PatientTable patients={ordered} />}
    </Card>
  );
}