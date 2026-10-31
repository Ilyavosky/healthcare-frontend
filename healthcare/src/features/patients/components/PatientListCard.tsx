"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyPatients } from "./EmptyPatients";

type Order = "optimo" | "gravedad";

export function PatientListCard() {
  const [order, setOrder] = useState<Order>("optimo");

  return (
    <Card className="pb-3">
      <div className="flex items-center justify-between px-5 pt-[22px]">
        <h2 className="text-lg font-semibold text-text">Orden de atención</h2>
        <SegmentedControl<Order>
          value={order}
          onChange={setOrder}
          options={[
            { value: "optimo", label: "Orden óptimo (A*)" },
            { value: "gravedad", label: "Orden por gravedad" },
          ]}
        />
      </div>
      <EmptyPatients />
    </Card>
  );
}
