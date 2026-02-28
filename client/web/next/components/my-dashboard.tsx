"use client";

import { useDashboard } from "@/lib/dashboard-context";
import { EvolutionChart } from "./evolution-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PinOff, LayoutGrid, Plus, Building2, FolderTree } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";

export function MyDashboard() {
  const {
    dadosMeuPainel,
    toggleItemPainel,
    limparPainel,
    setViewMode,
    unidades,
    superintendencias,
  } = useDashboard();

  const getNomeUnidade = (id: number) => {
    const u = unidades.find((unidade) => unidade.id === id);
    return u ? u.nome : `Unidade ${id}`;
  };

  const getNomeTipoUnidade = (id: number) => {
    const u = unidades.find((unidade) => unidade.id === id);
    if (!u || !u.tipo_unidade_id) return "Geral";

    for (const sup of superintendencias) {
      const tipo = sup.tipo_de_unidade?.find(
        (t: any) => t.id === u.tipo_unidade_id,
      );
      if (tipo) return tipo.nome;
    }

    return "Geral";
  };

  const grouped = useMemo(() => {
    const byTypeAndUnit: Record<
      string,
      Record<string, typeof dadosMeuPainel>
    > = {};

    dadosMeuPainel.forEach((ind) => {
      const nomeTipo = ind.unidadeId
        ? getNomeTipoUnidade(ind.unidadeId)
        : "Geral";
      const nomeUnidade = ind.unidadeId
        ? getNomeUnidade(ind.unidadeId)
        : "Desconhecida";

      if (!byTypeAndUnit[nomeTipo]) {
        byTypeAndUnit[nomeTipo] = {};
      }
      if (!byTypeAndUnit[nomeTipo][nomeUnidade]) {
        byTypeAndUnit[nomeTipo][nomeUnidade] = [];
      }

      byTypeAndUnit[nomeTipo][nomeUnidade].push(ind);
    });

    return byTypeAndUnit;
  }, [dadosMeuPainel, unidades, superintendencias]);

  if (dadosMeuPainel.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Meu Painel
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu dashboard personalizado salvo automaticamente.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <LayoutGrid className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Painel Vazio
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Navegue pela estrutura, selecione uma unidade e fixe os
                indicadores importantes aqui.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 mt-2"
              onClick={() => setViewMode("setor")}
            >
              <Plus className="h-4 w-4" />
              Explorar indicadores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* HEADER DO PAINEL */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Meu Painel
          </h1>
          <p className="text-sm text-muted-foreground">
            {dadosMeuPainel.length} indicadores fixados.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={limparPainel}
        >
          <PinOff className="h-4 w-4" />
          Limpar painel
        </Button>
      </div>

      {/* RENDERIZAÇÃO DOS GRUPOS */}
      <div className="flex flex-col gap-10">
        {Object.entries(grouped).map(([tipoNome, unidadesGroup]) => (
          <div key={tipoNome} className="flex flex-col gap-6">
            {/* Nível 1: TIPO DE UNIDADE */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{tipoNome}</h2>
            </div>

            <div className="flex flex-col gap-8 pl-2 md:pl-4 border-l-2 border-muted ml-4">
              {Object.entries(unidadesGroup).map(([unidadeNome, inds]) => (
                <div key={unidadeNome} className="flex flex-col gap-4">
                  {/* Nível 2: UNIDADE */}
                  <div className="flex items-center gap-2 -ml-[19px] md:-ml-[27px]">
                    <div className="h-2 w-2 rounded-full bg-primary/50 ring-4 ring-background" />
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-1.5 bg-background pr-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {unidadeNome}
                    </h3>
                  </div>

                  {/* Nível 3: INDICADORES DA UNIDADE */}
                  {/* Aumentei o gap vertical (gap-y-10) para o badge flutuante não colar no card de cima */}
                  <div className="grid grid-cols-1 gap-y-10 gap-x-6 lg:grid-cols-2 pl-4 pt-2">
                    {inds.map((ind) => (
                      <div
                        key={`${ind.id}-${ind.unidadeId}`}
                        className="relative group/chart transition-all duration-300 hover:shadow-md rounded-xl"
                      >
                        {/* IDENTIFICAÇÃO FLUTUANTE DA UNIDADE NO CARD */}
                        <div className="absolute -top-3 left-4 z-10">
                          <Badge
                            variant="secondary"
                            className="bg-muted border border-border/50 text-muted-foreground shadow-sm flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold"
                          >
                            <Building2 className="h-3 w-3" />
                            <span className="truncate max-w-[220px]">
                              {unidadeNome}
                            </span>
                          </Badge>
                        </div>

                        <EvolutionChart indicador={ind} />

                        {/* Botão de Desafixar flutuante */}
                        <div className="absolute -top-3 -right-3 z-10 opacity-0 group-hover/chart:opacity-100 transition-opacity">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8 rounded-full shadow-md"
                                  onClick={() =>
                                    toggleItemPainel(ind.id, ind.unidadeId!)
                                  }
                                >
                                  <PinOff className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>Remover do Painel</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
