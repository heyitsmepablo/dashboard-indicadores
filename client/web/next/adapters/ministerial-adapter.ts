import type { Indicador, Resultado } from "@/lib/types";

// Função pura: fácil de testar, não depende de React, não depende de API.
export function adaptMinisterialToIndicador(
  dadosRaw: any[],
  tipo: "sih" | "sia",
  unidadeId: number,
): Indicador[] {
  if (!dadosRaw || dadosRaw.length === 0) return [];

  const mapField = (
    key: string,
    descricao: string,
    unidadeMedida: any = "ABSOLUTO",
  ): Indicador => {
    // Gera ID fake para não conflitar no front
    const fakeId =
      Math.abs(
        key.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & a, 0),
      ) + 9000;

    const resultados: Resultado[] = dadosRaw
      .map((d: any, idx) => ({
        id: fakeId + idx,
        indicador_id: fakeId,
        unidade_id: unidadeId,
        competencia: `${d.ano}-${String(d.mes).padStart(2, "0")}-01T00:00:00.000Z`,
        valor: Number(d[key] || 0),
      }))
      .reverse();

    return {
      id: fakeId,
      descricao,
      meta: null,
      unidade_de_medida: unidadeMedida,
      resultados,
      isMinisterial: true,
      ministerialKey: key,
      unidadeId: unidadeId,
    };
  };

  if (tipo === "sih") {
    return [
      mapField("total_internacoes", "Total de Internações (AIH)", "ABSOLUTO"),
      mapField(
        "taxa_mortalidade_institucional",
        "Taxa de Mortalidade Institucional",
        "PERCENTUAL",
      ),
      mapField("media_permanencia_dias", "Média de Permanência", "TEMPO_DIAS"),
      mapField("proporcao_icsap", "Proporção de ICSAP", "PERCENTUAL"),
      mapField("faturamento_total_sih", "Faturamento Total SIH", "FINANCEIRO"),
      mapField(
        "ticket_medio_internacao",
        "Ticket Médio por Internação",
        "FINANCEIRO",
      ),
    ];
  }

  return [
    mapField(
      "quantidade_produzida",
      "Qtd. Procedimentos Produzidos",
      "ABSOLUTO",
    ),
    mapField("quantidade_aprovada", "Qtd. Procedimentos Aprovados", "ABSOLUTO"),
    mapField(
      "indice_glosa_ambulatorial",
      "Índice de Glosa Ambulatorial",
      "PERCENTUAL",
    ),
    mapField("faturamento_total_sia", "Faturamento Aprovado SIA", "FINANCEIRO"),
  ];
}
