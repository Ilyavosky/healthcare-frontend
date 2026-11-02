import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function PenaltySummary({ total, caption }: { total: number | null; caption: string }) {
  return (
    <Card className="px-5 py-[18px]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        Penalización total
      </p>
      <p className={cn("mt-2 text-5xl font-bold leading-none", total === null ? "text-muted" : "text-navy")}>
        {total ?? 0}
      </p>
      <p className="mt-3 text-[13px] text-muted">{caption}</p>
    </Card>
  );
}
