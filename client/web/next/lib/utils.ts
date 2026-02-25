import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UnidadeMedida } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(value: number, unidade: UnidadeMedida): string {
  if (value === undefined || value === null) return "-";

  switch (unidade) {
    case "FINANCEIRO":
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    case "PERCENTUAL":
      return `${(value * 100).toFixed(1)}%`;
    case "TEMPO_HORAS": {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    case "ABSOLUTO":
    default:
      return value.toLocaleString("pt-BR");
  }
}

export function formatCompetencia(dateStr: string): string {
  if (!dateStr) return "";
  // Corrige problema de fuso horário pegando apenas a parte da data
  const [year, month, day] = dateStr.split("T")[0].split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

export function parseMeta(
  meta: string | null,
  unidade: UnidadeMedida,
): number | null {
  if (!meta) return null;
  // Remove caracteres de moeda ou % se houver, para converter pra number
  const clean = String(meta).replace(/[^\d.-]/g, "");
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return null;
  return parsed;
}

export function getVariacao(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
