"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AreaChartIcon,
  BarChart3,
  LineChartIcon,
  FileText,
  Tag as TagIcon,
  Sparkles,
  Bot,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Indicador } from "@/lib/types";
import {
  formatValue,
  formatCompetencia,
  formatCompetenciaLonga,
  parseMeta,
} from "@/lib/format";
import { DashifyService } from "@/services/dashify.service";
import { useAuth } from "@/lib/auth-context";

export type ChartType = "area" | "line" | "bar";

interface EvolutionChartProps {
  indicador: Indicador;
}

export function EvolutionChart({ indicador }: EvolutionChartProps) {
  const { isAuthenticated } = useAuth();
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showLabels, setShowLabels] = useState(false);

  // Estados da IA
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [displayedAnalysis, setDisplayedAnalysis] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const resultados = indicador.resultados || [];
  const meta = parseMeta(indicador.meta, indicador.unidade_de_medida);

  const data = resultados.map((r) => ({
    competencia: formatCompetencia(r.competencia),
    rawCompetencia: r.competencia,
    valor: r.valor,
    analise: r.analise_critica,
  }));

  const resultadoComAnalise = [...data].reverse().find((r) => r.analise);

  const chartConfig: ChartConfig = {
    valor: {
      label: "Realizado",
      color: "var(--chart-1)",
    },
  };

  const yAxisTickFormatter = (val: number) => {
    if (indicador.unidade_de_medida === "PERCENTUAL")
      return `${val.toFixed(0)}%`;
    if (indicador.unidade_de_medida === "FINANCEIRO")
      return `${(val / 1000).toFixed(0)}k`;
    return val.toLocaleString("pt-BR");
  };

  const tooltipContent = (
    <ChartTooltipContent
      formatter={(value) => {
        if (typeof value === "number") {
          return formatValue(value, indicador.unidade_de_medida);
        }
        return String(value);
      }}
    />
  );

  const sharedXAxis = (
    <XAxis
      dataKey="competencia"
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      fontSize={10}
      interval={0}
      padding={{ left: 20, right: 20 }}
    />
  );

  const yDomain =
    meta !== null
      ? [0, (dataMax: number) => Math.max(dataMax, meta)]
      : [0, "auto"];

  const sharedYAxis = (
    <YAxis
      tickLine={false}
      axisLine={false}
      tickMargin={4}
      fontSize={11}
      tickFormatter={yAxisTickFormatter}
      width={50}
      domain={yDomain as any}
    />
  );

  const metaRef =
    meta !== null ? (
      <ReferenceLine
        y={meta}
        stroke="var(--destructive)"
        strokeDasharray="6 4"
        strokeWidth={1.5}
        label={{
          value: "Meta",
          position: "right",
          fill: "var(--destructive)",
          fontSize: 11,
        }}
      />
    ) : null;

  const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;
    const formatted = formatValue(value, indicador.unidade_de_medida);
    const centerX = x + width / 2;

    return (
      <g className="animate-in fade-in zoom-in duration-300">
        <text
          x={centerX}
          y={y - 12}
          fontSize={11}
          textAnchor="middle"
          fontWeight="bold"
          dominantBaseline="central"
        >
          <tspan
            stroke="hsl(var(--background))"
            strokeWidth={5}
            strokeLinejoin="round"
          >
            {formatted}
          </tspan>
          <tspan x={centerX} fill="var(--chart-1)">
            {formatted}
          </tspan>
        </text>
      </g>
    );
  };

  const renderFloatingLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    const formatted = formatValue(value, indicador.unidade_de_medida);

    return (
      <g className="animate-in fade-in zoom-in duration-300">
        <text
          x={x}
          y={y - 12}
          fontSize={11}
          textAnchor="middle"
          fontWeight="bold"
          dominantBaseline="central"
        >
          <tspan
            stroke="hsl(var(--background))"
            strokeWidth={5}
            strokeLinejoin="round"
          >
            {formatted}
          </tspan>
          <tspan x={x} fill="var(--chart-1)">
            {formatted}
          </tspan>
        </text>
      </g>
    );
  };

  const renderChart = () => {
    const margin = { top: showLabels ? 35 : 15, right: 40, left: 0, bottom: 0 };

    if (chartType === "bar") {
      return (
        <BarChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          {sharedXAxis}
          {sharedYAxis}
          <RechartsTooltip content={tooltipContent} />
          {metaRef}
          <Bar
            dataKey="valor"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {showLabels && (
              <LabelList dataKey="valor" content={renderBarLabel} />
            )}
          </Bar>
        </BarChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          {sharedXAxis}
          {sharedYAxis}
          <RechartsTooltip content={tooltipContent} />
          {metaRef}
          <Line
            type="monotone"
            dataKey="valor"
            stroke="var(--chart-1)"
            strokeWidth={3}
            dot={
              showLabels
                ? {
                    r: 5,
                    fill: "var(--background)",
                    stroke: "var(--chart-1)",
                    strokeWidth: 2,
                  }
                : { r: 3, fill: "var(--chart-1)", strokeWidth: 0 }
            }
            activeDot={{ r: 6, strokeWidth: 2 }}
          >
            {showLabels && (
              <LabelList dataKey="valor" content={renderFloatingLabel} />
            )}
          </Line>
        </LineChart>
      );
    }

    return (
      <AreaChart data={data} margin={margin}>
        <defs>
          <linearGradient
            id={`fill-${indicador.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        {sharedXAxis}
        {sharedYAxis}
        <RechartsTooltip content={tooltipContent} />
        {metaRef}
        <Area
          type="monotone"
          dataKey="valor"
          stroke="var(--chart-1)"
          strokeWidth={3}
          fill={`url(#fill-${indicador.id})`}
          dot={
            showLabels
              ? {
                  r: 5,
                  fill: "var(--background)",
                  stroke: "var(--chart-1)",
                  strokeWidth: 2,
                }
              : false
          }
          activeDot={{ r: 6, strokeWidth: 2 }}
        >
          {showLabels && (
            <LabelList dataKey="valor" content={renderFloatingLabel} />
          )}
        </Area>
      </AreaChart>
    );
  };

  // Efeito LLM Streaming (Por Tokens/Palavras em vez de Letras)
  useEffect(() => {
    if (!aiAnalysis) {
      setDisplayedAnalysis("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    // O regex /(\s+)/ divide a string mantendo os espaços e quebras de linha no array.
    // Assim não perdemos a formatação de parágrafos.
    const tokens = aiAnalysis.split(/(\s+)/);
    let currentTokenIndex = 0;
    let currentText = "";

    const intervalId = setInterval(() => {
      // Simula o pulo de tokens do Gemini (pega de 1 a 4 pedaços por vez)
      const tokensToTake = Math.floor(Math.random() * 4) + 1;

      for (let i = 0; i < tokensToTake; i++) {
        if (currentTokenIndex < tokens.length) {
          currentText += tokens[currentTokenIndex];
          currentTokenIndex++;
        }
      }

      setDisplayedAnalysis(currentText);

      if (currentTokenIndex >= tokens.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 25); // 25ms de intervalo entre os blocos (rápido e orgânico)

    return () => clearInterval(intervalId);
  }, [aiAnalysis]);

  const handleGenerateIA = async () => {
    const unidadeIdToUse = indicador.unidadeId || resultados[0]?.unidade_id;

    if (!unidadeIdToUse) {
      setAiError("ID da unidade não encontrado para análise.");
      return;
    }

    setIsGeneratingIA(true);
    setAiError(null);
    setAiAnalysis(null);
    setDisplayedAnalysis("");

    try {
      const result = await DashifyService.gerarAnaliseIA(
        indicador.id,
        unidadeIdToUse,
      );
      setAiAnalysis(result.analiseGerada);
    } catch (error: any) {
      setAiError(error.message || "Erro desconhecido ao comunicar com a IA.");
    } finally {
      setIsGeneratingIA(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{indicador.descricao}</CardTitle>
            <CardDescription>
              Evolução mensal{" "}
              {meta !== null && (
                <span className="text-muted-foreground">
                  {"| Meta: "}
                  <span className="font-medium text-foreground">
                    {formatValue(meta, indicador.unidade_de_medida)}
                  </span>
                </span>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={showLabels ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className={`h-8 px-2 text-xs transition-colors ${showLabels ? "text-primary font-medium" : "text-muted-foreground"}`}
              title="Mostrar Rótulos de Dados"
            >
              <TagIcon className="h-3.5 w-3.5 mr-1.5" />
              {showLabels ? "Ocultar Valores" : "Mostrar Valores"}
            </Button>
            <ChartTypeToggle value={chartType} onChange={setChartType} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center border-dashed border-2 rounded-md bg-muted/5">
            <span className="text-sm text-muted-foreground">
              Não existem dados para montar o gráfico.
            </span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            {renderChart()}
          </ChartContainer>
        )}

        {/* 1. ANÁLISE HUMANA (Existente) */}
        {resultadoComAnalise && (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 p-4">
            <div className="mt-0.5 text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold leading-none text-foreground">
                  Análise Crítica Registrada
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 py-0 font-medium"
                >
                  REF:{" "}
                  {formatCompetenciaLonga(resultadoComAnalise.rawCompetencia)}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {resultadoComAnalise.analise}
              </span>
            </div>
          </div>
        )}

        {/* 2. ÁREA DE INTELIGÊNCIA ARTIFICIAL */}
        {isAuthenticated && data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Dashify AI Insight
              </h4>

              {!aiAnalysis && !isGeneratingIA && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateIA}
                  className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300 transition-colors"
                >
                  <Bot className="h-3.5 w-3.5 mr-1.5" />
                  Gerar Análise
                </Button>
              )}
            </div>

            {/* Skeleton: Enquanto a API responde */}
            {isGeneratingIA && (
              <div className="rounded-lg border border-purple-100 bg-purple-50/40 dark:border-purple-900/30 dark:bg-purple-950/20 p-4 space-y-3 animate-pulse">
                <Skeleton className="h-3.5 w-full bg-purple-200/50 dark:bg-purple-800/40" />
                <Skeleton className="h-3.5 w-[90%] bg-purple-200/50 dark:bg-purple-800/40" />
                <Skeleton className="h-3.5 w-[65%] bg-purple-200/50 dark:bg-purple-800/40" />
                <div className="pt-2">
                  <Skeleton className="h-3.5 w-[80%] bg-purple-200/50 dark:bg-purple-800/40" />
                  <Skeleton className="h-3.5 w-[40%] mt-3 bg-purple-200/50 dark:bg-purple-800/40" />
                </div>
              </div>
            )}

            {/* Erro */}
            {aiError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{aiError}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-auto"
                  onClick={handleGenerateIA}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Resultado (Sendo digitado na tela) */}
            {aiAnalysis && !isGeneratingIA && (
              <div className="relative rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50/80 to-transparent dark:border-purple-900/50 dark:from-purple-950/30 dark:to-transparent p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-[100px]">
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {displayedAnalysis}
                  {/* Cursor piscante */}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-purple-500 animate-pulse" />
                  )}
                </div>

                {/* Botão de Fechar só aparece quando terminar de digitar */}
                {!isTyping && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-purple-200/50 dark:hover:bg-purple-800/50 text-muted-foreground animate-in fade-in zoom-in duration-300"
                    onClick={() => {
                      setAiAnalysis(null);
                      setDisplayedAnalysis("");
                    }}
                    title="Dispensar Insight"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ChartTypeToggleProps {
  value: ChartType;
  onChange: (value: ChartType) => void;
}

export function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as ChartType);
      }}
      className="h-8 bg-muted/60 rounded-md p-0.5"
    >
      <ToggleGroupItem
        value="area"
        aria-label="Gráfico de área"
        className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <AreaChartIcon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="line"
        aria-label="Gráfico de linha"
        className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <LineChartIcon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="bar"
        aria-label="Gráfico de barras"
        className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <BarChart3 className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
