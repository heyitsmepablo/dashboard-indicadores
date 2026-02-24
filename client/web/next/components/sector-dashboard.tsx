'use client'

import { useState } from 'react'
import { useDashboard } from '@/lib/dashboard-context'
import { getIndicadoresPorSetor } from '@/lib/mock-data'
import { KpiCard } from './kpi-card'
import { EvolutionChart } from './evolution-chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GitCompareArrows } from 'lucide-react'

export function SectorDashboard() {
  const { setorAtivo, toggleIndicadorComparador, indicadoresSelecionados, setComparadorAberto } = useDashboard()
  const indicadores = getIndicadoresPorSetor(setorAtivo)
  const [chartIndicadorId, setChartIndicadorId] = useState<number | null>(null)

  const activeChartIndicador = chartIndicadorId
    ? indicadores.find(i => i.id === chartIndicadorId) ?? indicadores[0]
    : indicadores[0]

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicadores.map((ind) => (
          <div key={ind.id} className="relative">
            <KpiCard
              indicador={ind}
              onClick={() => setChartIndicadorId(ind.id)}
            />
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id={`compare-${ind.id}`}
                  checked={indicadoresSelecionados.includes(ind.id)}
                  onCheckedChange={() => toggleIndicadorComparador(ind.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 border-muted-foreground/40"
                />
                <Label
                  htmlFor={`compare-${ind.id}`}
                  className="text-[10px] text-muted-foreground cursor-pointer sr-only"
                >
                  Comparar
                </Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Evolution Charts */}
      {activeChartIndicador && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EvolutionChart indicador={activeChartIndicador} />
          {indicadores[1] && indicadores[1].id !== activeChartIndicador.id && (
            <EvolutionChart indicador={indicadores[1]} />
          )}
          {indicadores[1] && indicadores[1].id === activeChartIndicador.id && indicadores[2] && (
            <EvolutionChart indicador={indicadores[2]} />
          )}
        </div>
      )}
    </div>
  )
}
