"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Indicador } from "@/lib/types";
import {
  formatValue,
  formatCompetencia,
  formatCompetenciaLonga,
  parseMeta,
} from "@/lib/format";
import { Badge } from "./ui/badge";

export type ChartType = "area" | "line" | "bar";

interface EvolutionChartProps {
  indicador: Indicador;
}

export function EvolutionChart({ indicador }: EvolutionChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showLabels, setShowLabels] = useState(false);

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
      padding={{ left: 20, right: 20 }} // Evita cortes de texto nas bordas do modal
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

  // Renderizador exclusivo para a BARRA: Calcula o centro dinamicamente usando a largura
  const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;
    const formatted = formatValue(value, indicador.unidade_de_medida);
    const centerX = x + width / 2; // ENCONTRA O CENTRO DA BARRA

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

  // Renderizador para LINHA e ÁREA: Usa apenas o ponto (X, Y)
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
    // CORREÇÃO AQUI: margem direita alterada para 40 para não cortar a palavra "Meta"
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
