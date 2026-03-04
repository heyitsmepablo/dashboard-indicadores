"use client";

import { useState } from "react";
import {
  BarChart3,
  Building2,
  GitCompareArrows,
  Pin,
  Linkedin,
  ChevronDown,
  FolderTree,
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

// Importando o package.json para ler a versão dinamicamente.
// Ajuste o caminho "../../" conforme a profundidade da pasta onde este componente está.
import packageJson from "../package.json";

export function AppSidebar() {
  const {
    superintendencias,
    superintendenciaAtivaId,
    setSuperintendenciaAtivaId,
    tipoUnidadeAtivoId,
    setTipoUnidadeAtivoId,
    viewMode,
    setViewMode,
    itensPainel,
  } = useDashboard();

  const [expandedSup, setExpandedSup] = useState<Record<number, boolean>>({});

  const toggleSup = (id: number) => {
    setExpandedSup((prev) => {
      const isCurrentlyExpanded =
        prev[id] !== undefined ? prev[id] : id === superintendenciaAtivaId;
      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  };

  // Configuração Dinâmica da Versão e Link do Changelog
  const appVersion = packageJson.version;
  // TODO: Substitua pelo link do seu repositório no GitHub
  const GITHUB_REPO_URL =
    "https://github.com/heyitsmepablo/dashboard-indicadores";
  // O semantic-release por padrão cria as tags com o prefixo 'v' (ex: v1.0.0)
  const releaseUrl = `${GITHUB_REPO_URL}/releases/tag/v${appVersion}`;

  return (
    <Sidebar>
      <SidebarHeader className="h-16 border-b border-sidebar-border flex flex-col justify-center px-4 w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Dashify
            </span>
            <span className="text-xs text-sidebar-foreground/60 leading-none">
              KPI Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {/* GRUPO 1: ESTRUTURA ORGANIZACIONAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Estrutura Organizacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superintendencias.length === 0 && (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  Carregando...
                </div>
              )}

              {superintendencias.map((sup) => {
                const isExpanded =
                  expandedSup[sup.id] !== undefined
                    ? expandedSup[sup.id]
                    : superintendenciaAtivaId === sup.id;

                return (
                  <div key={sup.id} className="flex flex-col">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => {
                          toggleSup(sup.id);
                          setSuperintendenciaAtivaId(sup.id);
                        }}
                        className="font-semibold"
                      >
                        <FolderTree className="h-4 w-4" />
                        <span className="flex-1 truncate">{sup.sigla}</span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-50 transition-transform duration-200 ease-in-out ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {sup.tipo_de_unidade && (
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-0.5" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-6 flex flex-col gap-0.5 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-sidebar-border">
                            {sup.tipo_de_unidade.map((tipo) => (
                              <SidebarMenuItem key={tipo.id}>
                                <SidebarMenuButton
                                  isActive={
                                    tipoUnidadeAtivoId === tipo.id &&
                                    viewMode === "setor"
                                  }
                                  onClick={() => {
                                    setTipoUnidadeAtivoId(tipo.id);
                                    setSuperintendenciaAtivaId(sup.id);
                                    setViewMode("setor");
                                  }}
                                  className="h-8 text-sm text-sidebar-foreground/80"
                                >
                                  <Building2 className="h-3.5 w-3.5" />
                                  <span className="flex-1 truncate">
                                    {tipo.nome}
                                  </span>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* GRUPO 2: PANORAMA MINISTERIAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Panorama Ministerial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "ministerial-sih"}
                  onClick={() => setViewMode("ministerial-sih")}
                >
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span>Hospitalar (SIH)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "ministerial-sia"}
                  onClick={() => setViewMode("ministerial-sia")}
                >
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  <span>Ambulatorial (SIA)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* GRUPO 3: FERRAMENTAS */}
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "meu-painel"}
                  onClick={() => setViewMode("meu-painel")}
                >
                  <Pin className="h-4 w-4" />
                  <span>Meu Painel</span>
                  {itensPainel.length > 0 && (
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
                >
                  <GitCompareArrows className="h-4 w-4" />
                  <span>Comparador</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-start flex-col gap-1.5">
            <div className="flex flex-row gap-1 text-xs">
              <span className="text-sidebar-foreground/60">
                Desenvolvido por:
              </span>
              <a
                href="https://www.linkedin.com/in/pabloeduardoss"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium text-primary hover:underline bg-primary/10"
              >
                Pablo Eduardo <Linkedin className="h-3 w-3" />
              </a>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <p className="text-xs text-sidebar-foreground/60">Versão:</p>
              <a
                href={releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline bg-primary/10 px-1.5 py-0.5 rounded-md"
              >
                {appVersion}
              </a>
            </div>
            <span className="text-[10px] text-sidebar-foreground/60">
              Aprovado pela Superintendência da Qualidade
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
