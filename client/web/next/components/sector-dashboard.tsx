"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { KpiCard } from "./kpi-card";
import { EvolutionChart } from "./evolution-chart";
import { Button } from "@/components/ui/button";
import {
  GitCompareArrows,
  Pin,
  PinOff,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useColumns } from "@/hooks/use-columns";
import { UnitSelector } from "./unit-selector";

export function SectorDashboard() {
  const {
    setorAtivo,
    indicadoresAtuais,
    unidadeSelecionada,
    unidadesFiltradas, // Usamos isso para saber se o setor tem unidades
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

  // 1. Estado de Carregamento
  if (loading) {
    return (
      <div className="flex flex-col gap-4 h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Carregando indicadores...
        </p>
      </div>
    );
  }

  // 2. Estado Vazio: O setor não tem nenhuma unidade cadastrada
  if (unidadesFiltradas.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-20">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            {setorAtivo}
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4 border-2 border-dashed rounded-xl bg-muted/10 p-8 text-center animate-in fade-in duration-500">
          <div className="bg-background p-4 rounded-full shadow-sm mb-2">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Sem unidades vinculadas
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Não encontramos nenhuma unidade cadastrada ou mapeada para o setor
            de <strong className="text-foreground">{setorAtivo}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // 3. Estado de Seleção Pendente: Tem unidades, mas nenhuma foi selecionada (fallback)
  if (!unidadeSelecionada) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Selecione uma Unidade
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma unidade para visualizar seus indicadores.
        </p>
        <div className="w-full max-w-xs mt-2">
          <UnitSelector />
        </div>
      </div>
    );
  }

  // --- Lógica de Renderização do Grid de Indicadores ---
  const renderGrid = () => {
    const items: React.ReactNode[] = [];
    if (!indicadoresAtuais || indicadoresAtuais.length === 0) return items;

    const expandedIndex = indicadoresAtuais.findIndex(
      (i) => i.id === expandedId,
    );
    const expandedRow = Math.floor(expandedIndex / columns);

    indicadoresAtuais.forEach((ind, index) => {
      const isExpanded = expandedId === ind.id;
      const isPinned = isNoPainel(ind.id, unidadeSelecionada);
      const isComparing = isComparando(ind.id, unidadeSelecionada);

      items.push(
        <div key={ind.id} className="relative group/card h-full">
          <KpiCard
            indicador={ind}
            isActive={isExpanded}
            onClick={() => setExpandedId(isExpanded ? null : ind.id)}
          />
          {/* Ações Rápidas Flutuantes */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            {/* Fixar no Painel */}
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
                    } backdrop-blur-sm border border-border/50 shadow-sm`}
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

            {/* Adicionar ao Comparador */}
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
                    } backdrop-blur-sm border border-border/50 shadow-sm`}
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

      // Lógica de Expansão (Gráfico Inline ocupando toda a linha)
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
              <div className="relative border rounded-xl bg-card/50 p-1 shadow-inner">
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
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
      {/* Header com Título e Seletor de Unidade */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              {setorAtivo}
            </h1>
            {/* Seletor Inline (Desktop) */}
            <div className="hidden md:block w-64">
              <UnitSelector />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {indicadoresAtuais.length} indicadores monitorados na unidade
            selecionada.
          </p>
          {/* Seletor Inline (Mobile) */}
          <div className="block md:hidden mt-2 w-full">
            <UnitSelector />
          </div>
        </div>

        {/* Botão de Comparação Flutuante no Header */}
        {itensComparacao.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0 border-chart-2/50 text-chart-2 hover:bg-chart-2/10 hover:text-chart-2"
            onClick={() => setComparadorAberto(true)}
          >
            <GitCompareArrows className="h-4 w-4" />
            Comparar ({itensComparacao.length})
          </Button>
        )}
      </div>

      {/* Grid ou Estado Vazio de Indicadores */}
      {indicadoresAtuais.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl bg-muted/5 gap-2">
          <p className="text-muted-foreground font-medium">
            Nenhum indicador registrado.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Esta unidade ainda não possui dados alimentados para este setor.
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
