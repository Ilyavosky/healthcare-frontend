import type { Goal } from "./store";

export const GOAL_OPTIONS = [
  { tipo: "todos", titulo: "Todos los pacientes", desc: "Planear el turno completo hasta atender a todos." },
  { tipo: "criticos", titulo: "Solo críticos (N1–N2)", desc: "Termina cuando los pacientes N1 y N2 estén atendidos." },
  { tipo: "k", titulo: "Próximos K pacientes", desc: "Planear solo los primeros K pacientes del turno." },
  { tipo: "t", titulo: "Por tiempo (T)", desc: "Planear hasta agotar los minutos disponibles." },
  { tipo: "subconjunto", titulo: "Pacientes específicos", desc: "Termina cuando los pacientes que elijas estén atendidos." },
] as const;

export function describeGoal(goal: Goal): string {
  switch (goal.tipo) {
    case "todos":
      return "Atender a todos los pacientes";
    case "criticos":
      return "Hasta atender a todos los críticos (N1–N2)";
    case "k":
      return `Atender a los próximos ${goal.k} ${goal.k === 1 ? "paciente" : "pacientes"}`;
    case "t":
      return `Planear los próximos ${goal.t} min`;
    case "subconjunto":
      return `Hasta atender a ${goal.ids.length} ${goal.ids.length === 1 ? "paciente elegido" : "pacientes elegidos"}`;
  }
}