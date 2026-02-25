"use client";

import { ArrowDownRight, ArrowUpRight, Minus, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Indicador } from "@/lib/types";
import { formatValue, parseMeta, getVariacao } from "@/lib/format";

interface KpiCardProps {
  indicador: Indicador;
  onClick?: () => void;
  isActive?: boolean;
}

export function KpiCard({ indicador, onClick, isActive }: KpiCardProps) {
  const resultados = indicador.resultados || [];
  const ultimo =
    resultados.length > 0 ? resultados[resultados.length - 1] : null;
  const penultimo =
    resultados.length > 1 ? resultados[resultados.length - 2] : null;

  const meta = parseMeta(indicador.meta, indicador.unidade_de_medida);

  // Padronização do card vazio
  if (!ultimo) {
    return (
      <Card className="h-[160px] w-full opacity-60 border-dashed flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-2 h-10 leading-tight">
            {indicador.descricao}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-muted-foreground">Sem dados</span>
        </CardContent>
      </Card>
    );
  }

  const valorAtual = Number(ultimo.valor);
  const valorAnterior = penultimo ? Number(penultimo.valor) : 0;
  const variacao = penultimo ? getVariacao(valorAtual, valorAnterior) : 0;

  const isInverseIndicator = ["Turnover", "Defeitos", "Custos", "Tempo"].some(
    (term) => indicador.descricao.includes(term),
  );

  let metaStatus: "above" | "below" | "none" = "none";
  if (meta !== null) {
    if (isInverseIndicator) {
      metaStatus = valorAtual <= meta ? "above" : "below";
    } else {
      metaStatus = valorAtual >= meta ? "above" : "below";
    }
  }

  const variacaoPositive = isInverseIndicator ? variacao < 0 : variacao > 0;

  return (
    <TooltipProvider>
      <Card
        className={`w-full cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group flex flex-col justify-between ${
          isActive
            ? "ring-2 ring-primary border-primary shadow-md bg-accent/50"
            : ""
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle
              className="text-sm font-medium text-muted-foreground leading-tight line-clamp-2 h-10 w-full"
              title={indicador.descricao}
            >
              {indicador.descricao}
            </CardTitle>
            {meta !== null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full ${
                      metaStatus === "above"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <Target className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meta: {formatValue(meta, indicador.unidade_de_medida)}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold text-card-foreground tracking-tight truncate">
              {formatValue(valorAtual, indicador.unidade_de_medida)}
            </span>
            <div className="flex items-center gap-2">
              {variacao !== 0 && (
                <Badge
                  variant="secondary"
                  className={`text-xs font-medium px-1.5 py-0 h-5 ${
                    variacaoPositive
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/20"
                      : "bg-red-500/15 text-red-700 border-red-500/20"
                  }`}
                >
                  {variacaoPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(variacao).toFixed(1)}%
                </Badge>
              )}
              {variacao === 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  <Minus className="h-3 w-3 mr-0.5" />
                  0%
                </Badge>
              )}
              <span className="text-xs text-muted-foreground truncate">
                vs. ant.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
