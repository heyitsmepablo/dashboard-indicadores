'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { getSetores } from './mock-data'

export type ViewMode = 'setor' | 'comparador' | 'meu-painel'

interface DashboardContextType {
  setorAtivo: string
  setSetorAtivo: (setor: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  // Comparador
  indicadoresSelecionados: number[]
  toggleIndicadorComparador: (id: number) => void
  limparComparador: () => void
  // Meu Painel
  painelIndicadores: number[]
  togglePainelIndicador: (id: number) => void
  isPainelIndicador: (id: number) => boolean
  limparPainel: () => void
  // Legacy compat
  comparadorAberto: boolean
  setComparadorAberto: (aberto: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const setores = getSetores()
  const [setorAtivo, setSetorAtivo] = useState(setores[0] || 'Financeiro')
  const [viewMode, setViewMode] = useState<ViewMode>('setor')
  const [indicadoresSelecionados, setIndicadoresSelecionados] = useState<number[]>([])
  const [painelIndicadores, setPainelIndicadores] = useState<number[]>([])

  const toggleIndicadorComparador = useCallback((id: number) => {
    setIndicadoresSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const limparComparador = useCallback(() => {
    setIndicadoresSelecionados([])
  }, [])

  const togglePainelIndicador = useCallback((id: number) => {
    setPainelIndicadores(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const isPainelIndicador = useCallback((id: number) => {
    return painelIndicadores.includes(id)
  }, [painelIndicadores])

  const limparPainel = useCallback(() => {
    setPainelIndicadores([])
  }, [])

  // Legacy compat for comparadorAberto
  const comparadorAberto = viewMode === 'comparador'
  const setComparadorAberto = useCallback((aberto: boolean) => {
    setViewMode(aberto ? 'comparador' : 'setor')
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        setorAtivo,
        setSetorAtivo,
        viewMode,
        setViewMode,
        indicadoresSelecionados,
        toggleIndicadorComparador,
        limparComparador,
        painelIndicadores,
        togglePainelIndicador,
        isPainelIndicador,
        limparPainel,
        comparadorAberto,
        setComparadorAberto,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
