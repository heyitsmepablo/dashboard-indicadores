import { UnidadeMedida } from "./types";

/**
 * Formata um valor numérico de acordo com sua unidade de medida.
 * @param value Valor a ser formatado.
 * @param unidade Tipo de unidade (FINANCEIRO, PERCENTUAL, etc).
 * @returns String formatada pronta para exibição.
 */
export function formatValue(value: number, unidade: UnidadeMedida): string {
  if (value === undefined || value === null || isNaN(value)) return "-";

  switch (unidade) {
    case "FINANCEIRO":
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    case "PERCENTUAL":
      return `${value.toFixed(1)}%`;
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

/**
 * Formata a data de competência no formato curto (ex: "jan. 25").
 * @param dateStr Data no formato ISO ou YYYY-MM ou YYYY-MM-DD.
 */
export function formatCompetencia(dateStr: string): string {
  if (!dateStr) return "";

  try {
    const cleanDate = dateStr.toString().split("T")[0];
    const parts = cleanDate.split("-");

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    // Se não vier o dia na string, assume dia 1
    const day = parts.length >= 3 ? parseInt(parts[2]) : 1;

    const date = new Date(year, month, day);

    // Validação extra caso a data fique inválida
    if (isNaN(date.getTime())) return cleanDate;

    return date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
  } catch (e) {
    console.error("Erro ao formatar data:", dateStr, e);
    return dateStr;
  }
}

/**
 * Formata a data de competência por extenso (ex: "NOVEMBRO DE 2025").
 * Utilizado para cabeçalhos de análise crítica e Tooltips.
 * @param dateStr Data no formato ISO ou YYYY-MM ou YYYY-MM-DD.
 */
export function formatCompetenciaLonga(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    // Se não vier o dia na string, assume dia 1 para evitar NaN
    const day = parts[2] ? Number(parts[2]) : 1;

    const date = new Date(year, month, day);

    // Validação extra caso a data fique inválida
    if (isNaN(date.getTime())) return dateStr.toUpperCase();

    // Primeira letra maiúscula para ficar bonito no Tooltip (ex: "Janeiro de 2025")
    const formatada = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return formatada.charAt(0).toUpperCase() + formatada.slice(1);
  } catch (e) {
    return dateStr.toUpperCase();
  }
}

/**
 * Extrai o valor numérico de uma string de meta vinda do backend.
 */
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

/**
 * Calcula a variação percentual entre o valor atual e o anterior.
 */
export function getVariacao(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
