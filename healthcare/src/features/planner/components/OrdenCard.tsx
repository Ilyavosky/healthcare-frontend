"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyPatients } from "@/features/patients/components/EmptyPatients";
import { PatientTable } from "@/features/patients/components/PatientTable";
import { usePatients } from "@/features/patients/store";
import { cn } from "@/lib/cn";
import { describeComparacion, describeReference } from "../labels";
import { useUi, type OrdenModo } from "../ui-store";
import { usePlan } from "../usePlan";

function EstadoBusqueda() {
  const plan = usePlan();
  if (!plan.hayPacientes) return null;

  let texto: string | null = null;
  let tono = "text-muted";
  if (plan.pendientes === 0) texto = "Todos los pacientes ya fueron atendidos.";
  else if (plan.error) {
    texto = plan.error.message;
    tono = "text-n1";
  } else if (plan.calculando) texto = "Calculando el mejor orden…";
  else if (plan.data)
    texto = plan.modo === "optimo" ? describeReference(plan.data) : "Orden por gravedad: nivel de triage y luego mayor espera.";
  if (!texto) return null;

  const comparando = plan.comparacion?.status === "loading";
  const comparacion = plan.comparacion ? describeComparacion(plan.comparacion.ucs, plan.astar) : null;

  return (
    <div className="space-y-0.5 px-5 pt-2 text-xs">
      <p className={cn("flex items-center gap-1.5", tono)} role={plan.error ? "alert" : "status"}>
        {plan.calculando && <LoaderCircle size={13} className="animate-spin" />}
        {plan.error && <AlertCircle size={13} />}
        {texto}
      </p>
      {plan.modo === "optimo" && plan.data && (comparando || comparacion) && (
        <p className="flex items-center gap-1.5 text-subtle">
          {comparando && <LoaderCircle size={12} className="animate-spin" />}
          {comparando ? "Comparando con Costo uniforme…" : comparacion}
        </p>
      )}
    </div>
  );
}

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
      <EstadoBusqueda />
      {total === 0 ? (
        <EmptyPatients />
      ) : (
        <div className={cn("transition-opacity", plan.calculando && "opacity-60")}>
          <PatientTable filas={plan.filas} />
        </div>
      )}
    </Card>
  );
}
