"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { KpiCard } from "./kpi-card";
import { EvolutionChart } from "./evolution-chart";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, Pin, PinOff, X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useColumns } from "@/hooks/use-columns";
import { UnitSelector } from "./unit-selector"; // Importe o seletor

export function SectorDashboard() {
  const {
    setorAtivo,
    indicadoresAtuais,
    unidadeSelecionada, // Necessário para passar nas ações
    loading,
    toggleItemComparador,
    itensComparacao,
    setComparadorAberto,
    toggleItemPainel,
    isNoPainel,
    isComparando,
  } = useDashboard();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const columns = useColumns();

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col gap-6 h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Carregando indicadores...
        </p>
      </div>
    );
  }

  // Seletor de Unidade Obrigatório (caso não tenha carregado default)
  if (!unidadeSelecionada) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-lg font-semibold">Selecione uma Unidade</h2>
        <UnitSelector />
      </div>
    );
  }

  // --- Lógica de Renderização ---
  const renderGrid = () => {
    const items: React.ReactNode[] = [];
    if (!indicadoresAtuais || indicadoresAtuais.length === 0) return items;

    const expandedIndex = indicadoresAtuais.findIndex(
      (i) => i.id === expandedId,
    );
    const expandedRow = Math.floor(expandedIndex / columns);

    indicadoresAtuais.forEach((ind, index) => {
      const isExpanded = expandedId === ind.id;
      // Passa ID do indicador e ID da unidade atual
      const isPinned = isNoPainel(ind.id, unidadeSelecionada);
      const isComparing = isComparando(ind.id, unidadeSelecionada);

      items.push(
        <div key={ind.id} className="relative group/card h-full">
          <KpiCard
            indicador={ind}
            isActive={isExpanded}
            onClick={() => setExpandedId(isExpanded ? null : ind.id)}
          />
          {/* Ações Rápidas */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            {/* Botão Fixar */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemPainel(ind.id, unidadeSelecionada);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                      isPinned
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
                    } backdrop-blur-sm border border-border/50`}
                  >
                    {isPinned ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {isPinned ? "Remover do Meu Painel" : "Fixar no Meu Painel"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Botão Comparar */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemComparador(ind.id, unidadeSelecionada);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                      isComparing
                        ? "bg-chart-2 text-primary-foreground"
                        : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
                    } backdrop-blur-sm border border-border/50`}
                  >
                    <GitCompareArrows className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {isComparing
                      ? "Remover da comparação"
                      : "Adicionar à comparação"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>,
      );

      // Lógica de Expansão (Gráfico Inline)
      const currentRow = Math.floor(index / columns);
      const isLastInRow = (index + 1) % columns === 0;
      const isLastItem = index === indicadoresAtuais.length - 1;

      if (
        expandedId !== null &&
        currentRow === expandedRow &&
        (isLastInRow || isLastItem)
      ) {
        const expandedObj = indicadoresAtuais[expandedIndex];
        if (expandedObj) {
          items.push(
            <div
              key={`expanded-${expandedId}`}
              className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 w-full animate-in slide-in-from-top-4 fade-in duration-300 py-4"
            >
              <div className="relative border rounded-lg bg-card/50 p-1 shadow-inner">
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setExpandedId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <EvolutionChart indicador={expandedObj} />
              </div>
            </div>,
          );
        }
      }
    });

    return items;
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header com Seletor de Unidade */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              {setorAtivo}
            </h1>
            {/* Seletor Inline ao lado do título em Desktop */}
            <div className="hidden md:block">
              <UnitSelector />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {indicadoresAtuais.length} indicadores monitorados na unidade
            selecionada.
          </p>
          {/* Seletor em Mobile */}
          <div className="block md:hidden mt-1">
            <UnitSelector />
          </div>
        </div>

        {itensComparacao.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setComparadorAberto(true)}
          >
            <GitCompareArrows className="h-4 w-4" />
            Comparar ({itensComparacao.length})
          </Button>
        )}
      </div>

      {indicadoresAtuais.length === 0 ? (
        <div className="flex h-32 items-center justify-center border-2 border-dashed rounded-lg bg-muted/10">
          <p className="text-muted-foreground">
            Nenhum dado encontrado para esta unidade.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {renderGrid()}
        </div>
      )}
    </div>
  );
}
