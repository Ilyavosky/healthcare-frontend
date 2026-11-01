"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Dropzone({ onFile, loading }: { onFile: (file: File) => void; loading?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 border-dashed border-blue bg-bluebg px-4 py-4",
        over && "bg-blue/15",
      )}
    >
      <Upload size={22} className="shrink-0 text-blue" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy">
          {loading ? "Leyendo archivo…" : "Arrastra tu archivo .xlsx o .csv aquí"}
        </p>
        <p className="text-xs text-muted">o haz clic para seleccionarlo</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        Seleccionar
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        data-testid="file-input"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}