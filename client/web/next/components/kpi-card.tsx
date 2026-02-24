'use client'

import { ArrowDownRight, ArrowUpRight, Minus, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Indicador } from '@/lib/types'
import { formatValue, parseMeta, getVariacao } from '@/lib/format'
import { getUltimoResultado, getPenultimoResultado } from '@/lib/mock-data'

interface KpiCardProps {
  indicador: Indicador
  onClick?: () => void
}

export function KpiCard({ indicador, onClick }: KpiCardProps) {
  const ultimo = getUltimoResultado(indicador.id)
  const penultimo = getPenultimoResultado(indicador.id)
  const meta = parseMeta(indicador.meta, indicador.unidade_de_medida)

  if (!ultimo) return null

  const valorAtual = ultimo.valor
  const valorAnterior = penultimo?.valor ?? 0
  const variacao = penultimo ? getVariacao(valorAtual, valorAnterior) : 0

  // Determine if the indicator is "good" based on meta
  // For turnover/defeitos/tempo, lower is better
  const isInverseIndicator = ['Turnover', 'Taxa de Defeitos', 'Tempo Medio de Entrega'].some(
    name => indicador.descricao.includes(name.replace(' ', ''))  || indicador.descricao === name
  )

  let metaStatus: 'above' | 'below' | 'none' = 'none'
  if (meta !== null) {
    if (isInverseIndicator) {
      metaStatus = valorAtual <= meta ? 'above' : 'below'
    } else {
      metaStatus = valorAtual >= meta ? 'above' : 'below'
    }
  }

  const variacaoPositive = isInverseIndicator ? variacao < 0 : variacao > 0

  return (
    <TooltipProvider>
      <Card
        className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
              {indicador.descricao}
            </CardTitle>
            {meta !== null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      metaStatus === 'above'
                        ? 'bg-success/15 text-success'
                        : 'bg-destructive/15 text-destructive'
                    }`}
                  >
                    <Target className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meta: {formatValue(meta, indicador.unidade_de_medida)}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold text-card-foreground tracking-tight">
              {formatValue(valorAtual, indicador.unidade_de_medida)}
            </span>
            <div className="flex items-center gap-2">
              {variacao !== 0 && (
                <Badge
                  variant="secondary"
                  className={`text-xs font-medium px-1.5 py-0 h-5 ${
                    variacaoPositive
                      ? 'bg-success/15 text-success border-success/20'
                      : 'bg-destructive/15 text-destructive border-destructive/20'
                  }`}
                >
                  {variacaoPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(variacao).toFixed(1)}%
                </Badge>
              )}
              {variacao === 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  <Minus className="h-3 w-3 mr-0.5" />
                  0%
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">vs. mes anterior</span>
            </div>
            {ultimo.analise_critica && (
              <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                {ultimo.analise_critica}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
