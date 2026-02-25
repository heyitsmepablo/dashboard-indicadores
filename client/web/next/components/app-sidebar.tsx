'use client'

import {
  BarChart3,
  Building2,
  DollarSign,
  GitCompareArrows,
  LayoutDashboard,
  Pin,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useDashboard } from '@/lib/dashboard-context'
import { getSetores, getIndicadoresPorSetor } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

const iconMap: Record<string, React.ElementType> = {
  'Financeiro': DollarSign,
  'Recursos Humanos': Users,
  'Operacoes': Settings,
  'Comercial': ShoppingCart,
}

export function AppSidebar() {
  const { setorAtivo, setSetorAtivo, viewMode, setViewMode, painelIndicadores } = useDashboard()
  const setores = getSetores()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">KPI Dashboard</span>
            <span className="text-xs text-sidebar-foreground/60">Painel de Indicadores</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Setores</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {setores.map((setor) => {
                const Icon = iconMap[setor] || Building2
                const count = getIndicadoresPorSetor(setor).length
                return (
                  <SidebarMenuItem key={setor}>
                    <SidebarMenuButton
                      isActive={setorAtivo === setor && viewMode === 'setor'}
                      onClick={() => {
                        setSetorAtivo(setor)
                        setViewMode('setor')
                      }}
                      tooltip={setor}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{setor}</span>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-sidebar-accent text-sidebar-accent-foreground"
                      >
                        {count}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === 'meu-painel'}
                  onClick={() => setViewMode('meu-painel')}
                  tooltip="Meu Painel"
                >
                  <Pin className="h-4 w-4" />
                  <span>Meu Painel</span>
                  {painelIndicadores.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      {painelIndicadores.length}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === 'comparador'}
                  onClick={() => setViewMode('comparador')}
                  tooltip="Comparador"
                >
                  <GitCompareArrows className="h-4 w-4" />
                  <span>Comparador</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dados atualizados em tempo real</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
