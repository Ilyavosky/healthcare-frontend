import { Card } from "@/components/ui/Card";

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-3.5 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-text">{value}</p>
    </Card>
  );
}
