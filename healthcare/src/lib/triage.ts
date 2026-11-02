// Escala Manchester. Las clases se escriben completas para que Tailwind las detecte.
export type Nivel = 1 | 2 | 3 | 4 | 5;

export const NIVELES: Record<
  Nivel,
  {
    id: string;
    nombre: string;
    limite: number;
    limiteTxt: string;
    peso: number;
    badge: string;
    border: string;
    bar: string;
    hex: string;
  }
> = {
  1: { id: "N1", nombre: "Emergencia", limite: 0, limiteTxt: "inmediata", peso: 16, badge: "bg-n1 text-white", border: "border-n1", bar: "bg-n1", hex: "#e04b35" },
  2: { id: "N2", nombre: "Muy urgente", limite: 10, limiteTxt: "10 min", peso: 8, badge: "bg-n2 text-white", border: "border-n2", bar: "bg-n2", hex: "#f07f2d" },
  3: { id: "N3", nombre: "Urgente", limite: 60, limiteTxt: "60 min", peso: 4, badge: "bg-n3 text-[#4a3500]", border: "border-n3", bar: "bg-n3", hex: "#f6c026" },
  4: { id: "N4", nombre: "Menos urgente", limite: 120, limiteTxt: "120 min", peso: 2, badge: "bg-n4 text-white", border: "border-n4", bar: "bg-n4", hex: "#3daa5c" },
  5: { id: "N5", nombre: "No urgente", limite: 240, limiteTxt: "240 min", peso: 1, badge: "bg-n5 text-white", border: "border-n5", bar: "bg-n5", hex: "#2f7bd6" },
};

export const NIVEL_LISTA: Nivel[] = [1, 2, 3, 4, 5];