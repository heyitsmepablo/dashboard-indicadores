import { Indicador, Unidade, Superintendencia, TipoUnidade } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const DashifyService = {
  async getSuperintendencias(): Promise<Superintendencia[]> {
    const res = await fetch(`${API_URL}/superintendencia`);
    if (!res.ok) throw new Error("Falha ao buscar superintendencias");
    return res.json();
  },

  async getTiposUnidade(): Promise<TipoUnidade[]> {
    const res = await fetch(`${API_URL}/tipo-unidade`);
    if (!res.ok) throw new Error("Falha ao buscar tipos de unidade");
    return res.json();
  },

  async getUnidades(): Promise<Unidade[]> {
    const res = await fetch(`${API_URL}/unidades`);
    if (!res.ok) throw new Error("Falha ao buscar unidades");
    return res.json();
  },

  async getIndicadores(
    tipoUnidadeId?: number,
    unidadeId?: number,
  ): Promise<Indicador[]> {
    const params = new URLSearchParams();
    if (tipoUnidadeId) params.append("tipoUnidadeId", String(tipoUnidadeId));
    if (unidadeId) params.append("unidadeId", String(unidadeId));

    const res = await fetch(`${API_URL}/indicador?${params.toString()}`);
    if (!res.ok) throw new Error("Falha ao buscar indicadores");

    const data = await res.json();
    return data.map((ind: any) => ({
      ...ind,
      unidadeId: unidadeId,
      nomeUnidade: ind.resultados?.[0]?.unidades?.sigla || "Geral",
    }));
  },

  async getComparacao(
    selecoes: { id: number; unidadeId: number }[],
  ): Promise<Indicador[]> {
    if (selecoes.length === 0) return [];

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
        return data.map((d: any) => ({
          ...d,
          unidadeId: Number(unidadeId),
          nomeUnidade:
            d.resultados?.[0]?.unidades?.sigla || `Unid. ${unidadeId}`,
        }));
      },
    );

    const results = await Promise.all(promises);
    return results.flat();
  },
};
