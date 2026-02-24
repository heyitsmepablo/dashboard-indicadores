'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { X, Trash2 } from 'lucide-react'
import { useDashboard } from '@/lib/dashboard-context'
import { getAllIndicadores, getResultadosPorIndicador } from '@/lib/mock-data'
import { formatCompetencia, formatValue } from '@/lib/format'
import { ChartTypeToggle, type ChartType } from './evolution-chart'

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export function IndicatorComparator() {
  const [chartType, setChartType] = useState<ChartType>('line')
  const { indicadoresSelecionados, toggleIndicadorComparador, limparComparador } = useDashboard()
  const allIndicadores = getAllIndicadores()
  const selectedIndicadores = allIndicadores.filter(i => indicadoresSelecionados.includes(i.id))

  // Group indicadores by setor for the selection panel
  const setoresMap = allIndicadores.reduce<Record<string, typeof allIndicadores>>((acc, ind) => {
    if (!acc[ind.setor]) acc[ind.setor] = []
    acc[ind.setor].push(ind)
    return acc
  }, {})

  // Build comparison data - normalize values to percentage of their range for visual comparison
  const buildComparisonData = () => {
    if (selectedIndicadores.length === 0) return []

    // Get all results and find competencia intersection
    const allResults = selectedIndicadores.map(ind => ({
      indicador: ind,
      resultados: getResultadosPorIndicador(ind.id),
    }))

    // Use the first indicator's competencias as baseline
    const competencias = allResults[0]?.resultados.map(r => r.competencia) ?? []

    return competencias.map(comp => {
      const point: Record<string, unknown> = {
        competencia: formatCompetencia(comp),
      }
      allResults.forEach(({ indicador, resultados }) => {
        const resultado = resultados.find(r => r.competencia === comp)
        if (resultado) {
          point[`ind_${indicador.id}`] = resultado.valor
        }
      })
      return point
    })
  }

  const data = buildComparisonData()

  const chartConfig: ChartConfig = selectedIndicadores.reduce((acc, ind, idx) => {
    acc[`ind_${ind.id}`] = {
      label: ind.descricao,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }
    return acc
  }, {} as ChartConfig)

  // Check if all selected have the same unidade_de_medida for Y-axis formatting
  const uniqueUnidades = [...new Set(selectedIndicadores.map(i => i.unidade_de_medida))]
  const sameUnidade = uniqueUnidades.length === 1

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Comparador de Indicadores
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecione indicadores de qualquer setor para comparar lado a lado
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Selection Panel */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Indicadores</CardTitle>
              {indicadoresSelecionados.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={limparComparador}>
                  <Trash2 className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              {indicadoresSelecionados.length} selecionado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-3">
              <div className="flex flex-col gap-4">
                {Object.entries(setoresMap).map(([setor, inds]) => (
                  <div key={setor} className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {setor}
                    </span>
                    {inds.map((ind) => (
                      <div key={ind.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`comp-${ind.id}`}
                          checked={indicadoresSelecionados.includes(ind.id)}
                          onCheckedChange={() => toggleIndicadorComparador(ind.id)}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`comp-${ind.id}`}
                          className="text-sm cursor-pointer flex-1 leading-tight"
                        >
                          {ind.descricao}
                        </Label>
                      </div>
                    ))}
                    <Separator className="mt-1" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chart Area */}
        <div className="flex flex-col gap-4">
          {/* Selected badges */}
          {selectedIndicadores.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIndicadores.map((ind, idx) => (
                <Badge
                  key={ind.id}
                  variant="secondary"
                  className="gap-1.5 pr-1 text-xs"
                  style={{
                    borderLeft: `3px solid ${CHART_COLORS[idx % CHART_COLORS.length]}`,
                  }}
                >
                  {ind.descricao}
                  <button
                    onClick={() => toggleIndicadorComparador(ind.id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    aria-label={`Remover ${ind.descricao}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Comparison Chart */}
          {selectedIndicadores.length >= 2 ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">Comparacao de Evolucao</CardTitle>
                    <CardDescription>
                      {sameUnidade
                        ? `Valores em ${uniqueUnidades[0]}`
                        : 'Unidades mistas - comparacao visual'}
                    </CardDescription>
                  </div>
                  <ChartTypeToggle value={chartType} onChange={setChartType} />
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  {(() => {
                    const margin = { top: 10, right: 10, left: 0, bottom: 0 }
                    const sharedXAxis = (
                      <XAxis
                        dataKey="competencia"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                    )
                    const sharedYAxis = (
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                        fontSize={11}
                        width={60}
                        tickFormatter={(val) => {
                          if (sameUnidade) {
                            const u = uniqueUnidades[0]
                            if (u === 'PERCENTUAL') return `${(val * 100).toFixed(0)}%`
                            if (u === 'FINANCEIRO') return `${(val / 1000).toFixed(0)}k`
                            return val.toLocaleString('pt-BR')
                          }
                          return val.toLocaleString('pt-BR')
                        }}
                      />
                    )
                    const tooltipContent = (
                      <RechartsTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => {
                              const indId = parseInt(String(name).replace('ind_', ''))
                              const ind = selectedIndicadores.find(i => i.id === indId)
                              if (ind && typeof value === 'number') {
                                return formatValue(value, ind.unidade_de_medida)
                              }
                              return String(value)
                            }}
                          />
                        }
                      />
                    )
                    const legend = <Legend content={<ChartLegendContent />} />

                    if (chartType === 'bar') {
                      return (
                        <BarChart data={data} margin={margin}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          {sharedXAxis}
                          {sharedYAxis}
                          {tooltipContent}
                          {legend}
                          {selectedIndicadores.map((ind, idx) => (
                            <Bar
                              key={ind.id}
                              dataKey={`ind_${ind.id}`}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              radius={[3, 3, 0, 0]}
                              maxBarSize={24}
                            />
                          ))}
                        </BarChart>
                      )
                    }

                    if (chartType === 'area') {
                      return (
                        <AreaChart data={data} margin={margin}>
                          <defs>
                            {selectedIndicadores.map((ind, idx) => (
                              <linearGradient key={ind.id} id={`comp-fill-${ind.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.02} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          {sharedXAxis}
                          {sharedYAxis}
                          {tooltipContent}
                          {legend}
                          {selectedIndicadores.map((ind, idx) => (
                            <Area
                              key={ind.id}
                              type="monotone"
                              dataKey={`ind_${ind.id}`}
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                              strokeWidth={2}
                              fill={`url(#comp-fill-${ind.id})`}
                              dot={false}
                              activeDot={{ r: 4, strokeWidth: 2 }}
                            />
                          ))}
                        </AreaChart>
                      )
                    }

                    return (
                      <LineChart data={data} margin={margin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        {sharedXAxis}
                        {sharedYAxis}
                        {tooltipContent}
                        {legend}
                        {selectedIndicadores.map((ind, idx) => (
                          <Line
                            key={ind.id}
                            type="monotone"
                            dataKey={`ind_${ind.id}`}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2 }}
                          />
                        ))}
                      </LineChart>
                    )
                  })()}
                </ChartContainer>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-[400px]">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Selecione pelo menos 2 indicadores
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use o painel ao lado para escolher indicadores de qualquer setor
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Individual detail cards when comparing */}
          {selectedIndicadores.length >= 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {selectedIndicadores.map((ind) => {
                const resultados = getResultadosPorIndicador(ind.id)
                const ultimo = resultados[resultados.length - 1]
                const penultimo = resultados[resultados.length - 2]
                const variacao = penultimo
                  ? ((ultimo.valor - penultimo.valor) / Math.abs(penultimo.valor)) * 100
                  : 0

                return (
                  <Card key={ind.id} className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{ind.setor}</span>
                      <span className="text-sm font-medium">{ind.descricao}</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-bold">
                          {formatValue(ultimo.valor, ind.unidade_de_medida)}
                        </span>
                        <span className={`text-xs font-medium ${variacao >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {variacao >= 0 ? '+' : ''}{variacao.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
