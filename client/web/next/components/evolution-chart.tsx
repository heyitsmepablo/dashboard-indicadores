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
} from "lucide-react";
import type { Indicador } from "@/lib/types";
import { formatValue, formatCompetencia, parseMeta } from "@/lib/format";
import { Badge } from "./ui/badge";

export type ChartType = "area" | "line" | "bar";

interface EvolutionChartProps {
  indicador: Indicador;
}

// Nova função para formatar a data por extenso e em maiúsculo (Ex: NOVEMBRO DE 2025)
function formatCompetenciaLonga(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("T")[0].split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date
      .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      .toUpperCase();
  } catch (e) {
    return dateStr.toUpperCase();
  }
}

export function EvolutionChart({ indicador }: EvolutionChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");
  const resultados = indicador.resultados || [];
  const meta = parseMeta(indicador.meta, indicador.unidade_de_medida);

  const data = resultados.map((r) => ({
    competencia: formatCompetencia(r.competencia), // Usado no eixo X do Gráfico
    rawCompetencia: r.competencia, // Usado para formatar a data por extenso na Análise
    valor: r.valor,
    analise: r.analise_critica,
  }));

  // Encontra a análise mais recente disponível no array de dados
  // Procuramos de trás para frente (reverse) pelo primeiro item que tenha a string "analise" preenchida
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
    />
  );

  // Ajuste do domínio para garantir que a meta sempre apareça,
  // mesmo que os valores realizados sejam muito mais baixos que a meta.
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
      domain={yDomain as any} // <- Domínio aplicado aqui
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

  const renderChart = () => {
    const margin = { top: 10, right: 10, left: 0, bottom: 0 };

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
          />
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
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
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
          strokeWidth={2}
          fill={`url(#fill-${indicador.id})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2 }}
        />
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
          <ChartTypeToggle value={chartType} onChange={setChartType} />
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

        {/* Exibe a última análise crítica encontrada, informando a data correspondente */}
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
