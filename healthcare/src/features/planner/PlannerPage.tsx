import { AppHeader } from "@/components/layout/AppHeader";
import { AnalysisModal } from "@/features/analysis/components/AnalysisModal";
import { WhyButton } from "@/features/analysis/components/WhyButton";
import { DoctorsDrawer } from "@/features/doctors/components/DoctorsDrawer";
import { AddPatientDrawer } from "@/features/patients/components/AddPatientDrawer";
import { GoalCard } from "@/features/scenario/components/GoalCard";
import { GoalDrawer } from "@/features/scenario/components/GoalDrawer";
import { StartCard } from "@/features/scenario/components/StartCard";
import { StartDrawer } from "@/features/scenario/components/StartDrawer";
import { OrdenCard } from "./components/OrdenCard";
import { PlanCalculator } from "./components/PlanCalculator";
import { SummaryPanel } from "./components/SummaryPanel";

export function PlannerPage() {
  return (
    <>
      <AppHeader />
      <main className="grid grid-cols-[1fr_350px] items-start gap-4 px-8 py-6">
        <OrdenCard />
        <aside className="flex flex-col gap-4">
          <StartCard />
          <GoalCard />
          <SummaryPanel />
          <WhyButton />
        </aside>
      </main>
      <PlanCalculator />
      <AddPatientDrawer />
      <StartDrawer />
      <GoalDrawer />
      <DoctorsDrawer />
      <AnalysisModal />
    </>
  );
}