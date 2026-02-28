"use client";

import { ReactNode } from "react";
import { KpiCard } from "@/components/kpi-card";
import { EvolutionChart } from "@/components/evolution-chart";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, Pin, PinOff, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Indicador } from "@/lib/types";

interface SectorGridProps {
  /** Lista de indicadores já filtrados pela busca */
  indicadores: Indicador[];
  /** ID do indicador que está com o gráfico expandido */
  expandedId: number | null;
  /** Função para expandir ou recolher o gráfico de um indicador */
  setExpandedId: (id: number | null) => void;
  /** Quantidade de colunas atuais da grid (responsivo) */
  columns: number;
  /** ID da unidade atualmente selecionada */
  unidadeSelecionada: number;
  /** Função para fixar/desfixar do Meu Painel */
  toggleItemPainel: (id: number, unidadeId: number) => void;
  /** Verifica se o indicador está no Meu Painel */
  isNoPainel: (id: number, unidadeId: number) => boolean;
  /** Função para adicionar/remover do Comparador */
  toggleItemComparador: (id: number, unidadeId: number) => void;
  /** Verifica se o indicador está no Comparador */
  isComparando: (id: number, unidadeId: number) => boolean;
}

/**
 * Componente de Apresentação (Dumb) responsável por renderizar a grade de cartões KPI.
 * Gerencia a inserção dinâmica do gráfico de evolução na linha correta.
 */
export function SectorGrid({
  indicadores,
  expandedId,
  setExpandedId,
  columns,
  unidadeSelecionada,
  toggleItemPainel,
  isNoPainel,
  toggleItemComparador,
  isComparando,
}: SectorGridProps) {
  const renderItems = () => {
    const items: ReactNode[] = [];
    if (!indicadores || indicadores.length === 0) return items;

    // Calcula a linha de expansão baseada apenas nos itens que estão visíveis
    const expandedIndex = indicadores.findIndex((i) => i.id === expandedId);
    const expandedRow = Math.floor(expandedIndex / columns);

    indicadores.forEach((ind, index) => {
      const isExpanded = expandedId === ind.id;
      const isPinned = isNoPainel(ind.id, unidadeSelecionada);
      const isComparing = isComparando(ind.id, unidadeSelecionada);

      // 1. Adiciona o Cartão KPI
      items.push(
        <div key={`card-${ind.id}`} className="relative group/card h-full">
          <KpiCard
            indicador={ind}
            isActive={isExpanded}
            onClick={() => setExpandedId(isExpanded ? null : ind.id)}
          />

          {/* Ações Flutuantes no Hover */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
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

      // 2. Lógica para injetar o gráfico expandido na quebra de linha
      const currentRow = Math.floor(index / columns);
      const isLastInRow = (index + 1) % columns === 0;
      const isLastItem = index === indicadores.length - 1;

      if (
        expandedId !== null &&
        currentRow === expandedRow &&
        (isLastInRow || isLastItem)
      ) {
        const expandedObj = indicadores[expandedIndex];
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
      {renderItems()}
    </div>
  );
}
