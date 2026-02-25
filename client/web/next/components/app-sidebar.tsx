"use client";

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
  Linkedin,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  Financeiro: DollarSign,
  "Recursos Humanos": Users,
  Operacoes: Settings,
  Comercial: ShoppingCart,
};

export function AppSidebar() {
  const {
    setorAtivo,
    setSetorAtivo,
    viewMode,
    setViewMode,
    itensPainel,
    setores,
    sectorCounts,
  } = useDashboard();

  const linkedinUrl = "https://www.linkedin.com/in/seu-usuario-aqui";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Dashify
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              KPI Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Setores</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {setores.length === 0 && (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  Carregando setores...
                </div>
              )}

              {setores.map((setor) => {
                const Icon = iconMap[setor] || Building2;
                // Proteção contra undefined: (sectorCounts || {})[setor]
                const count = (sectorCounts && sectorCounts[setor]) || 0;

                return (
                  <SidebarMenuItem key={setor}>
                    <SidebarMenuButton
                      isActive={setorAtivo === setor && viewMode === "setor"}
                      onClick={() => {
                        setSetorAtivo(setor);
                        setViewMode("setor");
                      }}
                      tooltip={setor}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 truncate">{setor}</span>

                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center bg-sidebar-accent text-sidebar-accent-foreground group-hover:bg-background group-hover:text-foreground"
                        >
                          {count}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
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
                  isActive={viewMode === "meu-painel"}
                  onClick={() => setViewMode("meu-painel")}
                  tooltip="Meu Painel"
                >
                  <Pin className="h-4 w-4" />
                  <span>Meu Painel</span>
                  {itensPainel && itensPainel.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      {itensPainel.length}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "comparador"}
                  onClick={() => setViewMode("comparador")}
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

      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>v1.0.0</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Desenvolvido por</span>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Pablo
              <Linkedin className="h-3 w-3" />
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
