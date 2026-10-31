import { Card } from "@/components/ui/Card";

export function PenaltySummary({ total }: { total: number | null }) {
  return (
    <Card className="px-5 py-[18px]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        Penalización total
      </p>
      <p className="mt-2 text-5xl font-bold leading-none text-muted">{total ?? 0}</p>
      <p className="mt-3 text-[13px] text-muted">Agrega pacientes para calcular el orden óptimo.</p>
    </Card>
  );
}
