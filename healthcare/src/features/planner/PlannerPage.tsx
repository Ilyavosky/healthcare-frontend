import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { PenaltySummary } from "@/features/analysis/components/PenaltySummary";
import { StatTile } from "@/features/analysis/components/StatTile";
import { PatientListCard } from "@/features/patients/components/PatientListCard";
import { ScenarioCard } from "@/features/scenario/components/ScenarioCard";

export function PlannerPage() {
  return (
    <>
      <AppHeader />
      <main className="grid grid-cols-[1fr_345px] items-start gap-4 px-8 py-6">
        <PatientListCard />
        <aside className="flex flex-col gap-4">
          <ScenarioCard label="Inicio" summary="Nadie atendido aún · minuto 0" actionLabel="Configurar inicio" />
          <ScenarioCard label="Meta" summary="Atender a todos los pacientes" actionLabel="Cambiar meta" />
          <PenaltySummary total={null} />
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Fin del turno" value="—" />
            <StatTile label="Con retraso" value="—" />
          </div>
          <Button variant="block" className="py-[15px]">
            ¿Por qué este orden es el mejor?
          </Button>
        </aside>
      </main>
    </>
  );
}
