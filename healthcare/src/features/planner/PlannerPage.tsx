import { AppHeader } from "@/components/layout/AppHeader";
import { AnalysisModal } from "@/features/analysis/components/AnalysisModal";
import { WhyButton } from "@/features/analysis/components/WhyButton";
import { AddPatientDrawer } from "@/features/patients/components/AddPatientDrawer";
import { DoctorsCard } from "@/features/scenario/components/DoctorsCard";
import { DoctorsDrawer } from "@/features/scenario/components/DoctorsDrawer";
import { GoalCard } from "@/features/scenario/components/GoalCard";
import { GoalDrawer } from "@/features/scenario/components/GoalDrawer";
import { StartCard } from "@/features/scenario/components/StartCard";
import { StartDrawer } from "@/features/scenario/components/StartDrawer";
import { OrdenCard } from "./components/OrdenCard";
import { PlannerSync } from "./components/PlannerSync";
import { SummaryPanel } from "./components/SummaryPanel";

export function PlannerPage() {
  return (
    <>
      <AppHeader />
      <main className="grid grid-cols-[1fr_350px] items-start gap-4 px-8 py-6">
        <OrdenCard />
        <aside className="flex flex-col gap-4">
          <StartCard />
          <DoctorsCard />
          <GoalCard />
          <SummaryPanel />
          <WhyButton />
        </aside>
      </main>
      <PlannerSync />
      <AddPatientDrawer />
      <StartDrawer />
      <DoctorsDrawer />
      <GoalDrawer />
      <AnalysisModal />
    </>
  );
}
