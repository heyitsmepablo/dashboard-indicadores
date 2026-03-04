"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitCompareArrows,
  Building,
  Tag,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Tag as TagIcon,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { formatValue, getVariacao, formatCompetenciaLonga } from "@/lib/format";
import { ChartTypeToggle, type ChartType } from "@/components/evolution-chart";
import { MonthPicker } from "@/components/shared/month-picker";

// Paleta estendida (15 cores)
const CHART_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#d946ef",
  "#8B4513",
  "#c026d3",
  "#475569",
  "#a855f7",
  "#db2777",
  "#9333ea",
  "#a1a1aa",
  "#78716c",
  "#f472b6",
  "#57534e",
  "#c4b5fd",
];

interface ComparatorResultsProps {
  activeUnits: number[];
  removerUnidade: (uId: number) => void;
  removerIndicador: (indId: number) => void;
  limparIndicadores: () => void;
  chartType: ChartType;
  setChartType: (val: ChartType) => void;
  data: any[]; // Os dados brutos processados pelo pai
  chartConfig: ChartConfig;
  indicadoresUnicos: any[];
}

const parseYYYYMM = (val: string) => {
  if (!val) return 0;
  const [y, m] = val.split("-");
  return parseInt(y) * 12 + parseInt(m);
};

const formatYYYYMM = (total: number) => {
  const y = Math.floor((total - 1) / 12);
  const m = ((total - 1) % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
};

export function ComparatorResults({
  activeUnits,
  removerUnidade,
  removerIndicador,
  limparIndicadores,
  chartType,
  setChartType,
  data: rawData,
  chartConfig,
  indicadoresUnicos,
}: ComparatorResultsProps) {
  const { dadosComparacao, itensComparacao, unidades } = useDashboard();
  const [showLabels, setShowLabels] = useState(false);

  // Filtros de Data
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [focusedUnitId, setFocusedUnitId] = useState<number | null>(null);
  const [focusedIndicatorId, setFocusedIndicatorId] = useState<number | null>(
    null,
  );

  const canFocusUnit = activeUnits.length >= 2;
  const canFocusIndicator = indicadoresUnicos.length >= 2;

  // Lógica para capturar as datas disponíveis baseadas no RAW DATA
  const availableDates = useMemo(() => {
    return Array.from(
      new Set(rawData.map((r) => r.rawCompetencia as string)),
    ).sort();
  }, [rawData]);

  useEffect(() => {
    if (availableDates.length > 0 && !startDate && !endDate) {
      const lastAvailable = availableDates[availableDates.length - 1];
      const endParsed = parseYYYYMM(lastAvailable);
      setStartDate(formatYYYYMM(endParsed - 11));
      setEndDate(lastAvailable);
    }
  }, [availableDates, startDate, endDate]);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    const start = parseYYYYMM(val);
    const end = parseYYYYMM(endDate);
    if (end === 0) return;
    if (start > end || end - start > 11) setEndDate(formatYYYYMM(start + 11));
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const end = parseYYYYMM(val);
    const start = parseYYYYMM(startDate);
    if (start === 0) return;
    if (end < start || end - start > 11) setStartDate(formatYYYYMM(end - 11));
  };

  // Filtra os dados efetivamente exibidos no chart baseados no MonthPicker
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return rawData;
    return rawData.filter(
      (d) => d.rawCompetencia >= startDate && d.rawCompetencia <= endDate,
    );
  }, [rawData, startDate, endDate]);

  // Efeitos de foco
  useEffect(() => {
    if (focusedUnitId !== null && !activeUnits.includes(focusedUnitId)) {
      setFocusedUnitId(null);
    }
  }, [activeUnits, focusedUnitId]);

  useEffect(() => {
    if (
      focusedIndicatorId !== null &&
      !indicadoresUnicos.find((i) => i.id === focusedIndicatorId)
    ) {
      setFocusedIndicatorId(null);
    }
  }, [indicadoresUnicos, focusedIndicatorId]);

  const getNomeUnidade = (id: number) =>
    unidades.find((u) => u.id === id)?.nome || `Unidade ${id}`;
  const getSiglaUnidade = (id: number) =>
    unidades.find((u) => u.id === id)?.sigla || `#${id}`;

  const uniqueUnidadesMedida = useMemo(
    () => [...new Set(dadosComparacao.map((i) => i.unidade_de_medida))],
    [dadosComparacao],
  );
  const sameUnidade = uniqueUnidadesMedida.length === 1;

  if (activeUnits.length === 0 && itensComparacao.length === 0) {
    return (
      <Card className="h-[550px] border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
        <GitCompareArrows className="h-12 w-12 mb-4 opacity-10" />
        <p className="text-sm">Inicie a configuração no painel lateral.</p>
      </Card>
    );
  }

  const isElementFaded = (uId: number, indId: number) => {
    const isUnitFaded = focusedUnitId !== null && focusedUnitId !== uId;
    const isIndFaded =
      focusedIndicatorId !== null && focusedIndicatorId !== indId;
    return isUnitFaded || isIndFaded;
  };

  const renderCustomLabel = (
    props: any,
    unidadeMedida: any,
    color: string,
    seriesIndex: number,
    unidadeId: number,
    indicadorId: number,
  ) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;

    const formatted = sameUnidade
      ? formatValue(value, unidadeMedida)
      : value.toLocaleString("pt-BR");

    const labelY = 15 + seriesIndex * 14;
    const isFaded = isElementFaded(unidadeId, indicadorId);
    const labelOpacity = isFaded ? 0.2 : 1;

    return (
      <g opacity={labelOpacity} className="transition-opacity duration-300">
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={labelY + 4}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.5}
        />
        <circle cx={x} cy={labelY + 4} r={2} fill={color} />
        <text
          x={x}
          y={labelY}
          fontSize={10}
          textAnchor="middle"
          fontWeight="bold"
        >
          <tspan
            stroke="hsl(var(--background))"
            strokeWidth={3}
            strokeLinejoin="round"
          >
            {formatted}
          </tspan>
          <tspan x={x} fill={color}>
            {formatted}
          </tspan>
        </text>
      </g>
    );
  };

  // TOOLTIP CUSTOMIZADO IGUAL AO EVOLUTION CHART
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rawComp = payload[0]?.payload?.rawCompetencia;
      const formattedTitle = rawComp ? formatCompetenciaLonga(rawComp) : label;

      return (
        <div className="z-50 rounded-lg border bg-background p-2 shadow-sm text-sm">
          <div className="font-semibold mb-1 text-foreground border-b pb-1">
            {formattedTitle}
          </div>
          <div className="flex flex-col gap-1.5 mt-1.5">
            {payload.map((entry: any, index: number) => {
              const parts = String(entry.dataKey).split("_");
              const indId = Number(parts[1]);
              const uId = Number(parts[2]);

              const sigla = getSiglaUnidade(uId);
              const ind = dadosComparacao.find(
                (d) => d.id === indId && d.unidadeId === uId,
              );

              const val = sameUnidade
                ? formatValue(entry.value, uniqueUnidadesMedida[0])
                : entry.value.toLocaleString("pt-BR");

              const isFaded = isElementFaded(uId, indId);
              const labelName =
                indicadoresUnicos.length > 1 && ind
                  ? `${sigla} - ${ind.descricao}`
                  : sigla;

              return (
                <div
                  key={`item-${index}`}
                  className={`flex items-center gap-2 transition-opacity ${isFaded ? "opacity-30" : "opacity-100"}`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground font-medium flex-1">
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

  const renderChart = () => {
    const dynamicTopMargin = showLabels ? 25 + dadosComparacao.length * 14 : 25;
    const margin = { top: dynamicTopMargin, right: 35, left: 0, bottom: 0 };
    const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} />;

    const yAxisTickFormatter = (val: number) => {
      if (sameUnidade) {
        const unidade = uniqueUnidadesMedida[0];
        if (unidade === "PERCENTUAL") return `${val.toFixed(0)}%`;
        if (unidade === "FINANCEIRO") return `${(val / 1000).toFixed(0)}k`;
      }
      if (val >= 1000000)
        return `${(val / 1000000).toFixed(1)}M`.replace(".0M", "M");
      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
      return val.toLocaleString("pt-BR");
    };

    const xAxis = (
      <XAxis
        dataKey="competencia"
        tickLine={false}
        axisLine={false}
        tickMargin={10}
        fontSize={12}
      />
    );
    const yAxis = (
      <YAxis
        tickLine={false}
        axisLine={false}
        width={50}
        tickMargin={4}
        fontSize={12}
        tickFormatter={yAxisTickFormatter}
      />
    );
    const legend = <Legend content={<ChartLegendContent />} />;

    if (chartType === "bar") {
      return (
        <BarChart data={filteredData} margin={margin}>
          {grid} {xAxis} {yAxis} <RechartsTooltip content={<CustomTooltip />} />{" "}
          {legend}
          {dadosComparacao.map((ind, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length];
            const isFaded = isElementFaded(ind.unidadeId!, ind.id);
            const elementOpacity = isFaded ? 0.2 : 1;

            return (
              <Bar
                key={`${ind.id}-${ind.unidadeId}`}
                dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                opacity={elementOpacity}
                style={{ transition: "opacity 0.3s ease" }}
              >
                {showLabels && (
                  <LabelList
                    dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                    content={(props) =>
                      renderCustomLabel(
                        props,
                        ind.unidade_de_medida,
                        color,
                        idx,
                        ind.unidadeId!,
                        ind.id,
                      )
                    }
                  />
                )}
              </Bar>
            );
          })}
        </BarChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart data={filteredData} margin={margin}>
          <defs>
            {dadosComparacao.map((ind, idx) => (
              <linearGradient
                key={`grad-${ind.id}-${ind.unidadeId}`}
                id={`fill-${ind.id}-${ind.unidadeId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS[idx % CHART_COLORS.length]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS[idx % CHART_COLORS.length]}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>
          {grid} {xAxis} {yAxis} <RechartsTooltip content={<CustomTooltip />} />{" "}
          {legend}
          {dadosComparacao.map((ind, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length];
            const isFaded = isElementFaded(ind.unidadeId!, ind.id);
            const elementOpacity = isFaded ? 0.2 : 1;

            return (
              <Area
                key={`${ind.id}-${ind.unidadeId}`}
                type="monotone"
                dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                stroke={color}
                fill={`url(#fill-${ind.id}-${ind.unidadeId})`}
                strokeWidth={2}
                opacity={elementOpacity}
                style={{ transition: "opacity 0.3s ease" }}
                dot={
                  showLabels && !isFaded
                    ? {
                        r: 4,
                        fill: "var(--background)",
                        stroke: color,
                        strokeWidth: 2,
                      }
                    : false
                }
                activeDot={{ r: 6, strokeWidth: 2 }}
                connectNulls
              >
                {showLabels && (
                  <LabelList
                    dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                    content={(props) =>
                      renderCustomLabel(
                        props,
                        ind.unidade_de_medida,
                        color,
                        idx,
                        ind.unidadeId!,
                        ind.id,
                      )
                    }
                  />
                )}
              </Area>
            );
          })}
        </AreaChart>
      );
    }

    return (
      <LineChart data={filteredData} margin={margin}>
        {grid} {xAxis} {yAxis} <RechartsTooltip content={<CustomTooltip />} />{" "}
        {legend}
        {dadosComparacao.map((ind, idx) => {
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          const isFaded = isElementFaded(ind.unidadeId!, ind.id);
          const elementOpacity = isFaded ? 0.2 : 1;

          return (
            <Line
              key={`${ind.id}-${ind.unidadeId}`}
              type="monotone"
              dataKey={`ind_${ind.id}_${ind.unidadeId}`}
              stroke={color}
              strokeWidth={3}
              opacity={elementOpacity}
              style={{ transition: "opacity 0.3s ease" }}
              dot={
                showLabels && !isFaded
                  ? {
                      r: 4,
                      fill: "var(--background)",
                      stroke: color,
                      strokeWidth: 2,
                    }
                  : {
                      r: 4,
                      fill: color,
                      strokeWidth: 0,
                      opacity: elementOpacity,
                    }
              }
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
            >
              {showLabels && (
                <LabelList
                  dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                  content={(props) =>
                    renderCustomLabel(
                      props,
                      ind.unidade_de_medida,
                      color,
                      idx,
                      ind.unidadeId!,
                      ind.id,
                    )
                  }
                />
              )}
            </Line>
          );
        })}
      </LineChart>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-dashed">
        <div className="flex flex-col gap-1.5">
          <Badge
            variant="outline"
            className="border-none p-0 text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 w-fit"
          >
            <Building className="h-3 w-3" /> Unidades em Análise (
            {activeUnits.length})
          </Badge>
          <div className="flex flex-wrap gap-2">
            {activeUnits.map((uId) => {
              const isFocused = focusedUnitId === uId;
              const isFadedOther =
                focusedUnitId !== null && focusedUnitId !== uId;

              return (
                <Badge
                  key={`badge-u-${uId}`}
                  variant={isFocused ? "default" : "secondary"}
                  className={`pl-2 pr-1 py-1 gap-1.5 shadow-sm h-auto max-w-full text-left flex items-start sm:items-center transition-all ${
                    canFocusUnit ? "cursor-pointer" : ""
                  } ${
                    isFocused
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : canFocusUnit && isFadedOther
                        ? "opacity-50 grayscale hover:opacity-80 bg-background border"
                        : canFocusUnit
                          ? "bg-background border hover:bg-muted"
                          : "bg-background border"
                  }`}
                  onClick={() => {
                    if (canFocusUnit)
                      setFocusedUnitId((prev) => (prev === uId ? null : uId));
                  }}
                >
                  <span className="text-xs font-semibold shrink-0 mt-0.5 sm:mt-0 pointer-events-none">
                    {getSiglaUnidade(uId)}
                  </span>
                  <span className="text-[10px] opacity-80 font-normal hidden sm:inline-block whitespace-normal break-words pointer-events-none">
                    - {getNomeUnidade(uId)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removerUnidade(uId);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center gap-4 w-full">
            <Badge
              variant="outline"
              className="border-none p-0 text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 w-fit"
            >
              <Tag className="h-3 w-3" /> Indicadores Monitorados (
              {indicadoresUnicos.length})
            </Badge>
            {indicadoresUnicos.length > 0 && (
              <button
                type="button"
                onClick={limparIndicadores}
                className="text-[10px] text-blue-400 uppercase font-bold hover:text-destructive hover:underline cursor-pointer transition-colors"
              >
                LIMPAR INDICADORES
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {indicadoresUnicos.length === 0 ? (
              <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                Nenhum indicador selecionado.
              </span>
            ) : (
              indicadoresUnicos.map((ind) => {
                const isFocusedInd = focusedIndicatorId === ind.id;
                const isFadedOtherInd =
                  focusedIndicatorId !== null && focusedIndicatorId !== ind.id;

                return (
                  <Badge
                    key={`badge-i-${ind.id}`}
                    variant={isFocusedInd ? "default" : "outline"}
                    className={`pl-2 pr-1 py-1 gap-1.5 shadow-sm h-auto max-w-full text-left flex items-start sm:items-center transition-all ${
                      canFocusIndicator ? "cursor-pointer" : ""
                    } ${
                      isFocusedInd
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                        : canFocusIndicator && isFadedOtherInd
                          ? "opacity-50 grayscale hover:opacity-80 bg-background"
                          : canFocusIndicator
                            ? "bg-background hover:bg-muted"
                            : "bg-background"
                    }`}
                    onClick={() => {
                      if (canFocusIndicator)
                        setFocusedIndicatorId((prev) =>
                          prev === ind.id ? null : ind.id,
                        );
                    }}
                  >
                    <span className="text-xs font-medium whitespace-normal break-words pointer-events-none">
                      {ind.descricao}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removerIndicador(ind.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      </div>

      {itensComparacao.length === 0 ? (
        <Card className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border-dashed bg-muted/5">
          <Tag className="h-12 w-12 opacity-10 mb-2" />
          <p className="text-sm font-medium">Gráfico Vazio</p>
          <p className="text-xs">
            Selecione um indicador para visualizar os dados das unidades.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col xl:items-start justify-between gap-4 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Gráfico de Evolução</CardTitle>
                <CardDescription>
                  {sameUnidade
                    ? `Unidade de Medida: ${uniqueUnidadesMedida[0]}`
                    : "Comparações entre dados normalizados"}
                </CardDescription>
              </div>

              {/* Controles de Data + Toggle Igual ao Evolution Chart */}
              <div className=" flex flex-row justify-end w-full">
                <div className="flex flex-wrap items-center gap-3 shrink-0 bg-muted/20 p-1.5 rounded-lg border w-full justify-between">
                  <div className="flex items-center gap-2 px-2 ">
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

                    <ChartTypeToggle
                      value={chartType}
                      onChange={setChartType}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="h-[400px] w-full mt-4"
              >
                {renderChart()}
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {dadosComparacao.map((ind, idx) => {
              const resultados = ind.resultados || [];
              const ultimo = resultados[resultados.length - 1];
              const penultimo = resultados[resultados.length - 2];
              const valorAtual = ultimo ? Number(ultimo.valor) : 0;
              const valorAnterior = penultimo ? Number(penultimo.valor) : 0;
              const variacao = penultimo
                ? getVariacao(valorAtual, valorAnterior)
                : 0;
              const isCardFaded = isElementFaded(ind.unidadeId!, ind.id);

              return (
                <Card
                  key={`${ind.id}-${ind.unidadeId}`}
                  className={`p-4 flex flex-col justify-between shadow-sm border-l-4 transition-all duration-300 ${
                    isCardFaded ? "opacity-30 grayscale" : "opacity-100"
                  }`}
                  style={{
                    borderLeftColor: CHART_COLORS[idx % CHART_COLORS.length],
                  }}
                >
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] h-auto min-h-[1.25rem] font-normal max-w-full whitespace-normal break-words text-left"
                    >
                      {getNomeUnidade(ind.unidadeId!)}
                    </Badge>
                    <h4 className="text-sm font-semibold leading-tight line-clamp-2 h-10 mt-1">
                      {ind.descricao}
                    </h4>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold tracking-tight">
                        {ultimo
                          ? formatValue(valorAtual, ind.unidade_de_medida)
                          : "-"}
                      </span>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">
                        Último Realizado
                      </p>
                    </div>
                    {penultimo && (
                      <div
                        className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${variacao >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}
                      >
                        {variacao > 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : variacao < 0 ? (
                          <ArrowDownRight className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {Math.abs(variacao).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
