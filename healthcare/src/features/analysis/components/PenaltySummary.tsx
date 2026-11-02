import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/format";

type Props = {
  total: number | null;
  nota: string;
};

export function PenaltySummary({ total, nota }: Props) {
  return (
    <Card className="px-5 py-[18px]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Penalización total</p>
      <p className={cn("mt-2 text-5xl font-bold leading-none tabular-nums", total === null ? "text-muted" : "text-navy")}>
        {total === null ? 0 : fmt(total)}
      </p>
      <p className="mt-3 text-[13px] text-muted">{nota}</p>
    </Card>
  );
}