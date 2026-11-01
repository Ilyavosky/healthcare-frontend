"use client";

import { Drawer } from "@/components/ui/Drawer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUi, type AddTab } from "@/features/planner/ui-store";
import { AddPatientForm } from "./AddPatientForm";

export function AddPatientDrawer() {
  const tab = useUi((s) => s.addDrawer);
  const openAdd = useUi((s) => s.openAdd);
  const closeAdd = useUi((s) => s.closeAdd);

  return (
    <Drawer
      open={tab !== null}
      onOpenChange={(o) => !o && closeAdd()}
      title="Agregar pacientes"
      description="Elige cómo quieres ingresarlos"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-6 py-5">
          <SegmentedControl<AddTab>
            fullWidth
            value={tab ?? "individual"}
            onChange={openAdd}
            options={[
              { value: "individual", label: "Individual" },
              { value: "excel", label: "Excel / CSV" },
            ]}
          />
        </div>

        {tab === "excel" ? (
          <p className="px-6 text-sm text-muted">
          </p>
        ) : (
          <AddPatientForm key="form" onDone={closeAdd} />
        )}
      </div>
    </Drawer>
  );
}