import type { Indicador, Resultado, IndicadorComResultados } from './types'

// Generate dates for last 12 months
function generateCompetencias(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const competencias = generateCompetencias()

const indicadores: Indicador[] = [
  // Financeiro
  { id: 1, setor: 'Financeiro', descricao: 'Receita Mensal', meta: '500000', unidade_de_medida: 'FINANCEIRO' },
  { id: 2, setor: 'Financeiro', descricao: 'Margem de Lucro', meta: '0.25', unidade_de_medida: 'PERCENTUAL' },
  { id: 3, setor: 'Financeiro', descricao: 'Custos Operacionais', meta: '200000', unidade_de_medida: 'FINANCEIRO' },
  { id: 4, setor: 'Financeiro', descricao: 'ROI Investimentos', meta: '0.15', unidade_de_medida: 'PERCENTUAL' },
  // RH
  { id: 5, setor: 'Recursos Humanos', descricao: 'Turnover', meta: '0.05', unidade_de_medida: 'PERCENTUAL' },
  { id: 6, setor: 'Recursos Humanos', descricao: 'Horas de Treinamento', meta: '40', unidade_de_medida: 'TEMPO_HORAS' },
  { id: 7, setor: 'Recursos Humanos', descricao: 'Satisfacao do Colaborador', meta: '0.85', unidade_de_medida: 'PERCENTUAL' },
  { id: 8, setor: 'Recursos Humanos', descricao: 'Headcount', meta: null, unidade_de_medida: 'ABSOLUTO' },
  // Operacoes
  { id: 9, setor: 'Operacoes', descricao: 'Tempo Medio de Entrega', meta: '24', unidade_de_medida: 'TEMPO_HORAS' },
  { id: 10, setor: 'Operacoes', descricao: 'Taxa de Defeitos', meta: '0.02', unidade_de_medida: 'PERCENTUAL' },
  { id: 11, setor: 'Operacoes', descricao: 'Producao Diaria', meta: '1500', unidade_de_medida: 'ABSOLUTO' },
  { id: 12, setor: 'Operacoes', descricao: 'Uptime Maquinas', meta: '0.95', unidade_de_medida: 'PERCENTUAL' },
  // Comercial
  { id: 13, setor: 'Comercial', descricao: 'Vendas Mensais', meta: '350', unidade_de_medida: 'ABSOLUTO' },
  { id: 14, setor: 'Comercial', descricao: 'Taxa de Conversao', meta: '0.12', unidade_de_medida: 'PERCENTUAL' },
  { id: 15, setor: 'Comercial', descricao: 'Ticket Medio', meta: '1500', unidade_de_medida: 'FINANCEIRO' },
  { id: 16, setor: 'Comercial', descricao: 'NPS', meta: '70', unidade_de_medida: 'ABSOLUTO' },
]

// Seeded random for consistent mock data
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateResultados(): Resultado[] {
  const resultados: Resultado[] = []
  let id = 1
  const rand = seededRandom(42)

  for (const ind of indicadores) {
    let baseValue: number

    switch (ind.id) {
      case 1: baseValue = 420000; break // Receita
      case 2: baseValue = 0.22; break // Margem
      case 3: baseValue = 185000; break // Custos
      case 4: baseValue = 0.12; break // ROI
      case 5: baseValue = 0.06; break // Turnover
      case 6: baseValue = 32; break // Horas Treinamento
      case 7: baseValue = 0.78; break // Satisfacao
      case 8: baseValue = 245; break // Headcount
      case 9: baseValue = 28; break // Tempo Entrega
      case 10: baseValue = 0.03; break // Taxa Defeitos
      case 11: baseValue = 1350; break // Producao
      case 12: baseValue = 0.92; break // Uptime
      case 13: baseValue = 280; break // Vendas
      case 14: baseValue = 0.10; break // Conversao
      case 15: baseValue = 1350; break // Ticket Medio
      case 16: baseValue = 62; break // NPS
      default: baseValue = 100
    }

    // Generate progressive data with slight improvement trend
    for (let i = 0; i < competencias.length; i++) {
      const trend = 1 + (i * 0.008) // slight upward trend
      const noise = 0.9 + rand() * 0.2 // random noise +-10%
      let valor = baseValue * trend * noise

      // For turnover/defeitos, inverse trend (should decrease)
      if (ind.id === 5 || ind.id === 10 || ind.id === 9) {
        const invTrend = 1 - (i * 0.006)
        valor = baseValue * invTrend * noise
      }

      // Clamp percentages
      if (ind.unidade_de_medida === 'PERCENTUAL') {
        valor = Math.min(Math.max(valor, 0.001), 0.99)
      }

      const analysisOptions = [
        'Resultado dentro do esperado para o periodo.',
        'Melhoria significativa em relacao ao mes anterior.',
        'Leve queda, investigar causas possiveis.',
        'Meta atingida com folga, manter estrategia.',
        'Resultado abaixo da meta, plano de acao necessario.',
        'Tendencia positiva mantida pelo terceiro mes consecutivo.',
        null,
      ]

      resultados.push({
        id: id++,
        indicador_id: ind.id,
        competencia: competencias[i],
        valor: Math.round(valor * 100) / 100,
        analise_critica: analysisOptions[Math.floor(rand() * analysisOptions.length)],
      })
    }
  }

  return resultados
}

const resultados = generateResultados()

export function getSetores(): string[] {
  return [...new Set(indicadores.map(i => i.setor))]
}

export function getIndicadoresPorSetor(setor: string): Indicador[] {
  return indicadores.filter(i => i.setor === setor)
}

export function getIndicadorById(id: number): Indicador | undefined {
  return indicadores.find(i => i.id === id)
}

export function getResultadosPorIndicador(indicadorId: number): Resultado[] {
  return resultados.filter(r => r.indicador_id === indicadorId)
}

export function getIndicadorComResultados(indicadorId: number): IndicadorComResultados | undefined {
  const ind = getIndicadorById(indicadorId)
  if (!ind) return undefined
  return {
    ...ind,
    resultados: getResultadosPorIndicador(indicadorId),
  }
}

export function getAllIndicadores(): Indicador[] {
  return indicadores
}

export function getUltimoResultado(indicadorId: number): Resultado | undefined {
  const res = getResultadosPorIndicador(indicadorId)
  return res[res.length - 1]
}

export function getPenultimoResultado(indicadorId: number): Resultado | undefined {
  const res = getResultadosPorIndicador(indicadorId)
  return res.length >= 2 ? res[res.length - 2] : undefined
}
