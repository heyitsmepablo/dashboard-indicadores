export type UnidadeMedida = 'ABSOLUTO' | 'FINANCEIRO' | 'PERCENTUAL' | 'TEMPO_HORAS'

export interface Indicador {
  id: number
  setor: string
  descricao: string
  meta: string | null
  unidade_de_medida: UnidadeMedida
}

export interface Resultado {
  id: number
  indicador_id: number
  competencia: string // ISO date string
  valor: number
  analise_critica: string | null
}

export interface IndicadorComResultados extends Indicador {
  resultados: Resultado[]
}
