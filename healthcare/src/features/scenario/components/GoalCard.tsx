"use client";

import { useUi } from "@/features/planner/ui-store";
import { describeGoal } from "../goal";
import { useScenario } from "../store";
import { ScenarioCard } from "./ScenarioCard";

export function GoalCard() {
  const goal = useScenario((s) => s.goal);
  const setGoalDrawer = useUi((s) => s.setGoalDrawer);

  return (
    <ScenarioCard
      label="Meta"
      summary={describeGoal(goal)}
      actionLabel="Cambiar meta"
      onAction={() => setGoalDrawer(true)}
    />
  );
}