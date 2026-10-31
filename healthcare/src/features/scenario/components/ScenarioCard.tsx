import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Props = {
  label: string;
  summary: string;
  actionLabel: string;
  onAction?: () => void;
};

export function ScenarioCard({ label, summary, actionLabel, onAction }: Props) {
  return (
    <Card className="px-4 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
        <Info size={13} className="text-subtle" />
      </div>
      <p className="mt-1 text-base font-semibold text-navy">{summary}</p>
      <Button variant="outline" size="sm" className="mt-2" onClick={onAction}>
        {actionLabel}
      </Button>
    </Card>
  );
}
