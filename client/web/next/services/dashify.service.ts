// src/services/dashify.service.ts
import { Indicador, Unidade } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const DashifyService = {
  async getSetores(): Promise<string[]> {
    const res = await fetch(`${API_URL}/indicador/setores`);
    if (!res.ok) throw new Error("Falha ao buscar setores");
    return res.json();
  },

  async getSectorCounts(): Promise<Record<string, number>> {
    // Simulação ou endpoint real se houver
    // Por enquanto, pegamos todos e contamos no frontend se necessário
    // ou assumimos zero.
    return {};
  },

  async getUnidades(): Promise<Unidade[]> {
    const res = await fetch(`${API_URL}/unidades`);
    if (!res.ok) throw new Error("Falha ao buscar unidades");
    return res.json();
  },

  async getUnidadesPorTipo(tipoId: number): Promise<Unidade[]> {
    const res = await fetch(`${API_URL}/unidades?tipoId=${tipoId}`);
    if (!res.ok) throw new Error("Falha ao buscar unidades por tipo");
    return res.json();
  },

  // Busca indicadores de um setor, opcionalmente filtrando por unidade
  async getIndicadores(
    setor?: string,
    unidadeId?: number,
  ): Promise<Indicador[]> {
    const params = new URLSearchParams();
    if (setor) params.append("setor", setor);
    if (unidadeId) params.append("unidadeId", String(unidadeId));

    const res = await fetch(`${API_URL}/indicador?${params.toString()}`);
    if (!res.ok) throw new Error("Falha ao buscar indicadores");

    const data = await res.json();

    // Injeta o ID da unidade no objeto indicador para referência no frontend
    return data.map((ind: any) => ({
      ...ind,
      unidadeId: unidadeId,
      // Se a API retornar resultados com include: unidades, podemos pegar o nome de lá
      nomeUnidade: ind.resultados?.[0]?.unidades?.sigla || "Geral",
    }));
  },

  // Busca lista de indicadores para comparação
  // Como a API original filtra por 1 unidadeId, fazemos múltiplas chamadas se necessário
  async getComparacao(
    selecoes: { id: number; unidadeId: number }[],
  ): Promise<Indicador[]> {
    if (selecoes.length === 0) return [];

    // Agrupa por unidade para minimizar requisições
    const porUnidade: Record<number, number[]> = {};
    selecoes.forEach((s) => {
      if (!porUnidade[s.unidadeId]) porUnidade[s.unidadeId] = [];
      porUnidade[s.unidadeId].push(s.id);
    });

    const promises = Object.entries(porUnidade).map(
      async ([unidadeId, ids]) => {
        const params = new URLSearchParams();
        params.append("ids", ids.join(","));
        params.append("unidadeId", unidadeId);

        const res = await fetch(
          `${API_URL}/indicador/comparar?${params.toString()}`,
        );
        if (!res.ok) return [];

        const data = await res.json();
        // Injeta metadados de unidade
        return data.map((d: any) => ({
          ...d,
          unidadeId: Number(unidadeId),
          // Tenta pegar o nome da unidade do primeiro resultado
          nomeUnidade:
            d.resultados?.[0]?.unidades?.sigla || `Unid. ${unidadeId}`,
        }));
      },
    );

    const results = await Promise.all(promises);
    return results.flat();
  },
};
