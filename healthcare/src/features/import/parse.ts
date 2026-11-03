import Papa from "papaparse";
import { readSheet } from "read-excel-file/browser";
import type { NewPatient } from "@/features/patients/types";
import type { Nivel } from "@/lib/triage";

export type ParsedRow = {
  fila: number;
  nombre: string;
  data?: NewPatient;
  error?: string;
};

export type ParseResult = {
  fileName: string;
  rows: ParsedRow[];
};

const quitarAcentos = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const norm = (v: unknown) => quitarAcentos(String(v ?? "")).trim().toLowerCase();

const ALIAS: Record<string, string[]> = {
  nombre: ["nombre", "paciente"],
  nivel: ["nivel", "triage", "nivel de triage"],
  espera: ["espera", "w"],
  duracion: ["duracion", "consulta", "d"],
};

function indiceColumna(headers: string[], campo: keyof typeof ALIAS) {
  return headers.findIndex((h) => ALIAS[campo].includes(h));
}

function aNumero(v: unknown): number {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim().replace(",", ".");
  return s === "" ? NaN : Number(s);
}

function aNivel(v: unknown): Nivel | null {
  const n = Number(String(v ?? "").toUpperCase().replace("N", "").trim());
  return Number.isInteger(n) && n >= 1 && n <= 5 ? (n as Nivel) : null;
}

function validarFilas(matrix: unknown[][]): ParsedRow[] {
  if (matrix.length === 0) throw new Error("El archivo está vacío.");

  const headers = matrix[0].map(norm);
  const idx = {
    nombre: indiceColumna(headers, "nombre"),
    nivel: indiceColumna(headers, "nivel"),
    espera: indiceColumna(headers, "espera"),
    duracion: indiceColumna(headers, "duracion"),
  };
  const faltan = (Object.keys(idx) as (keyof typeof idx)[]).filter((k) => idx[k] === -1);
  if (faltan.length > 0) {
    throw new Error(`Faltan columnas: ${faltan.join(", ")}. Las columnas deben llamarse nombre, nivel, espera y duración.`);
  }

  const rows: ParsedRow[] = [];
  matrix.slice(1).forEach((r, i) => {
    if (r.every((c) => String(c ?? "").trim() === "")) return;

    const fila = i + 2;
    const nombre = String(r[idx.nombre] ?? "").trim();
    const nivel = aNivel(r[idx.nivel]);
    const espera = aNumero(r[idx.espera]);
    const duracion = aNumero(r[idx.duracion]);

    let error: string | undefined;
    if (nombre.length < 2) error = "Falta el nombre.";
    else if (!nivel) error = "Nivel inválido (usa 1 a 5).";
    else if (!Number.isInteger(espera) || espera < 0) error = "Espera inválida (entero, 0 o más).";
    else if (!Number.isInteger(duracion) || duracion < 1) error = "Duración inválida (entero, 1 o más).";

    rows.push(
      error || !nivel
        ? { fila, nombre, error }
        : { fila, nombre, data: { nombre, nivel, espera, duracion } },
    );
  });

  if (rows.length === 0) throw new Error("El archivo no tiene filas con pacientes.");
  return rows;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  let matrix: unknown[][];
  if (ext === "csv") {
    const text = await file.text();
    const res = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), { skipEmptyLines: true });
    matrix = res.data;
  } else if (ext === "xlsx") {
    matrix = (await readSheet(file)) as unknown[][];
  } else {
    throw new Error("Formato no compatible. Usa un archivo .xlsx o .csv.");
  }

  return { fileName: file.name, rows: validarFilas(matrix) };
}