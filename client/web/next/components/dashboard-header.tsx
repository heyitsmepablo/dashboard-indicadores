"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/lib/dashboard-context";
import { Clock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const supSigla =
    superintendencias.find((s) => s.id === superintendenciaAtivaId)?.sigla ||
    "Geral";
  const tipoNome =
    tiposUnidade.find((t) => t.id === tipoUnidadeAtivoId)?.nome || "Unidades";

  const pageLabel =
    viewMode === "setor" ? `${supSigla} / ${tipoNome}` : viewLabels[viewMode];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-sm text-muted-foreground">Dashboard</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium">
                {pageLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Data de Última Atualização no Canto Direito */}
      {viewMode === "setor" && ultimaAtualizacao && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border">
          <Clock className="h-3.5 w-3.5" />
          <span>Última atualização:</span>
          <span className="font-semibold text-foreground">
            {ultimaAtualizacao}
          </span>
        </div>
      )}
    </header>
  );
}
