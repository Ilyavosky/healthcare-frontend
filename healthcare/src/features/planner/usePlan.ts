import { useMemo } from "react";
import { usePatients } from "@/features/patients/store";
import { ordenPorGravedad } from "@/features/patients/utils";
import { useScenario } from "@/features/scenario/store";
import { construirPlan } from "./plan";
import { usePlanStore } from "./plan-store";
import { useUi } from "./ui-store";

/**
 * El plan que se muestra en pantalla: la tabla, la penalización total y los datos del turno.
 * Según el botón de orden usa el óptimo (A*) o el de gravedad.
 */
export function usePlan() {
  const patients = usePatients((s) => s.patients);
  const attended = useScenario((s) => s.attended);
  const t0 = useScenario((s) => s.t0);
  const modo = useUi((s) => s.orden);
  const optimo = usePlanStore((s) => s.optimo);

  return useMemo(() => {
    const atendidos = patients.filter((p) => attended.includes(p.id));
    const pendientes = patients.filter((p) => !attended.includes(p.id));

    const porGravedad = construirPlan(atendidos, ordenPorGravedad(pendientes), t0);

    // El óptimo solo vale si se calculó con estos mismos datos
    const vigente = !!optimo && optimo.patients === patients && optimo.attended === attended && optimo.t0 === t0;
    const porId = new Map(pendientes.map((p) => [p.id, p]));
    const planOptimo =
      vigente && pendientes.length > 0
        ? construirPlan(
            atendidos,
            optimo.ids.map((id) => porId.get(id)!).filter(Boolean),
            t0,
          )
        : null;

    const usaOptimo = modo === "optimo" && planOptimo !== null;
    const plan = usaOptimo ? planOptimo : porGravedad;

    return {
      ...plan,
      modo,
      total: plan.total,
      hayPacientes: patients.length > 0,
      // Mientras A* calcula se muestra el orden por gravedad
      calculando: modo === "optimo" && pendientes.length > 0 && planOptimo === null,
      exacto: optimo?.exacto ?? true,
      ahorro: usaOptimo ? porGravedad.total - planOptimo.total : null,
    };
  }, [patients, attended, t0, modo, optimo]);
}