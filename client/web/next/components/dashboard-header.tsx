"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/lib/auth-context";
import { Clock, KeyRound, LogOut, UserCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const viewLabels: Record<string, string> = {
  comparador: "Comparador",
  "meu-painel": "Meu Painel",
  "alterar-senha": "Configurações de Conta",
};

export function DashboardHeader() {
  const {
    viewMode,
    setViewMode,
    tiposUnidade,
    tipoUnidadeAtivoId,
    superintendencias,
    superintendenciaAtivaId,
    ultimaAtualizacao,
  } = useDashboard();

  const { user, logout } = useAuth();

  const supSigla =
    superintendencias.find((s) => s.id === superintendenciaAtivaId)?.sigla ||
    "Geral";
  const tipoNome =
    tiposUnidade.find((t) => t.id === tipoUnidadeAtivoId)?.nome || "Unidades";

  const pageLabel =
    viewMode === "setor" ? `${supSigla} / ${tipoNome}` : viewLabels[viewMode];

  const handlePasswordChangeClick = () => {
    setViewMode("alterar-senha");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-sm text-muted-foreground hidden md:inline">
                Dashboard
              </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium">
                {pageLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        {viewMode === "setor" && ultimaAtualizacao && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-md border">
            <Clock className="h-3.5 w-3.5" />
            <span>Última atualização:</span>
            <span className="font-semibold text-foreground">
              {ultimaAtualizacao}
            </span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 px-3 hover:bg-muted"
            >
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">
                {user?.nome.split(" ")[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold leading-none">
                  {user?.nome}
                </span>
                <span className="text-xs text-muted-foreground leading-none">
                  {user?.email}
                </span>
                <span className="text-[10px] text-muted-foreground/80 leading-none mt-0.5">
                  Matrícula: {user?.matricula}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer py-2"
              onClick={handlePasswordChangeClick}
            >
              <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Trocar Senha</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 !h-6" />
        <ThemeToggle />
      </div>
    </header>
  );
}
