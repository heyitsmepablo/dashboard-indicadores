"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/lib/auth-context";
import { Clock, LogIn, UserCircle, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "./login-dialog";
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
};

export function DashboardHeader() {
  const {
    viewMode,
    tiposUnidade,
    tipoUnidadeAtivoId,
    superintendencias,
    superintendenciaAtivaId,
    ultimaAtualizacao,
  } = useDashboard();

  const { isAuthenticated, user, logout, isAuthLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const supSigla =
    superintendencias.find((s) => s.id === superintendenciaAtivaId)?.sigla ||
    "Geral";
  const tipoNome =
    tiposUnidade.find((t) => t.id === tipoUnidadeAtivoId)?.nome || "Unidades";

  const pageLabel =
    viewMode === "setor" ? `${supSigla} / ${tipoNome}` : viewLabels[viewMode];

  // Força o reload do dashboard para puxar os dados com "analise_critica"
  const handleLoginSuccess = () => {
    window.location.reload();
  };

  return (
    <>
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

        {/* Container Direito: Data, Auth e Toggle de Tema */}
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

          {/* Autenticação */}
          {!isAuthLoading &&
            (isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 px-3"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
                      {user?.nome.split(" ")[0]} {/* Primeiro nome */}
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
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="gap-2 h-9"
                onClick={() => setIsLoginOpen(true)}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            ))}

          <Separator orientation="vertical" className="mx-1 !h-6" />
          <ThemeToggle />
        </div>
      </header>

      <LoginDialog
        isOpen={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
