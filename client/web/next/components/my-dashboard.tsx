'use client'

import { useDashboard } from '@/lib/dashboard-context'
import { getIndicadorById } from '@/lib/mock-data'
import { EvolutionChart } from './evolution-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PinOff, LayoutGrid, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function MyDashboard() {
  const { painelIndicadores, togglePainelIndicador, limparPainel, setViewMode } = useDashboard()

  const indicadores = painelIndicadores
    .map(id => getIndicadorById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getIndicadorById>>[]

  if (indicadores.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Meu Painel
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu dashboard personalizado com os indicadores que voce acompanha
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <LayoutGrid className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum indicador fixado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Navegue pelos setores e clique no icone de pin nos cards dos indicadores
                para adiciona-los ao seu painel personalizado.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 mt-2"
              onClick={() => setViewMode('setor')}
            >
              <Plus className="h-4 w-4" />
              Explorar indicadores
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group by sector
  const grouped = indicadores.reduce<Record<string, typeof indicadores>>((acc, ind) => {
    if (!acc[ind.setor]) acc[ind.setor] = []
    acc[ind.setor].push(ind)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Meu Painel
          </h1>
          <p className="text-sm text-muted-foreground">
            {indicadores.length} indicador{indicadores.length !== 1 ? 'es' : ''} fixado{indicadores.length !== 1 ? 's' : ''} de {Object.keys(grouped).length} setor{Object.keys(grouped).length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={limparPainel}
        >
          <PinOff className="h-4 w-4" />
          Limpar painel
        </Button>
      </div>

      {/* Charts grouped by sector */}
      {Object.entries(grouped).map(([setor, inds]) => (
        <div key={setor} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{setor}</h2>
            <Badge variant="secondary" className="text-xs">
              {inds.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {inds.map((ind) => (
              <div key={ind.id} className="relative group/chart">
                <EvolutionChart indicador={ind} />
                <div className="absolute top-3 right-12 z-10 opacity-0 group-hover/chart:opacity-100 transition-opacity">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => togglePainelIndicador(ind.id)}
                        >
                          <PinOff className="h-3.5 w-3.5" />
                          <span className="sr-only">Remover do painel</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remover do Meu Painel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
