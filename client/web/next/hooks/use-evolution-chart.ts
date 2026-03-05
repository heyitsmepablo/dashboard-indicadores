"use client";

import { useState, useEffect, useMemo } from "react";
import { DashifyService } from "@/services/dashify.service";
import type { Indicador } from "@/lib/types";
import { parseYYYYMM, formatYYYYMM, getAvailableDates } from "@/lib/date-utils";
import { formatCompetencia } from "@/lib/format";
import { ChartType } from "@/components/features/charts/evolution-chart"; // ajuste o import se necessário

export function useEvolutionChart(indicador: Indicador) {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showLabels, setShowLabels] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showMinisterial, setShowMinisterial] = useState(false);
  const [ministerialData, setMinisterialData] = useState<any[]>([]);
  const [loadingMinisterial, setLoadingMinisterial] = useState(false);

  // IA States
  const [aiState, setAiState] = useState({
    isGenerating: false,
    analysis: null as string | null,
    displayedText: "",
    isTyping: false,
    error: null as string | null,
  });

  const resultados = indicador.resultados || [];
  const availableDates = useMemo(
    () => getAvailableDates(resultados),
    [resultados],
  );

  const hasMinisterialLink =
    !!indicador.referencia_ministerial_sistema &&
    !!indicador.referencia_ministerial_chave;

  // Setup initial dates
  useEffect(() => {
    if (availableDates.length > 0 && !startDate && !endDate) {
      const lastAvailable = availableDates[availableDates.length - 1];
      const endParsed = parseYYYYMM(lastAvailable);
      setStartDate(formatYYYYMM(endParsed - 11));
      setEndDate(lastAvailable);
    }
  }, [availableDates, startDate, endDate]);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    const start = parseYYYYMM(val);
    const end = parseYYYYMM(endDate);
    if (end > 0 && (start > end || end - start > 11)) {
      setEndDate(formatYYYYMM(start + 11));
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const end = parseYYYYMM(val);
    const start = parseYYYYMM(startDate);
    if (start > 0 && (end < start || end - start > 11)) {
      setStartDate(formatYYYYMM(end - 11));
    }
  };

  // Fetch DATASUS
  useEffect(() => {
    if (showMinisterial && hasMinisterialLink && ministerialData.length === 0) {
      const fetchMinisterial = async () => {
        setLoadingMinisterial(true);
        try {
          const targetUnit = indicador.unidadeId ?? resultados[0]?.unidade_id;
          const fetchMethod =
            indicador.referencia_ministerial_sistema === "SIH"
              ? DashifyService.getMinisterialSih
              : DashifyService.getMinisterialSia;

          const dados = await fetchMethod(
            targetUnit,
            undefined,
            targetUnit === 0,
          );
          setMinisterialData(dados);
        } catch (e) {
          console.error("Erro ao cruzar dado ministerial", e);
        } finally {
          setLoadingMinisterial(false);
        }
      };
      fetchMinisterial();
    }
  }, [
    showMinisterial,
    hasMinisterialLink,
    indicador,
    resultados,
    ministerialData.length,
  ]);

  // Process Chart Data
  const chartData = useMemo(() => {
    let processed = resultados.map((r) => ({
      competencia: formatCompetencia(r.competencia),
      rawCompetencia: r.competencia.slice(0, 7),
      valorLocal: r.valor,
      analise: r.analise_critica,
      valorMinisterio: null as number | null,
    }));

    if (startDate && endDate) {
      processed = processed.filter(
        (d) => d.rawCompetencia >= startDate && d.rawCompetencia <= endDate,
      );
    }

    if (
      showMinisterial &&
      ministerialData.length > 0 &&
      indicador.referencia_ministerial_chave
    ) {
      processed = processed.map((d) => {
        const [ano, mes] = d.rawCompetencia.split("-");
        const match = ministerialData.find(
          (m) => m.ano === Number(ano) && m.mes === Number(mes),
        );
        return {
          ...d,
          valorMinisterio: match
            ? Number(match[indicador.referencia_ministerial_chave!])
            : null,
        };
      });
    }

    return processed.sort((a, b) =>
      a.rawCompetencia.localeCompare(b.rawCompetencia),
    );
  }, [
    resultados,
    startDate,
    endDate,
    showMinisterial,
    ministerialData,
    indicador,
  ]);

  // Typing Effect IA
  useEffect(() => {
    if (!aiState.analysis) {
      setAiState((prev) => ({ ...prev, displayedText: "", isTyping: false }));
      return;
    }
    setAiState((prev) => ({ ...prev, isTyping: true }));
    const tokens = aiState.analysis.split(/(\s+)/);
    let currentTokenIndex = 0;
    let currentText = "";

    const intervalId = setInterval(() => {
      const tokensToTake = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < tokensToTake; i++) {
        if (currentTokenIndex < tokens.length) {
          currentText += tokens[currentTokenIndex];
          currentTokenIndex++;
        }
      }
      setAiState((prev) => ({ ...prev, displayedText: currentText }));
      if (currentTokenIndex >= tokens.length) {
        clearInterval(intervalId);
        setAiState((prev) => ({ ...prev, isTyping: false }));
      }
    }, 25);
    return () => clearInterval(intervalId);
  }, [aiState.analysis]);

  const handleGenerateIA = async () => {
    const unidadeIdToUse = indicador.unidadeId ?? resultados[0]?.unidade_id;
    if (unidadeIdToUse === undefined) {
      setAiState((prev) => ({
        ...prev,
        error: "ID da unidade não encontrado.",
      }));
      return;
    }

    setAiState((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      analysis: null,
      displayedText: "",
    }));

    const payloadParaIA = {
      nome: indicador.descricao,
      meta: indicador.meta,
      unidadeMedida: indicador.unidade_de_medida,
      historico: chartData.map((d) => ({
        mes: d.rawCompetencia,
        valorLocal: d.valorLocal,
        ...(showMinisterial ? { valorRedeDatasus: d.valorMinisterio } : {}),
      })),
      visaoGlobal: unidadeIdToUse === 0,
    };

    try {
      const result = await DashifyService.gerarAnaliseIA(
        indicador.id,
        unidadeIdToUse,
        payloadParaIA,
      );
      setAiState((prev) => ({ ...prev, analysis: result.analiseGerada }));
    } catch (error: any) {
      setAiState((prev) => ({
        ...prev,
        error: error.message || "Erro desconhecido",
      }));
    } finally {
      setAiState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const clearAi = () =>
    setAiState((prev) => ({ ...prev, analysis: null, displayedText: "" }));

  return {
    chartType,
    setChartType,
    showLabels,
    setShowLabels,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    showMinisterial,
    setShowMinisterial,
    loadingMinisterial,
    hasMinisterialLink,
    availableDates,
    chartData,
    aiState,
    handleGenerateIA,
    clearAi,
  };
}
