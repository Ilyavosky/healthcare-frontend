"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { describeReference } from "@/features/planner/labels";
import { useScenario } from "@/features/scenario/store";
import { usePlan } from "@/features/planner/usePlan";
import { useUi, type PlanView } from "@/features/planner/ui-store";
import { cn } from "@/lib/cn";
import { usePatients } from "../store";
import type { PlannedPatient } from "../types";
import { ordenPorGravedad } from "../utils";
import { EmptyPatients } from "./EmptyPatients";
import { PatientTable } from "./PatientTable";

function SolveStatusLine() {
  const { data, status, error, view, pending, total } = usePlan();
  if (total === 0) return null;
  let text: string;
  let tone = "text-muted";
  if (pending === 0) text = "Todos los pacientes ya fueron atendidos.";
  else if (status === "loading") text = "Calculando el mejor orden…";
  else if (status === "error" && error) {
    text = error.message;
    tone = "text-n1";
  } else if (data) text = view === "optimo" ? describeReference(data) : "Orden por gravedad: nivel de triage y luego mayor espera.";
  else return null;

  return (
    <p className={cn("flex items-center gap-1.5 px-5 pt-2 text-xs", tone)} role={status === "error" ? "alert" : "status"}>
      {status === "loading" && <LoaderCircle size={13} className="animate-spin" />}
      {status === "error" && <AlertCircle size={13} />}
      {text}
    </p>
  );
}

export function PatientListCard() {
  const view = useUi((s) => s.view);
  const setView = useUi((s) => s.setView);
  const patients = usePatients((s) => s.patients);
  const attended = useScenario((s) => s.attended);
  const { plan, status } = usePlan();

  const fallback = useMemo<PlannedPatient[]>(() => {
    const done = new Set(attended);
    const waiting = ordenPorGravedad(patients.filter((p) => !done.has(p.id)));
    const finished = patients.filter((p) => done.has(p.id)).map((p) => ({ ...p, estado: "atendido" as const }));
    return [...waiting, ...finished];
  }, [patients, attended]);

  const rows = plan?.rows ?? fallback;

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
        <SegmentedControl<PlanView>
          value={view}
          onChange={setView}
          options={[
            { value: "optimo", label: "Orden óptimo (A*)" },
            { value: "gravedad", label: "Orden por gravedad" },
          ]}
        />
      </div>
      <SolveStatusLine />
      {patients.length === 0 ? (
        <EmptyPatients />
      ) : (
        <div className={cn("transition-opacity", status === "loading" && "opacity-60")}>
          <PatientTable patients={rows} />
        </div>
      )}
    </Card>
  );
}
