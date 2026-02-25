'use client'

import { useState } from 'react'
import { useDashboard } from '@/lib/dashboard-context'
import { getIndicadoresPorSetor } from '@/lib/mock-data'
import { KpiCard } from './kpi-card'
import { EvolutionChart } from './evolution-chart'
import { Button } from '@/components/ui/button'
import { GitCompareArrows, Pin, PinOff, X } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SectorDashboard() {
  const {
    setorAtivo,
    toggleIndicadorComparador,
    indicadoresSelecionados,
    setComparadorAberto,
    togglePainelIndicador,
    isPainelIndicador,
  } = useDashboard()
  const indicadores = getIndicadoresPorSetor(setorAtivo)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const expandedIndicador = expandedId
    ? indicadores.find(i => i.id === expandedId) ?? null
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            {setorAtivo}
          </h1>
          <p className="text-sm text-muted-foreground">
            {indicadores.length} indicadores monitorados
            {' \u2014 '}clique em um card para visualizar o grafico
          </p>
        </div>
        {indicadoresSelecionados.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setComparadorAberto(true)}
          >
            <GitCompareArrows className="h-4 w-4" />
            Comparar ({indicadoresSelecionados.length})
          </Button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {indicadores.map((ind) => {
          const isExpanded = expandedId === ind.id
          const isPinned = isPainelIndicador(ind.id)
          const isComparing = indicadoresSelecionados.includes(ind.id)

          return (
            <div key={ind.id} className="relative group/card">
              <KpiCard
                indicador={ind}
                isActive={isExpanded}
                onClick={() => setExpandedId(isExpanded ? null : ind.id)}
              />
              {/* Action buttons overlay */}
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePainelIndicador(ind.id)
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          isPinned
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground'
                        } backdrop-blur-sm border border-border/50`}
                      >
                        {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isPinned ? 'Remover do Meu Painel' : 'Fixar no Meu Painel'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleIndicadorComparador(ind.id)
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          isComparing
                            ? 'bg-chart-2 text-primary-foreground'
                            : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground'
                        } backdrop-blur-sm border border-border/50`}
                      >
                        <GitCompareArrows className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isComparing ? 'Remover da comparacao' : 'Adicionar a comparacao'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded chart panel */}
      {expandedIndicador && (
        <div className="relative animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpandedId(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar grafico</span>
            </Button>
          </div>
          <EvolutionChart indicador={expandedIndicador} />
        </div>
      )}
    </div>
  )
}
