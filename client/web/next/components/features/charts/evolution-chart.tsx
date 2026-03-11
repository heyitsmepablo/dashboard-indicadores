"use client";

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
  Legend,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
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
  Sparkles,
  Bot,
  AlertCircle,
  X,
  GitCompareArrows,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/shared/month-picker";
import type { Indicador } from "@/lib/types";
import { formatValue, formatCompetenciaLonga, parseMeta } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { useEvolutionChart } from "@/hooks/use-evolution-chart";

export type ChartType = "area" | "line" | "bar";

interface EvolutionChartProps {
  indicador: Indicador;
}

export function EvolutionChart({ indicador }: EvolutionChartProps) {
  const { isAuthenticated } = useAuth();
  const meta = parseMeta(indicador.meta, indicador.unidade_de_medida);

  // Utilizando o nosso novo Hook arquitetural (Clean Code / SOLID)
  const {
    chartType,
    setChartType,
    showLabels,
    setShowLabels,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    showMinisterial,
    setShowMinisterial,
    loadingMinisterial,
    hasMinisterialLink,
    availableDates,
    chartData,
    aiState,
    handleGenerateIA,
    clearAi,
  } = useEvolutionChart(indicador);

  const resultadoComAnalise = [...chartData].reverse().find((r) => r.analise);

  const chartConfig: ChartConfig = {
    valorLocal: { label: "Dado da Unidade", color: "var(--chart-1)" },
    ...(showMinisterial
      ? {
          valorMinisterio: {
            label: "Dado Oficial (DATASUS)",
            color: "var(--chart-2)",
          },
        }
      : {}),
  };

  const yAxisTickFormatter = (val: number) => {
    if (indicador.unidade_de_medida === "PERCENTUAL")
      return `${val.toFixed(0)}%`;
    if (indicador.unidade_de_medida === "FINANCEIRO")
      return `${(val / 1000).toFixed(0)}k`;
    return val.toLocaleString("pt-BR");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rawComp = payload[0]?.payload?.rawCompetencia;
      const formattedTitle = rawComp ? formatCompetenciaLonga(rawComp) : label;

      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm text-sm z-50">
          <div className="font-semibold mb-1 text-foreground border-b pb-1">
            {formattedTitle}
          </div>
          <div className="flex flex-col gap-1 mt-1.5">
            {payload.map((entry: any, index: number) => {
              const val = formatValue(entry.value, indicador.unidade_de_medida);
              const isDatasus = entry.dataKey === "valorMinisterio";
              const labelName = isDatasus ? "DATASUS" : "Dado da unidade";

              return (
                <div key={`item-${index}`} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground font-medium">
                    {val} - {labelName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const sharedXAxis = (
    <XAxis
      dataKey="competencia"
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      fontSize={10}
      padding={{ left: 20, right: 20 }}
    />
  );
  const sharedYAxis = (
    <YAxis
      tickLine={false}
      axisLine={false}
      tickMargin={4}
      fontSize={11}
      tickFormatter={yAxisTickFormatter}
      width={50}
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

  const renderFloatingLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    const formatted = formatValue(value, indicador.unidade_de_medida);
    return (
      <text
        x={x}
        y={y - 12}
        fontSize={11}
        textAnchor="middle"
        fontWeight="bold"
        fill="var(--chart-1)"
      >
        {formatted}
      </text>
    );
  };

  const renderFloatingLabelDatasus = (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    const formatted = formatValue(value, indicador.unidade_de_medida);
    return (
      <text
        x={x}
        y={y - 30}
        fontSize={11}
        textAnchor="middle"
        fontWeight="bold"
        fill="var(--chart-2)"
      >
        {formatted}
      </text>
    );
  };

  const renderChart = () => {
    const margin = { top: showLabels ? 45 : 15, right: 40, left: 0, bottom: 0 };
    const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} />;

    if (chartType === "bar") {
      return (
        <BarChart data={chartData} margin={margin}>
          {grid} {sharedXAxis} {sharedYAxis}
          <RechartsTooltip content={<CustomTooltip />} />
          {showMinisterial && (
            <Legend verticalAlign="top" height={36} iconType="circle" />
          )}
          {metaRef}
          <Bar
            dataKey="valorLocal"
            name="Dado da Unidade"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {showLabels && (
              <LabelList dataKey="valorLocal" content={renderFloatingLabel} />
            )}
          </Bar>
          {showMinisterial && (
            <Bar
              dataKey="valorMinisterio"
              name="Dado Oficial (DATASUS)"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {showLabels && (
                <LabelList
                  dataKey="valorMinisterio"
                  content={renderFloatingLabelDatasus}
                />
              )}
            </Bar>
          )}
        </BarChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart data={chartData} margin={margin}>
          {grid} {sharedXAxis} {sharedYAxis}
          <RechartsTooltip content={<CustomTooltip />} />
          {showMinisterial && (
            <Legend verticalAlign="top" height={36} iconType="circle" />
          )}
          {metaRef}
          {showMinisterial && (
            <Line
              type="monotone"
              dataKey="valorMinisterio"
              name="Dado Oficial (DATASUS)"
              stroke="var(--chart-2)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--chart-2)" }}
            >
              {showLabels && (
                <LabelList
                  dataKey="valorMinisterio"
                  content={renderFloatingLabelDatasus}
                />
              )}
            </Line>
          )}
          <Line
            type="monotone"
            dataKey="valorLocal"
            name="Dado da Unidade"
            stroke="var(--chart-1)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--chart-1)" }}
          >
            {showLabels && (
              <LabelList dataKey="valorLocal" content={renderFloatingLabel} />
            )}
          </Line>
        </LineChart>
      );
    }

    return (
      <AreaChart data={chartData} margin={margin}>
        <defs>
          <linearGradient
            id={`fill-local-${indicador.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient
            id={`fill-sus-${indicador.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {grid} {sharedXAxis} {sharedYAxis}
        <RechartsTooltip content={<CustomTooltip />} />
        {showMinisterial && (
          <Legend verticalAlign="top" height={36} iconType="circle" />
        )}
        {metaRef}
        {showMinisterial && (
          <Area
            type="monotone"
            dataKey="valorMinisterio"
            name="Dado Oficial (DATASUS)"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill={`url(#fill-sus-${indicador.id})`}
          >
            {showLabels && (
              <LabelList
                dataKey="valorMinisterio"
                content={renderFloatingLabelDatasus}
              />
            )}
          </Area>
        )}
        <Area
          type="monotone"
          dataKey="valorLocal"
          name="Dado da Unidade"
          stroke="var(--chart-1)"
          strokeWidth={3}
          fill={`url(#fill-local-${indicador.id})`}
        >
          {showLabels && (
            <LabelList dataKey="valorLocal" content={renderFloatingLabel} />
          )}
        </Area>
      </AreaChart>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-col xl:items-start justify-between gap-4 pb-2 shrink-0">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            {indicador.descricao}
            {hasMinisterialLink && (
              <Badge
                variant="outline"
                className="text-[9px] bg-blue-50 text-blue-700 border-blue-200"
              >
                <GitCompareArrows className="h-3 w-3 mr-1" /> DATASUS
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Evolução mensal{" "}
            {meta !== null &&
              `| Meta: ${formatValue(meta, indicador.unidade_de_medida)}`}
          </CardDescription>
        </div>

        <div className="flex flex-row justify-end w-full">
          <div className="flex flex-wrap items-center gap-3 shrink-0 bg-muted/20 p-1.5 rounded-lg border w-full justify-between">
            <div className="flex items-center gap-2 px-2">
              <MonthPicker
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="Início"
                availableDates={availableDates}
              />
              <span className="text-xs text-muted-foreground">até</span>
              <MonthPicker
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="Fim"
                availableDates={availableDates}
              />
            </div>

            <div className="flex flex-row gap-2">
              <Button
                variant={showLabels ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
                className="h-8 text-xs px-2"
              >
                {showLabels ? "Ocultar Valores" : "Mostrar Valores"}
              </Button>

              <ChartTypeToggle value={chartType} onChange={setChartType} />
            </div>
          </div>
        </div>

        {hasMinisterialLink && (
          <div className="flex items-center gap-2 mt-2 bg-blue-50/50 p-2 rounded-md border border-blue-100 w-fit">
            <Switch
              id={`sus-${indicador.id}`}
              checked={showMinisterial}
              onCheckedChange={setShowMinisterial}
              disabled={loadingMinisterial}
            />
            <Label
              htmlFor={`sus-${indicador.id}`}
              className="text-xs font-semibold text-blue-800 cursor-pointer"
            >
              {loadingMinisterial
                ? "Buscando dados..."
                : "Visualizar dados oficiais (DATASUS)"}
            </Label>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        {chartData.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center border-dashed border-2 rounded-md bg-muted/5 shrink-0">
            <span className="text-sm text-muted-foreground">
              Não existem dados para o período selecionado.
            </span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full mt-4 shrink-0"
          >
            {renderChart()}
          </ChartContainer>
        )}

        <div className="mt-auto pt-4 flex flex-col gap-4">
          {resultadoComAnalise && (
            <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <div className="mt-0.5 text-blue-600">
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

          {isAuthenticated && chartData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-purple-600" /> Dashify AI
                  Insight
                </h4>
                {!aiState.analysis && !aiState.isGenerating && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateIA}
                    className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Bot className="h-3.5 w-3.5 mr-1.5" /> Analisar Recorte
                    Atual
                  </Button>
                )}
              </div>

              {aiState.isGenerating && (
                <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-4 space-y-3 animate-pulse">
                  <Skeleton className="h-3.5 w-full bg-purple-200/50" />
                  <Skeleton className="h-3.5 w-[90%] bg-purple-200/50" />
                  <Skeleton className="h-3.5 w-[65%] bg-purple-200/50" />
                </div>
              )}

              {aiState.error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{aiState.error}</span>
                </div>
              )}

              {aiState.analysis && !aiState.isGenerating && (
                <div className="relative rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50/80 to-transparent p-4 shadow-sm animate-in fade-in">
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {aiState.displayedText}
                    {aiState.isTyping && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-purple-500 animate-pulse" />
                    )}
                  </div>
                  {!aiState.isTyping && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-muted-foreground"
                      onClick={clearAi}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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
      onValueChange={(v) => v && onChange(v as ChartType)}
      className="h-8 bg-background rounded-md p-0.5 border"
    >
      <ToggleGroupItem
        value="area"
        className="h-7 w-7 p-0 data-[state=on]:bg-muted"
      >
        <AreaChartIcon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="line"
        className="h-7 w-7 p-0 data-[state=on]:bg-muted"
      >
        <LineChartIcon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="bar"
        className="h-7 w-7 p-0 data-[state=on]:bg-muted"
      >
        <BarChart3 className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
