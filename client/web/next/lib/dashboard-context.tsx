'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { getSetores } from './mock-data'

interface DashboardContextType {
  setorAtivo: string
  setSetorAtivo: (setor: string) => void
  comparadorAberto: boolean
  setComparadorAberto: (aberto: boolean) => void
  indicadoresSelecionados: number[]
  toggleIndicadorComparador: (id: number) => void
  limparComparador: () => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const setores = getSetores()
  const [setorAtivo, setSetorAtivo] = useState(setores[0] || 'Financeiro')
  const [comparadorAberto, setComparadorAberto] = useState(false)
  const [indicadoresSelecionados, setIndicadoresSelecionados] = useState<number[]>([])

  const toggleIndicadorComparador = useCallback((id: number) => {
    setIndicadoresSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const limparComparador = useCallback(() => {
    setIndicadoresSelecionados([])
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        setorAtivo,
        setSetorAtivo,
        comparadorAberto,
        setComparadorAberto,
        indicadoresSelecionados,
        toggleIndicadorComparador,
        limparComparador,
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
