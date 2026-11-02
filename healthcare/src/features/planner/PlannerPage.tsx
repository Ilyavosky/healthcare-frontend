import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { PenaltySummary } from "@/features/analysis/components/PenaltySummary";
import { StatTile } from "@/features/analysis/components/StatTile";
import { AddPatientDrawer } from "@/features/patients/components/AddPatientDrawer";
import { PatientListCard } from "@/features/patients/components/PatientListCard";
import { GoalCard } from "@/features/scenario/components/GoalCard";
import { GoalDrawer } from "@/features/scenario/components/GoalDrawer";
import { StartCard } from "@/features/scenario/components/StartCard";
import { StartDrawer } from "@/features/scenario/components/StartDrawer";
import { DoctorsDrawer } from "@/features/doctors/components/DoctorsDrawer";

export function PlannerPage() {
  return (
    <>
      <AppHeader />
      <main className="grid grid-cols-[1fr_350px] items-start gap-4 px-8 py-6">
        <PatientListCard />
        <aside className="flex flex-col gap-4">
          <StartCard />
          <GoalCard />
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
            <AddPatientDrawer />
            <StartDrawer />
            <GoalDrawer />
            <DoctorsDrawer />
    </>
  );
}