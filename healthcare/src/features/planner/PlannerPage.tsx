import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { AnalysisPanel } from "@/features/analysis/components/AnalysisPanel";
import { AddPatientDrawer } from "@/features/patients/components/AddPatientDrawer";
import { PatientListCard } from "@/features/patients/components/PatientListCard";
import { PlannerSync } from "@/features/planner/components/PlannerSync";
import { DoctorsCard } from "@/features/scenario/components/DoctorsCard";
import { DoctorsDrawer } from "@/features/scenario/components/DoctorsDrawer";
import { GoalCard } from "@/features/scenario/components/GoalCard";
import { GoalDrawer } from "@/features/scenario/components/GoalDrawer";
import { StartCard } from "@/features/scenario/components/StartCard";
import { StartDrawer } from "@/features/scenario/components/StartDrawer";

export function PlannerPage() {
  return (
    <>
      <AppHeader />
      <main className="grid grid-cols-[1fr_350px] items-start gap-4 px-8 py-6">
        <PatientListCard />
        <aside className="flex flex-col gap-4">
          <StartCard />
          <DoctorsCard />
          <GoalCard />
          <AnalysisPanel />
          <Button variant="block" className="py-[15px]">
            ¿Por qué este orden es el mejor?
          </Button>
        </aside>
      </main>
      <AddPatientDrawer />
      <StartDrawer />
      <DoctorsDrawer />
      <GoalDrawer />
      <PlannerSync />
    </>
  );
}