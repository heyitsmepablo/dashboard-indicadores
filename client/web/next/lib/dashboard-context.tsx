"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import { DashifyService } from "@/services/dashify.service";
import { Indicador, Unidade } from "@/lib/types";
import { filtrarUnidadesPorSetor } from "@/lib/sector-utils";

export type ViewMode = "setor" | "comparador" | "meu-painel";

export interface ItemSelecao {
  id: number;
  unidadeId: number;
}

interface DashboardContextType {
  // Estado de Dados
  loading: boolean;
  loadingComparador: boolean;
  setores: string[];
  sectorCounts: Record<string, number>;
  unidades: Unidade[];
  unidadesFiltradas: Unidade[];
  indicadoresAtuais: Indicador[];
  listaCompleta: Indicador[];

  // Navegação
  setorAtivo: string;
  setSetorAtivo: (setor: string) => void;
  unidadeSelecionada: number | null;
  setUnidadeSelecionada: (id: number | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Comparador
  itensComparacao: ItemSelecao[];
  dadosComparacao: Indicador[];
  toggleItemComparador: (id: number, unidadeId: number) => void;
  isComparando: (id: number, unidadeId: number) => boolean;
  limparComparador: () => void;
  comparadorAberto: boolean;
  setComparadorAberto: (aberto: boolean) => void;

  // Meu Painel
  itensPainel: ItemSelecao[];
  dadosMeuPainel: Indicador[];
  toggleItemPainel: (id: number, unidadeId: number) => void;
  isNoPainel: (id: number, unidadeId: number) => boolean;
  limparPainel: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // --- Estados de UI ---
  const [viewMode, setViewMode] = useState<ViewMode>("setor");
  const [setorAtivo, setSetorAtivo] = useState<string>("");
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadingComparador, setLoadingComparador] = useState(false);

  // --- Estados de Dados da API ---
  const [setores, setSetores] = useState<string[]>([]);
  const [sectorCounts, setSectorCounts] = useState<Record<string, number>>({});
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [indicadoresAtuais, setIndicadoresAtuais] = useState<Indicador[]>([]);
  const [listaCompleta, setListaCompleta] = useState<Indicador[]>([]);

  // --- Estados de Seleção Local ---
  const [itensComparacao, setItensComparacao] = useState<ItemSelecao[]>([]);
  const [dadosComparacao, setDadosComparacao] = useState<Indicador[]>([]);
  const [itensPainel, setItensPainel] = useState<ItemSelecao[]>([]);
  const [dadosMeuPainel, setDadosMeuPainel] = useState<Indicador[]>([]);

  // 1. Carga Inicial (Setores, Unidades e Contagens)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [listaSetores, listaUnidades, counts] = await Promise.all([
          DashifyService.getSetores(),
          DashifyService.getUnidades(),
          DashifyService.getSectorCounts(),
        ]);
        setSetores(listaSetores);
        setUnidades(listaUnidades);
        setSectorCounts(counts);

        if (listaSetores.length > 0 && !setorAtivo) {
          setSetorAtivo(listaSetores[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // 2. Lógica de Filtragem de Unidades por Setor
  const unidadesFiltradas = useMemo(() => {
    if (!setorAtivo || unidades.length === 0) return [];
    return filtrarUnidadesPorSetor(setorAtivo, unidades);
  }, [setorAtivo, unidades]);

  // 3. Reset/Auto-seleção de Unidade ao mudar o Setor
  useEffect(() => {
    if (unidadesFiltradas.length > 0) {
      const isValida = unidadesFiltradas.some(
        (u) => u.id === unidadeSelecionada,
      );
      if (!isValida || unidadeSelecionada === null) {
        setUnidadeSelecionada(unidadesFiltradas[0].id);
      }
    } else {
      setUnidadeSelecionada(null);
    }
  }, [unidadesFiltradas, unidadeSelecionada]);

  // 4. Carregamento de Indicadores do Setor/Unidade Ativo
  useEffect(() => {
    if (!setorAtivo || !unidadeSelecionada || viewMode !== "setor") return;

    async function loadIndicadores() {
      setLoading(true);
      try {
        const dados = await DashifyService.getIndicadores(
          setorAtivo,
          unidadeSelecionada!,
        );
        const dadosTratados = dados.map((d) => ({
          ...d,
          resultados: (d.resultados || []).map((r) => ({
            ...r,
            valor: Number(r.valor),
          })),
        }));
        setIndicadoresAtuais(dadosTratados);
      } catch (error) {
        console.error("Erro ao carregar indicadores", error);
        setIndicadoresAtuais([]);
      } finally {
        setLoading(false);
      }
    }
    loadIndicadores();
  }, [setorAtivo, unidadeSelecionada, viewMode]);

  // 5. Carga de Lista Completa para o Comparador (Lazy Load)
  useEffect(() => {
    if (viewMode === "comparador" && listaCompleta.length === 0) {
      async function loadAll() {
        setLoadingComparador(true);
        try {
          const dados = await DashifyService.getIndicadores();
          setListaCompleta(dados);
        } catch (e) {
          console.error("Erro ao carregar lista completa", e);
        } finally {
          setLoadingComparador(false);
        }
      }
      loadAll();
    }
  }, [viewMode, listaCompleta]);

  // 6. Carregamento dos dados detalhados para o Comparador
  useEffect(() => {
    if (itensComparacao.length === 0) {
      setDadosComparacao([]);
      return;
    }
    async function loadComparacao() {
      try {
        const dados = await DashifyService.getComparacao(itensComparacao);
        const dadosTratados = dados.map((d) => ({
          ...d,
          resultados: (d.resultados || []).map((r) => ({
            ...r,
            valor: Number(r.valor),
          })),
        }));
        setDadosComparacao(dadosTratados);
      } catch (e) {
        console.error("Erro ao carregar dados de comparação", e);
      }
    }
    loadComparacao();
  }, [itensComparacao]);

  // 7. Carregamento dos dados do Meu Painel
  useEffect(() => {
    if (itensPainel.length === 0) {
      setDadosMeuPainel([]);
      return;
    }
    async function loadMeuPainel() {
      try {
        const dados = await DashifyService.getComparacao(itensPainel);
        const dadosTratados = dados.map((d) => ({
          ...d,
          resultados: (d.resultados || []).map((r) => ({
            ...r,
            valor: Number(r.valor),
          })),
        }));
        setDadosMeuPainel(dadosTratados);
      } catch (e) {
        console.error("Erro ao carregar dados do painel", e);
      }
    }
    if (viewMode === "meu-painel" || itensPainel.length > 0) {
      loadMeuPainel();
    }
  }, [itensPainel, viewMode]);

  // --- Actions ---

  const existsInList = (list: ItemSelecao[], id: number, unidadeId: number) => {
    return list.some((i) => i.id === id && i.unidadeId === unidadeId);
  };

  /**
   * Toggle com Regra de Negócio:
   * - Permite múltiplos indicadores se forem da mesma unidade (Análise Interna).
   * - Permite múltiplas unidades se for o mesmo indicador (Benchmarking).
   * - Bloqueia mistura de indicadores diferentes em unidades diferentes.
   */
  const toggleItemComparador = useCallback((id: number, unidadeId: number) => {
    setItensComparacao((prev) => {
      const isRemovendo = existsInList(prev, id, unidadeId);

      if (isRemovendo) {
        return prev.filter((i) => !(i.id === id && i.unidadeId === unidadeId));
      }

      // Primeiro item sempre permitido
      if (prev.length === 0) return [{ id, unidadeId }];

      const primeiro = prev[0];

      // Se já tem 1 item, o segundo define o modo
      if (prev.length === 1) {
        if (primeiro.unidadeId === unidadeId || primeiro.id === id) {
          return [...prev, { id, unidadeId }];
        }
        // Se tentar algo incompatível, substitui o anterior (UX fluida)
        return [{ id, unidadeId }];
      }

      // Se já tem modo definido (MESMA_UNIDADE ou MULTI_UNIDADE)
      const modoMesmaUnidade = prev.every(
        (i) => i.unidadeId === primeiro.unidadeId,
      );
      const modoMultiUnidade = prev.every((i) => i.id === primeiro.id);

      if (modoMesmaUnidade && unidadeId === primeiro.unidadeId) {
        return [...prev, { id, unidadeId }];
      }

      if (modoMultiUnidade && id === primeiro.id) {
        return [...prev, { id, unidadeId }];
      }

      // Se não encaixa na regra, mantém o estado atual
      return prev;
    });
  }, []);

  const isComparando = useCallback(
    (id: number, unidadeId: number) =>
      existsInList(itensComparacao, id, unidadeId),
    [itensComparacao],
  );

  const limparComparador = useCallback(() => setItensComparacao([]), []);

  const toggleItemPainel = useCallback((id: number, unidadeId: number) => {
    setItensPainel((prev) => {
      if (existsInList(prev, id, unidadeId)) {
        return prev.filter((i) => !(i.id === id && i.unidadeId === unidadeId));
      }
      return [...prev, { id, unidadeId }];
    });
  }, []);

  const isNoPainel = useCallback(
    (id: number, unidadeId: number) => existsInList(itensPainel, id, unidadeId),
    [itensPainel],
  );

  const limparPainel = useCallback(() => setItensPainel([]), []);

  const setComparadorAberto = useCallback((aberto: boolean) => {
    setViewMode(aberto ? "comparador" : "setor");
  }, []);

  const comparadorAberto = viewMode === "comparador";

  return (
    <DashboardContext.Provider
      value={{
        loading,
        loadingComparador,
        setores,
        sectorCounts,
        unidades,
        unidadesFiltradas,
        indicadoresAtuais,
        listaCompleta,
        setorAtivo,
        setSetorAtivo,
        unidadeSelecionada,
        setUnidadeSelecionada,
        viewMode,
        setViewMode,
        itensComparacao,
        dadosComparacao,
        toggleItemComparador,
        isComparando,
        limparComparador,
        itensPainel,
        dadosMeuPainel,
        toggleItemPainel,
        isNoPainel,
        limparPainel,
        comparadorAberto,
        setComparadorAberto,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
