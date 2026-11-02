"use client";

import { FileSpreadsheet, TriangleAlert, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePatients } from "@/features/patients/store";
import { parseFile, type ParseResult } from "../parse";
import { Dropzone } from "./Dropzone";

export function ExcelImport({ onDone }: { onDone: () => void }) {
  const addMany = usePatients((s) => s.addMany);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validos = useMemo(() => result?.rows.flatMap((r) => (r.data ? [r.data] : [])) ?? [], [result]);
  const conError = (result?.rows.length ?? 0) - validos.length;

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      setResult(await parseFile(file));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    } finally {
      setLoading(false);
    }
  }

  function importar() {
    addMany(validos);
    onDone();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
        <Dropzone onFile={handleFile} loading={loading} />

        {error && (
          <div className="flex gap-2 rounded-[10px] bg-n1/10 px-3 py-2.5 text-[13px] text-n1" role="alert">
            <TriangleAlert size={16} className="mt-px shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
              <FileSpreadsheet size={20} className="shrink-0 text-n4" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">{result.fileName}</p>
                <p className="text-xs text-muted">{result.rows.length} filas leídas</p>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="cursor-pointer text-[13px] text-muted hover:text-navy"
              >
                Quitar
              </button>
            </div>

            {conError > 0 && (
            <div className="rounded-[10px] bg-amberbg px-3 py-2.5 text-xs text-text">
                <p className="flex gap-2 font-semibold">
                <TriangleAlert size={16} className="mt-px shrink-0 text-amber" />
                {conError} {conError === 1 ? "fila tiene" : "filas tienen"} errores y no se importarán.
                </p>
                <ul className="mt-2 space-y-1 pl-6">
                {result.rows
                    .filter((r) => r.error)
                    .map((r) => (
                    <li key={r.fila}>
                        Fila {r.fila}: {r.error}
                    </li>
                    ))}
                </ul>
            </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="button" disabled={validos.length === 0} onClick={importar} className="disabled:cursor-not-allowed disabled:opacity-50">
          <Upload size={16} />
          {validos.length === 0 ? "Importar" : `Importar ${validos.length} ${validos.length === 1 ? "paciente" : "pacientes"}`}
        </Button>
      </div>
    </div>
  );
}