"use client";

import { useDashboard } from "@/lib/dashboard-context";
import { EvolutionChart } from "./evolution-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PinOff, LayoutGrid, Plus, Building, Tag } from "lucide-react";
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

  const groupedByUnit = useMemo(() => {
    const groups: Record<
      number,
      {
        unidadeNome: string;
        tipoNome: string;
        indicadores: typeof dadosMeuPainel;
      }
    > = {};

    dadosMeuPainel.forEach((ind) => {
      const uId = ind.unidadeId || 0;

      if (!groups[uId]) {
        groups[uId] = {
          unidadeNome: uId ? getNomeUnidade(uId) : "Desconhecida",
          tipoNome: uId ? getNomeTipoUnidade(uId) : "Geral",
          indicadores: [],
        };
      }

      groups[uId].indicadores.push(ind);
    });

    return Object.values(groups).sort((a, b) =>
      a.unidadeNome.localeCompare(b.unidadeNome),
    );
  }, [dadosMeuPainel, unidades, superintendencias]);

  if (dadosMeuPainel.length === 0) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Meu Painel
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu dashboard personalizado salvo automaticamente.
          </p>
        </div>
        <Card className="border-dashed bg-muted/10 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border mb-2">
              <LayoutGrid className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                Painel Vazio
              </h3>
              <p className="text-sm text-muted-foreground max-w-[450px]">
                Você ainda não fixou nenhum indicador. Navegue pela estrutura
                organizacional, escolha os indicadores mais relevantes para sua
                rotina e clique no ícone de alfinete para adicioná-los aqui.
              </p>
            </div>
            <Button className="gap-2 mt-4" onClick={() => setViewMode("setor")}>
              <Plus className="h-4 w-4" />
              Explorar e Fixar Indicadores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      {/* HEADER DO PAINEL */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Meu Painel
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{dadosMeuPainel.length}</strong>{" "}
            indicadores monitorados simultaneamente.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
          onClick={limparPainel}
        >
          <PinOff className="h-4 w-4" />
          Limpar painel
        </Button>
      </div>

      {/* RENDERIZAÇÃO DOS GRUPOS POR UNIDADE */}
      <div className="flex flex-col gap-10">
        {groupedByUnit.map((group) => (
          <section
            key={group.unidadeNome}
            className="flex flex-col gap-4 rounded-xl border bg-card/40 p-4 shadow-sm"
          >
            {/* CABEÇALHO DO AGRUPAMENTO DA UNIDADE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shadow-inner">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-foreground leading-tight">
                    {group.unidadeNome}
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Tag className="h-3 w-3" />
                    {group.tipoNome}
                  </span>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="w-fit text-[10px] uppercase font-bold"
              >
                {group.indicadores.length} indicadores fixados
              </Badge>
            </div>

            {/* GRÁFICOS DA UNIDADE */}
            <div
              className={`grid grid-cols-1 gap-4 mt-2 items-stretch ${
                group.indicadores.length > 1 ? "lg:grid-cols-2" : ""
              }`}
            >
              {group.indicadores.map((ind) => (
                <div
                  key={`${ind.id}-${ind.unidadeId}`}
                  className="relative group/my-chart bg-background rounded-xl ring-1 ring-border/50 shadow-sm transition-all duration-300 hover:ring-primary/40 hover:shadow-md flex flex-col h-full"
                >
                  <EvolutionChart indicador={ind} />

                  {/* AÇÃO DE DESAFIXAR */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/my-chart:opacity-100 transition-opacity">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm transition-colors"
                            onClick={() =>
                              toggleItemPainel(ind.id, ind.unidadeId!)
                            }
                          >
                            <PinOff className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="end">
                          <p>Remover do Meu Painel</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
