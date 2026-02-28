"use client";

import { useState, useMemo, useEffect } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { formatCompetencia } from "@/lib/format";
import { DashifyService } from "@/services/dashify.service";
import { Indicador } from "@/lib/types";
import { ComparatorSidebar } from "./comparator-sidebar";
import { ComparatorResults } from "./comparator-results";
import type { ChartType } from "@/components/evolution-chart";

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

/**
 * Componente Contêiner (Smart) do Comparador.
 * Gerencia o estado e delega a renderização para os componentes filhos.
 */
export function IndicatorComparator() {
  const {
    dadosComparacao,
    itensComparacao,
    toggleItemComparador,
    limparComparador,
    unidades,
    superintendencias,
    listaCompleta,
  } = useDashboard();

  const [chartType, setChartType] = useState<ChartType>("line");
  const [localSupId, setLocalSupId] = useState<string>("");
  const [localTipoId, setLocalTipoId] = useState<string>("");
  const [localUnidadeId, setLocalUnidadeId] = useState<number | null>(null);
  const [indicadoresDisponiveis, setIndicadoresDisponiveis] = useState<
    Indicador[]
  >([]);
  const [loadingIndicadores, setLoadingIndicadores] = useState(false);
  const [activeUnits, setActiveUnits] = useState<number[]>([]);
  const [termoBuscaIndicador, setTermoBuscaIndicador] = useState("");

  const [disabledUnitIds, setDisabledUnitIds] = useState<number[]>([]);
  const [validatingUnits, setValidatingUnits] = useState(false);

  useEffect(() => {
    const currentUnits = Array.from(
      new Set(itensComparacao.map((i) => i.unidadeId)),
    );
    if (currentUnits.length > 0)
      setActiveUnits((prev) => Array.from(new Set([...prev, ...currentUnits])));
  }, [itensComparacao]);

  const getSiglaUnidade = (id: number) =>
    unidades.find((u) => u.id === id)?.sigla || `#${id}`;

  const modo = useMemo(() => {
    if (itensComparacao.length < 2) return "INICIAL";
    const uId = itensComparacao[0].unidadeId;
    const iId = itensComparacao[0].id;
    if (itensComparacao.every((i) => i.unidadeId === uId))
      return "MESMA_UNIDADE";
    if (itensComparacao.every((i) => i.id === iId)) return "MULTI_UNIDADE";
    return "MISTO";
  }, [itensComparacao]);

  const tiposDaSup = useMemo(() => {
    if (!localSupId) return [];
    return (
      superintendencias.find((s) => s.id === Number(localSupId))
        ?.tipo_de_unidade || []
    );
  }, [localSupId, superintendencias]);

  const unidadesDoTipo = useMemo(() => {
    return localTipoId
      ? unidades.filter((u) => u.tipo_unidade_id === Number(localTipoId))
      : [];
  }, [localTipoId, unidades]);

  useEffect(() => {
    setLocalTipoId("");
    setLocalUnidadeId(null);
  }, [localSupId]);

  useEffect(() => {
    setLocalUnidadeId(null);
  }, [localTipoId]);

  useEffect(() => {
    if (localUnidadeId && localTipoId) {
      setLoadingIndicadores(true);
      DashifyService.getIndicadores(Number(localTipoId), localUnidadeId)
        .then(async (base) => {
          if (base.length === 0) return setIndicadoresDisponiveis([]);
          const idsSelecao = base.map((ind) => ({
            id: ind.id,
            unidadeId: localUnidadeId,
          }));
          const comResultados = await DashifyService.getComparacao(idsSelecao);
          setIndicadoresDisponiveis(comResultados);
        })
        .finally(() => setLoadingIndicadores(false));
    }
  }, [localUnidadeId, localTipoId]);

  const activeIndIds = Array.from(new Set(itensComparacao.map((i) => i.id)));
  const currentActiveIndId = activeIndIds.length === 1 ? activeIndIds[0] : null;

  useEffect(() => {
    if (currentActiveIndId !== null && unidadesDoTipo.length > 0) {
      setValidatingUnits(true);
      const checkQueries = unidadesDoTipo.map((u) => ({
        id: currentActiveIndId,
        unidadeId: u.id,
      }));

      DashifyService.getComparacao(checkQueries)
        .then((resultados) => {
          const unitsWithData = new Set<number>();
          resultados.forEach((ind) => {
            if (ind.resultados && ind.resultados.length > 0) {
              ind.resultados.forEach((r) => unitsWithData.add(r.unidade_id));
            }
          });

          const disabled = unidadesDoTipo
            .map((u) => u.id)
            .filter((id) => !unitsWithData.has(id));
          setDisabledUnitIds(disabled);
        })
        .catch((err) => {
          console.error("Erro ao validar unidades:", err);
          setDisabledUnitIds([]);
        })
        .finally(() => {
          setValidatingUnits(false);
        });
    } else {
      setDisabledUnitIds([]);
    }
  }, [currentActiveIndId, unidadesDoTipo]);

  const handleLimparTudo = () => {
    limparComparador();
    setActiveUnits([]);
    setLocalUnidadeId(null);
    setTermoBuscaIndicador("");
  };

  // Esta função já fazia o comportamento "Global" correto
  const removerIndicador = (indicadorId: number) => {
    itensComparacao
      .filter((i) => i.id === indicadorId)
      .forEach((item) => toggleItemComparador(item.id, item.unidadeId));
  };

  const removerUnidade = (unidadeId: number) => {
    setActiveUnits((prev) => {
      const newActiveUnits = prev.filter((id) => id !== unidadeId);
      if (localUnidadeId === unidadeId)
        setLocalUnidadeId(
          newActiveUnits.length > 0
            ? newActiveUnits[newActiveUnits.length - 1]
            : null,
        );
      return newActiveUnits;
    });
    itensComparacao
      .filter((i) => i.unidadeId === unidadeId)
      .forEach((item) => toggleItemComparador(item.id, item.unidadeId));
  };

  // CORREÇÃO AQUI: Alternância global de indicadores
  const handleToggleIndicador = (indId: number, currentUnitId: number) => {
    const isSelectedGlobally = itensComparacao.some((i) => i.id === indId);

    if (isSelectedGlobally) {
      // Se já estava selecionado, removemos de TODAS as unidades na comparação (igual ao botão X)
      removerIndicador(indId);
    } else {
      // Se não estava selecionado, adicionamos para TODAS as unidades ativas
      const unitsToApply = Array.from(new Set([...activeUnits, currentUnitId]));
      setActiveUnits(unitsToApply);

      unitsToApply.forEach((uId) => {
        if (
          !itensComparacao.some((i) => i.id === indId && i.unidadeId === uId)
        ) {
          toggleItemComparador(indId, uId);
        }
      });
    }
  };

  const handleSelectAllValidUnits = () => {
    if (!currentActiveIndId) return;

    const validUnitIds = unidadesDoTipo
      .map((u) => u.id)
      .filter((id) => !disabledUnitIds.includes(id));

    setActiveUnits((prev) => {
      const newSet = new Set([...prev, ...validUnitIds]);
      return Array.from(newSet);
    });

    validUnitIds.forEach((uId) => {
      if (
        !itensComparacao.some(
          (i) => i.id === currentActiveIndId && i.unidadeId === uId,
        )
      ) {
        toggleItemComparador(currentActiveIndId, uId);
      }
    });
  };

  const indicadoresUnicos = useMemo(() => {
    const map = new Map<number, { id: number; descricao: string }>();
    dadosComparacao.forEach((ind) =>
      map.set(ind.id, { id: ind.id, descricao: ind.descricao }),
    );
    return Array.from(map.values());
  }, [dadosComparacao]);

  const data = useMemo(() => {
    if (dadosComparacao.length === 0) return [];
    const dates = new Set<string>();
    dadosComparacao.forEach((ind) =>
      ind.resultados?.forEach((r) => dates.add(r.competencia.split("T")[0])),
    );
    return Array.from(dates)
      .sort()
      .map((d) => {
        const p: any = { competencia: formatCompetencia(d) };
        dadosComparacao.forEach((ind) => {
          const r = ind.resultados?.find((res) =>
            res.competencia.startsWith(d),
          );
          p[`ind_${ind.id}_${ind.unidadeId}`] = r ? Number(r.valor) : null;
        });
        return p;
      });
  }, [dadosComparacao]);

  const chartConfig = useMemo(() => {
    const config: any = {};
    dadosComparacao.forEach((ind, idx) => {
      config[`ind_${ind.id}_${ind.unidadeId}`] = {
        label: `${ind.descricao} (${getSiglaUnidade(ind.unidadeId!)})`,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
    return config;
  }, [dadosComparacao]);

  const indicadoresFiltrados = useMemo(() => {
    if (!termoBuscaIndicador.trim()) return indicadoresDisponiveis;
    return indicadoresDisponiveis.filter((ind) =>
      ind.descricao.toLowerCase().includes(termoBuscaIndicador.toLowerCase()),
    );
  }, [indicadoresDisponiveis, termoBuscaIndicador]);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Comparador de Performance
        </h1>
        <p className="text-sm text-muted-foreground">
          Analise múltiplos indicadores ou compare unidades entre si.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        <div className="flex flex-col min-w-0 w-full">
          <ComparatorSidebar
            localSupId={localSupId}
            setLocalSupId={setLocalSupId}
            localTipoId={localTipoId}
            setLocalTipoId={setLocalTipoId}
            localUnidadeId={localUnidadeId}
            setLocalUnidadeId={setLocalUnidadeId}
            activeUnits={activeUnits}
            setActiveUnits={setActiveUnits}
            termoBuscaIndicador={termoBuscaIndicador}
            setTermoBuscaIndicador={setTermoBuscaIndicador}
            indicadoresFiltrados={indicadoresFiltrados}
            loadingIndicadores={loadingIndicadores}
            handleLimparTudo={handleLimparTudo}
            handleToggleIndicador={handleToggleIndicador}
            isMultiMode={activeUnits.length > 1 || modo === "MULTI_UNIDADE"}
            modo={modo}
            tiposDaSup={tiposDaSup}
            unidadesDoTipo={unidadesDoTipo}
            disabledUnitIds={disabledUnitIds}
            validatingUnits={validatingUnits}
            showSelectAllUnits={currentActiveIndId !== null}
            handleSelectAllUnits={handleSelectAllValidUnits}
          />
        </div>
        <div className="flex flex-col gap-4 min-w-0 w-full">
          <ComparatorResults
            activeUnits={activeUnits}
            removerUnidade={removerUnidade}
            removerIndicador={removerIndicador}
            limparIndicadores={limparComparador}
            chartType={chartType}
            setChartType={setChartType}
            data={data}
            chartConfig={chartConfig}
            indicadoresUnicos={indicadoresUnicos}
          />
        </div>
      </div>
    </div>
  );
}
