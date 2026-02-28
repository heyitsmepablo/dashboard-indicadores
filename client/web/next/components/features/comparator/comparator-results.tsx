"use client";

import { useMemo, useState } from "react";
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
  ChartTooltipContent,
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
import { formatValue, getVariacao } from "@/lib/format";
import { ChartTypeToggle, type ChartType } from "@/components/evolution-chart";

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ComparatorResultsProps {
  activeUnits: number[];
  removerUnidade: (uId: number) => void;
  removerIndicador: (indId: number) => void;
  limparIndicadores: () => void;
  chartType: ChartType;
  setChartType: (val: ChartType) => void;
  data: any[];
  chartConfig: ChartConfig;
  indicadoresUnicos: any[];
}

export function ComparatorResults({
  activeUnits,
  removerUnidade,
  removerIndicador,
  limparIndicadores,
  chartType,
  setChartType,
  data,
  chartConfig,
  indicadoresUnicos,
}: ComparatorResultsProps) {
  const { dadosComparacao, itensComparacao, unidades } = useDashboard();

  // Controle de estado para mostrar os rótulos de dados
  const [showLabels, setShowLabels] = useState(false);

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

  // Custom Label com Empilhamento Dinâmico
  const renderCustomLabel = (
    props: any,
    unidadeMedida: any,
    color: string,
    seriesIndex: number,
  ) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;

    const formatted = sameUnidade
      ? formatValue(value, unidadeMedida)
      : value.toLocaleString("pt-BR");

    // Espaçamento de 14px por linha para empilhar múltiplos indicadores perfeitamente
    const labelY = 15 + seriesIndex * 14;

    return (
      <g>
        {/* Linha guia até o ponto exato no gráfico */}
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
        {/* Ponto fixo no topo da calha */}
        <circle cx={x} cy={labelY + 4} r={2} fill={color} />
        {/* Texto Renderizado */}
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

  const renderChart = () => {
    // A margem do topo cresce dinamicamente se as labels estiverem ativas e houver muitos indicadores
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

    const tooltip = (
      <RechartsTooltip
        content={
          <ChartTooltipContent
            formatter={(value) => {
              if (typeof value === "number") {
                return sameUnidade
                  ? formatValue(value, uniqueUnidadesMedida[0])
                  : value.toLocaleString("pt-BR");
              }
              return String(value);
            }}
          />
        }
      />
    );

    const legend = <Legend content={<ChartLegendContent />} />;

    if (chartType === "bar") {
      return (
        <BarChart data={data} margin={margin}>
          {grid} {xAxis} {yAxis} {tooltip} {legend}
          {dadosComparacao.map((ind, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length];
            return (
              <Bar
                key={`${ind.id}-${ind.unidadeId}`}
                dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
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
        <AreaChart data={data} margin={margin}>
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
          {grid} {xAxis} {yAxis} {tooltip} {legend}
          {dadosComparacao.map((ind, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length];
            return (
              <Area
                key={`${ind.id}-${ind.unidadeId}`}
                type="monotone"
                dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                stroke={color}
                fill={`url(#fill-${ind.id}-${ind.unidadeId})`}
                strokeWidth={2}
                dot={
                  showLabels
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
      <LineChart data={data} margin={margin}>
        {grid} {xAxis} {yAxis} {tooltip} {legend}
        {dadosComparacao.map((ind, idx) => {
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          return (
            <Line
              key={`${ind.id}-${ind.unidadeId}`}
              type="monotone"
              dataKey={`ind_${ind.id}_${ind.unidadeId}`}
              stroke={color}
              strokeWidth={3}
              dot={
                showLabels
                  ? {
                      r: 4,
                      fill: "var(--background)",
                      stroke: color,
                      strokeWidth: 2,
                    }
                  : { r: 4, fill: color, strokeWidth: 0 }
              }
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
            >
              {showLabels && (
                <LabelList
                  dataKey={`ind_${ind.id}_${ind.unidadeId}`}
                  content={(props) =>
                    renderCustomLabel(props, ind.unidade_de_medida, color, idx)
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
            {activeUnits.map((uId) => (
              <Badge
                key={`badge-u-${uId}`}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1.5 shadow-sm bg-background border h-auto max-w-full text-left flex items-start sm:items-center"
              >
                <span className="text-xs font-semibold shrink-0 mt-0.5 sm:mt-0">
                  {getSiglaUnidade(uId)}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal hidden sm:inline-block whitespace-normal break-words">
                  - {getNomeUnidade(uId)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={() => removerUnidade(uId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
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
                className="text-[10px] text-blue-400 uppercase font-bold  hover:text-destructive hover:underline cursor-pointer transition-colors"
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
              indicadoresUnicos.map((ind) => (
                <Badge
                  key={`badge-i-${ind.id}`}
                  variant="outline"
                  className="pl-2 pr-1 py-1 gap-1.5 bg-background shadow-sm h-auto max-w-full text-left flex items-start sm:items-center"
                >
                  <span className="text-xs font-medium whitespace-normal break-words">
                    {ind.descricao}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0 ml-1"
                    onClick={() => removerIndicador(ind.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
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
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Gráfico de Evolução</CardTitle>
                <CardDescription>
                  {sameUnidade
                    ? `Unidade de Medida: ${uniqueUnidadesMedida[0]}`
                    : "Comparações entre dados normalizados"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
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
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
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

              return (
                <Card
                  key={`${ind.id}-${ind.unidadeId}`}
                  className="p-4 flex flex-col justify-between shadow-sm border-l-4"
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
