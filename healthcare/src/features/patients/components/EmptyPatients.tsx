import { HeartPlus, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyPatients() {
  return (
    <div className="flex flex-col items-center px-6 pt-[63px] pb-[62px] text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-bluebg text-navy">
        <HeartPlus size={40} strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 text-xl font-bold text-navy">Aún no hay pacientes en espera</h3>
      <p className="mt-3 text-sm text-muted">
        Agrega pacientes uno por uno, carga un archivo de Excel
      </p>
      <div className="mt-[14px] flex gap-2.5">
        <Button>
          <Plus size={16} />
          Agregar paciente
        </Button>
        <Button variant="outline">
          <Upload size={16} />
          Cargar Excel
        </Button>
      </div>
    </div>
  );
}
