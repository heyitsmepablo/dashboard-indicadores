"use client";

import { useDashboard } from "@/lib/dashboard-context";
import { EvolutionChart } from "./evolution-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PinOff, LayoutGrid, Plus, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export function MyDashboard() {
  const {
    dadosMeuPainel,
    toggleItemPainel,
    limparPainel,
    setViewMode,
    unidades,
  } = useDashboard();

  // Função auxiliar para pegar o nome real da unidade
  const getNomeUnidade = (id: number) => {
    const u = unidades.find((unidade) => unidade.id === id);
    return u ? u.nome : `Unidade ${id}`;
  };

  // Agrupa os indicadores por SETOR e depois por TIPO DE UNIDADE
  const grouped = useMemo(() => {
    const bySector: Record<string, typeof dadosMeuPainel> = {};
    dadosMeuPainel.forEach((ind) => {
      if (!bySector[ind.setor]) bySector[ind.setor] = [];
      bySector[ind.setor].push(ind);
    });
    return bySector;
  }, [dadosMeuPainel]);

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
                Navegue pelos setores, selecione uma unidade e fixe os
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
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
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
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={limparPainel}
        >
          <PinOff className="h-4 w-4" />
          Limpar painel
        </Button>
      </div>

      {/* Renderização Agrupada */}
      {Object.entries(grouped).map(([setor, inds]) => (
        <div key={setor} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b pb-2">
            <h2 className="text-xl font-bold text-foreground">{setor}</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {inds.map((ind) => {
              // Tenta pegar o nome do tipo da unidade
              const unidadeInfo = ind.resultados?.[0]?.unidades;
              const tipoUnidadeNome =
                unidadeInfo?.tipo_de_unidade?.nome || "Unidade";

              // Usa o helper para pegar o nome real com base no id
              const nomeUnidadeReal = getNomeUnidade(ind.unidadeId!);

              return (
                <div
                  key={`${ind.id}-${ind.unidadeId}`}
                  className="relative group/chart flex flex-col gap-2 p-4 border rounded-xl bg-card text-card-foreground shadow-sm"
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 w-full pr-8">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-5 font-normal shrink-0 w-max"
                        >
                          {tipoUnidadeNome}
                        </Badge>
                        <span
                          className="text-xs font-medium text-muted-foreground flex items-center gap-1 truncate w-full"
                          title={nomeUnidadeReal}
                        >
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{nomeUnidadeReal}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <EvolutionChart indicador={ind} />

                  {/* Botão Remover */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover/chart:opacity-100 transition-opacity">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shadow-sm"
                            onClick={() =>
                              toggleItemPainel(ind.id, ind.unidadeId!)
                            }
                          >
                            <PinOff className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remover do Painel</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
