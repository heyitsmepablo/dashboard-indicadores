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
import { Indicador, Unidade, Superintendencia, TipoUnidade } from "@/lib/types";

export type ViewMode =
  | "setor"
  | "comparador"
  | "meu-painel"
  | "ministerial-sih"
  | "ministerial-sia"
  | "alterar-senha";

export interface ItemSelecao {
  id: number;
  unidadeId: number;
}

interface DashboardContextType {
  loading: boolean;
  loadingComparador: boolean;

  superintendencias: Superintendencia[];
  tiposUnidade: TipoUnidade[];
  unidades: Unidade[];
  unidadesFiltradas: Unidade[];
  indicadoresAtuais: Indicador[];
  listaCompleta: Indicador[];
  ultimaAtualizacao: string | null;

  superintendenciaAtivaId: number | null;
  setSuperintendenciaAtivaId: (id: number | null) => void;
  tipoUnidadeAtivoId: number | null;
  setTipoUnidadeAtivoId: (id: number | null) => void;
  unidadeSelecionada: number | null;
  setUnidadeSelecionada: (id: number | null) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Novos estados para os filtros Ministeriais
  anoFiltro: number;
  setAnoFiltro: (ano: number) => void;

  itensComparacao: ItemSelecao[];
  dadosComparacao: Indicador[];
  toggleItemComparador: (
    id: number,
    unidadeId: number,
    indicadorOverride?: Indicador,
  ) => void;
  isComparando: (id: number, unidadeId: number) => boolean;
  limparComparador: () => void;
  comparadorAberto: boolean;
  setComparadorAberto: (aberto: boolean) => void;

  itensPainel: ItemSelecao[];
  dadosMeuPainel: Indicador[];
  toggleItemPainel: (
    id: number,
    unidadeId: number,
    indicadorOverride?: Indicador,
  ) => void;
  isNoPainel: (id: number, unidadeId: number) => boolean;
  limparPainel: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);
const STORAGE_KEY_PAINEL = "dashify_meu_painel_v2";
const STORAGE_KEY_MINISTERIAL_CACHE = "dashify_ministerial_cache";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("setor");

  const [superintendenciaAtivaId, setSuperintendenciaAtivaId] = useState<
    number | null
  >(null);
  const [tipoUnidadeAtivoId, setTipoUnidadeAtivoId] = useState<number | null>(
    null,
  );
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<number | null>(
    null,
  );

  // Estado adicionado para gerenciar o ano selecionado no panorama ministerial
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [loadingComparador, setLoadingComparador] = useState(false);

  const [superintendencias, setSuperintendencias] = useState<
    Superintendencia[]
  >([]);
  const [tiposUnidade, setTiposUnidade] = useState<TipoUnidade[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [indicadoresAtuais, setIndicadoresAtuais] = useState<Indicador[]>([]);
  const [listaCompleta, setListaCompleta] = useState<Indicador[]>([]);

  const [ministerialCache, setMinisterialCache] = useState<
    Record<string, Indicador>
  >({});

  const [itensComparacao, setItensComparacao] = useState<ItemSelecao[]>([]);
  const [dadosComparacao, setDadosComparacao] = useState<Indicador[]>([]);
  const [itensPainel, setItensPainel] = useState<ItemSelecao[]>([]);
  const [dadosMeuPainel, setDadosMeuPainel] = useState<Indicador[]>([]);

  const [isPainelLoaded, setIsPainelLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAINEL);
      const savedCache = localStorage.getItem(STORAGE_KEY_MINISTERIAL_CACHE);
      if (saved) setItensPainel(JSON.parse(saved));
      if (savedCache) setMinisterialCache(JSON.parse(savedCache));
    } catch (e) {
      console.error(e);
    } finally {
      setIsPainelLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isPainelLoaded) {
      localStorage.setItem(STORAGE_KEY_PAINEL, JSON.stringify(itensPainel));
      localStorage.setItem(
        STORAGE_KEY_MINISTERIAL_CACHE,
        JSON.stringify(ministerialCache),
      );
    }
  }, [itensPainel, ministerialCache, isPainelLoaded]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [listaSup, listaTipos, listaUnidades] = await Promise.all([
          DashifyService.getSuperintendencias(),
          DashifyService.getTiposUnidade(),
          DashifyService.getUnidades(),
        ]);

        const tiposSemSup = listaTipos.filter((t) => !t.superintendencia_id);
        const superintendenciasFinais = [...listaSup];

        if (tiposSemSup.length > 0) {
          superintendenciasFinais.push({
            id: -1,
            nome: "Outras Estruturas",
            sigla: "OUTROS",
            tipo_de_unidade: tiposSemSup,
          });
        }

        setSuperintendencias(superintendenciasFinais);
        setTiposUnidade(listaTipos);
        setUnidades(listaUnidades);

        if (superintendenciasFinais.length > 0) {
          setSuperintendenciaAtivaId(superintendenciasFinais[0].id);
          if (
            superintendenciasFinais[0].tipo_de_unidade &&
            superintendenciasFinais[0].tipo_de_unidade.length > 0
          ) {
            setTipoUnidadeAtivoId(
              superintendenciasFinais[0].tipo_de_unidade[0].id,
            );
          }
        }
      } catch (error) {
        console.error("Erro inicial", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const unidadesFiltradas = useMemo(() => {
    if (!tipoUnidadeAtivoId || unidades.length === 0) return [];
    return unidades.filter((u) => u.tipo_unidade_id === tipoUnidadeAtivoId);
  }, [tipoUnidadeAtivoId, unidades]);

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

  useEffect(() => {
    if (!tipoUnidadeAtivoId || !unidadeSelecionada || viewMode !== "setor")
      return;

    async function loadIndicadores() {
      setLoading(true);
      try {
        const baseIndicadores = await DashifyService.getIndicadores(
          tipoUnidadeAtivoId!,
          unidadeSelecionada!,
        );
        if (baseIndicadores.length === 0) {
          setIndicadoresAtuais([]);
          return;
        }

        const idsSelecao = baseIndicadores.map((ind) => ({
          id: ind.id,
          unidadeId: unidadeSelecionada!,
        }));
        const dadosComResultados =
          await DashifyService.getComparacao(idsSelecao);

        const dadosTratados = dadosComResultados.map((d) => ({
          ...d,
          resultados: (d.resultados || []).map((r) => ({
            ...r,
            valor: Number(r.valor),
          })),
        }));

        setIndicadoresAtuais(dadosTratados);
      } catch (error) {
        console.error("Erro ao carregar indicadores:", error);
        setIndicadoresAtuais([]);
      } finally {
        setLoading(false);
      }
    }

    loadIndicadores();
  }, [tipoUnidadeAtivoId, unidadeSelecionada, viewMode]);

  const ultimaAtualizacao = useMemo(() => {
    let maxDate = 0;
    indicadoresAtuais.forEach((ind) => {
      ind.resultados?.forEach((r) => {
        const dateStr = r.updated_at || r.competencia;
        if (dateStr) {
          const dt = new Date(dateStr).getTime();
          if (dt > maxDate) maxDate = dt;
        }
      });
    });
    if (maxDate === 0) return null;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(maxDate));
  }, [indicadoresAtuais]);

  useEffect(() => {
    if (viewMode === "comparador" && listaCompleta.length === 0) {
      setLoadingComparador(true);
      DashifyService.getIndicadores()
        .then(setListaCompleta)
        .finally(() => setLoadingComparador(false));
    }
  }, [viewMode, listaCompleta]);

  const resolveMixedData = async (itens: ItemSelecao[]) => {
    const localItems = itens.filter((i) => i.id < 9000);
    let dadosMisturados: Indicador[] = [];

    if (localItems.length > 0) {
      const dbData = await DashifyService.getComparacao(localItems);
      dadosMisturados = dbData.map((d) => ({
        ...d,
        resultados: (d.resultados || []).map((r) => ({
          ...r,
          valor: Number(r.valor),
        })),
      }));
    }

    const ministerialItems = itens.filter((i) => i.id >= 9000);
    ministerialItems.forEach((mi) => {
      const key = `${mi.id}-${mi.unidadeId}`;
      if (ministerialCache[key]) dadosMisturados.push(ministerialCache[key]);
    });

    return dadosMisturados;
  };

  useEffect(() => {
    if (itensComparacao.length === 0) {
      setDadosComparacao([]);
      return;
    }
    resolveMixedData(itensComparacao).then(setDadosComparacao);
  }, [itensComparacao, ministerialCache]);

  useEffect(() => {
    if (itensPainel.length === 0) {
      setDadosMeuPainel([]);
      return;
    }
    if (viewMode === "meu-painel" || itensPainel.length > 0) {
      resolveMixedData(itensPainel).then(setDadosMeuPainel);
    }
  }, [itensPainel, viewMode, ministerialCache]);

  const handleItemToggle = (
    id: number,
    unidadeId: number,
    stateSetter: React.Dispatch<React.SetStateAction<ItemSelecao[]>>,
    indicadorOverride?: Indicador,
  ) => {
    if (indicadorOverride && indicadorOverride.isMinisterial) {
      setMinisterialCache((prev) => ({
        ...prev,
        [`${id}-${unidadeId}`]: indicadorOverride,
      }));
    }

    stateSetter((prev) => {
      if (prev.some((i) => i.id === id && i.unidadeId === unidadeId)) {
        return prev.filter((i) => !(i.id === id && i.unidadeId === unidadeId));
      }
      return [...prev, { id, unidadeId }];
    });
  };

  const toggleItemComparador = useCallback(
    (id: number, unidadeId: number, ind?: Indicador) => {
      handleItemToggle(id, unidadeId, setItensComparacao, ind);
    },
    [],
  );

  const isComparando = useCallback(
    (id: number, unidadeId: number) =>
      itensComparacao.some((i) => i.id === id && i.unidadeId === unidadeId),
    [itensComparacao],
  );

  const limparComparador = useCallback(() => setItensComparacao([]), []);

  const toggleItemPainel = useCallback(
    (id: number, unidadeId: number, ind?: Indicador) => {
      handleItemToggle(id, unidadeId, setItensPainel, ind);
    },
    [],
  );

  const isNoPainel = useCallback(
    (id: number, unidadeId: number) =>
      itensPainel.some((i) => i.id === id && i.unidadeId === unidadeId),
    [itensPainel],
  );
  const limparPainel = useCallback(() => setItensPainel([]), []);

  const setComparadorAberto = useCallback(
    (aberto: boolean) => setViewMode(aberto ? "comparador" : "setor"),
    [],
  );

  return (
    <DashboardContext.Provider
      value={{
        loading,
        loadingComparador,
        superintendencias,
        tiposUnidade,
        unidades,
        unidadesFiltradas,
        indicadoresAtuais,
        listaCompleta,
        ultimaAtualizacao,
        superintendenciaAtivaId,
        setSuperintendenciaAtivaId,
        tipoUnidadeAtivoId,
        setTipoUnidadeAtivoId,
        unidadeSelecionada,
        setUnidadeSelecionada,
        viewMode,
        setViewMode,
        anoFiltro,
        setAnoFiltro,
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
        comparadorAberto: viewMode === "comparador",
        setComparadorAberto,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard required");
  return ctx;
}
