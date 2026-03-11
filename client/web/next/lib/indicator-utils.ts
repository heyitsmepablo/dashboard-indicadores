import type { Indicador } from "@/lib/types";
import { parseMeta } from "@/lib/format";

export const INVERSE_INDICATORS = [
  "Turnover",
  "Defeitos",
  "Custos",
  "Tempo",
  "Mortalidade",
  "Glosa",
];

export const isInverseIndicator = (descricao: string): boolean => {
  return INVERSE_INDICATORS.some((term) => descricao.includes(term));
};

export const getMetaStatus = (
  valorAtual: number,
  meta: number | null,
  descricao: string,
): "above" | "below" | "none" => {
  if (meta === null) return "none";
  const inverse = isInverseIndicator(descricao);

  return inverse
    ? valorAtual <= meta
      ? "above"
      : "below"
    : valorAtual >= meta
      ? "above"
      : "below";
};

export const isVariacaoPositive = (
  variacao: number,
  descricao: string,
): boolean => {
  return isInverseIndicator(descricao) ? variacao < 0 : variacao > 0;
};
