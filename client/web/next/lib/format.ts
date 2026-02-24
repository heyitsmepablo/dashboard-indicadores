import type { UnidadeMedida } from './types'

export function formatValue(value: number, unidade: UnidadeMedida): string {
  switch (unidade) {
    case 'FINANCEIRO':
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    case 'PERCENTUAL':
      return `${(value * 100).toFixed(1)}%`
    case 'TEMPO_HORAS': {
      const hours = Math.floor(value)
      const minutes = Math.round((value - hours) * 60)
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    case 'ABSOLUTO':
    default:
      return value.toLocaleString('pt-BR')
  }
}

export function formatCompetencia(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

export function parseMeta(meta: string | null, unidade: UnidadeMedida): number | null {
  if (!meta) return null
  const parsed = parseFloat(meta)
  if (isNaN(parsed)) return null
  return parsed
}

export function getVariacao(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}
