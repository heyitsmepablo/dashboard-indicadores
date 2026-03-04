import { Indicador, Unidade, Superintendencia, TipoUnidade } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const DashifyService = {
  getHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("dashify_token")
        : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Credenciais inválidas");
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Falha ao alterar senha");
    }
    return res.json();
  },

  async getSuperintendencias(): Promise<Superintendencia[]> {
    const res = await fetch(`${API_URL}/superintendencia`, {
      headers: this.getHeaders(),
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error("Falha ao buscar superintendencias");
    return res.json();
  },

  async getTiposUnidade(): Promise<TipoUnidade[]> {
    const res = await fetch(`${API_URL}/tipo-unidade`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Falha ao buscar tipos de unidade");
    return res.json();
  },

  async getUnidades(): Promise<Unidade[]> {
    const res = await fetch(`${API_URL}/unidades`, {
      headers: this.getHeaders(),
    });
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
    const res = await fetch(`${API_URL}/indicador?${params.toString()}`, {
      headers: this.getHeaders(),
    });
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
          { headers: this.getHeaders() },
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

  async getMinisterialSih(
    unidadeId?: number,
    ano?: number,
    global: boolean = true,
  ) {
    const params = new URLSearchParams();
    if (unidadeId !== undefined && !global)
      params.append("unidadeId", String(unidadeId));
    if (ano) params.append("ano", String(ano));
    params.append("global", String(global));

    const res = await fetch(
      `${API_URL}/indicador/ministerial/sih?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error("Falha ao buscar SIH");
    return res.json();
  },

  async getMinisterialSia(
    unidadeId?: number,
    ano?: number,
    global: boolean = true,
  ) {
    const params = new URLSearchParams();
    if (unidadeId !== undefined && !global)
      params.append("unidadeId", String(unidadeId));
    if (ano) params.append("ano", String(ano));
    params.append("global", String(global));

    const res = await fetch(
      `${API_URL}/indicador/ministerial/sia/resumo?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error("Falha ao buscar SIA");
    return res.json();
  },

  async gerarAnaliseIA(
    indicadorId: number,
    unidadeId: number,
    dadosContexto: any,
  ): Promise<{ indicadorId: number; analiseGerada: string }> {
    const res = await fetch(`${API_URL}/analises/gerar-agora`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        indicadorId,
        unidadeId,
        dadosContexto,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || "Falha ao gerar análise de IA. Tente novamente.",
      );
    }
    return res.json();
  },
};
