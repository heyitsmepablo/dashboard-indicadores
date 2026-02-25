import { UnidadeMedida } from "./types";

export function formatValue(value: number, unidade: UnidadeMedida): string {
  if (value === undefined || value === null || isNaN(value)) return "-";

  switch (unidade) {
    case "FINANCEIRO":
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    case "PERCENTUAL":
      // Se o valor vier 0.10 (10%) ou 10 (10%), tenta ajustar, mas assume que < 1 é decimal
      // Ajuste conforme seu padrão de banco. Aqui assumo que 0.5 = 50%
      return `${value.toFixed(1)}%`; // Removi a mult por 100 se seus dados já vem como 80, 90 etc.
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

  try {
    // Pega apenas a parte da data YYYY-MM-DD, ignorando tempo e timezone (T...)
    const cleanDate = dateStr.toString().split("T")[0];
    const parts = cleanDate.split("-"); // [2025, 01, 01]

    if (parts.length !== 3) return cleanDate;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JS meses são 0-11
    const day = parseInt(parts[2]);

    const date = new Date(year, month, day);

    // Formata para "jan. 25"
    return date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
  } catch (e) {
    console.error("Erro ao formatar data:", dateStr, e);
    return dateStr;
  }
}

export function parseMeta(
  meta: string | null,
  unidade: UnidadeMedida,
): number | null {
  if (!meta) return null;
  const clean = String(meta).replace(/[^\d.-]/g, "");
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return null;
  return parsed;
}

export function getVariacao(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
