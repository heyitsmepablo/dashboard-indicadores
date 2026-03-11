"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Target,
  Info,
  FileText,
  GitCompareArrows,
} from "lucide-react";
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
import { getMetaStatus, isVariacaoPositive } from "@/lib/indicator-utils";

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

  const podeCompararDatasus =
    !!indicador.referencia_ministerial_sistema &&
    !!indicador.referencia_ministerial_chave;
  const exibeSeloDatasus = indicador.isMinisterial || podeCompararDatasus;

  if (!ultimo) {
    return (
      <Card className="w-full h-full opacity-70 border-dashed flex flex-col justify-between bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground/70 line-clamp-2 h-16 leading-tight pr-14">
            {indicador.descricao}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center gap-1 mt-2 text-muted-foreground/95">
            <Info className="h-5 w-5 " />
            <span className="text-[14px] font-medium leading-tight">
              Sem dados lançados para esta unidade.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const meta = parseMeta(indicador.meta, indicador.unidade_de_medida);
  const valorAtual = Number(ultimo.valor);
  const valorAnterior = penultimo ? Number(penultimo.valor) : 0;
  const variacao = penultimo ? getVariacao(valorAtual, valorAnterior) : 0;
  const temAnalise = !!ultimo.analise_critica;

  const varPositive = isVariacaoPositive(variacao, indicador.descricao);
  const metaStatus = getMetaStatus(valorAtual, meta, indicador.descricao);

  return (
    <TooltipProvider>
      <Card
        className={`w-full cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group flex flex-col justify-between ${isActive ? "ring-2 ring-primary border-primary shadow-md bg-accent/50" : ""}`}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground leading-tight line-clamp-2 h-10 w-full pr-2">
              {indicador.descricao}
            </CardTitle>
            {exibeSeloDatasus && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 uppercase px-1 shrink-0 ml-1 flex items-center gap-0.5"
                  >
                    {podeCompararDatasus && (
                      <GitCompareArrows className="h-2.5 w-2.5" />
                    )}{" "}
                    DATASUS
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {podeCompararDatasus
                      ? "Dados oficiais para comparação"
                      : "Indicador do Ministério da Saúde"}
                  </p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {variacao !== 0 ? (
                  <Badge
                    variant="secondary"
                    className={`text-xs font-medium px-1.5 py-0 h-5 ${varPositive ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"}`}
                  >
                    {varPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(variacao).toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-5"
                  >
                    <Minus className="h-3 w-3 mr-0.5" /> 0%
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground truncate">
                  vs. ant.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {temAnalise && (
                  <FileText className="h-4.5 w-4.5 text-blue-600" />
                )}
                {meta !== null && (
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${metaStatus === "above" ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}`}
                  >
                    <Target className="h-4.5 w-4.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
