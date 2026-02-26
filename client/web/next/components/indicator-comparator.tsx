"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Trash2,
  GitCompareArrows,
  Loader2,
  Filter,
  Building,
  LayoutGrid,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Tag,
} from "lucide-react";

import { useDashboard } from "@/lib/dashboard-context";
import { formatCompetencia, formatValue, getVariacao } from "@/lib/format";
import { ChartTypeToggle, type ChartType } from "./evolution-chart";
import { UnitSelector } from "./unit-selector";
import { DashifyService } from "@/services/dashify.service";
import { Indicador } from "@/lib/types";
import { filtrarUnidadesPorSetor } from "@/lib/sector-utils";

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function IndicatorComparator() {
  const [chartType, setChartType] = useState<ChartType>("line");
  const {
    dadosComparacao,
    itensComparacao,
    toggleItemComparador,
    limparComparador,
    unidades,
    setores,
  } = useDashboard();

  const [localSetor, setLocalSetor] = useState<string>("");
  const [localUnidadeId, setLocalUnidadeId] = useState<number | null>(null);
  const [indicadoresDisponiveis, setIndicadoresDisponiveis] = useState<
    Indicador[]
  >([]);
  const [loadingIndicadores, setLoadingIndicadores] = useState(false);

  // --- MEMÓRIA DE UNIDADES ---
  const [activeUnits, setActiveUnits] = useState<number[]>([]);

  useEffect(() => {
    const currentUnits = Array.from(
      new Set(itensComparacao.map((i) => i.unidadeId)),
    );
    if (currentUnits.length > 0) {
      setActiveUnits((prev) => Array.from(new Set([...prev, ...currentUnits])));
    }
  }, [itensComparacao]);

  // --- Helpers de Identificação ---
  const getNomeUnidade = (id: number) =>
    unidades.find((u) => u.id === id)?.nome || `Unidade ${id}`;
  const getSiglaUnidade = (id: number) =>
    unidades.find((u) => u.id === id)?.sigla || `#${id}`;

  const modo = useMemo(() => {
    if (itensComparacao.length < 2) return "INICIAL";
    const uId = itensComparacao[0].unidadeId;
    const iId = itensComparacao[0].id;
    if (itensComparacao.every((i) => i.unidadeId === uId))
      return "MESMA_UNIDADE";
    if (itensComparacao.every((i) => i.id === iId)) return "MULTI_UNIDADE";
    return "MISTO";
  }, [itensComparacao]);

  const unidadesDoSetor = useMemo(() => {
    return localSetor ? filtrarUnidadesPorSetor(localSetor, unidades) : [];
  }, [localSetor, unidades]);

  useEffect(() => {
    setLocalUnidadeId(null);
  }, [localSetor]);

  useEffect(() => {
    if (localUnidadeId) {
      setLoadingIndicadores(true);
      DashifyService.getIndicadores(localSetor, localUnidadeId)
        .then(setIndicadoresDisponiveis)
        .finally(() => setLoadingIndicadores(false));
    }
  }, [localUnidadeId, localSetor]);

  // --- Funções de Interação ---
  const handleLimparTudo = () => {
    limparComparador();
    setActiveUnits([]);
  };

  const removerIndicador = (indicadorId: number) => {
    const itensParaRemover = itensComparacao.filter(
      (i) => i.id === indicadorId,
    );
    itensParaRemover.forEach((item) =>
      toggleItemComparador(item.id, item.unidadeId),
    );
  };

  const removerUnidade = (unidadeId: number) => {
    setActiveUnits((prev) => {
      const newActiveUnits = prev.filter((id) => id !== unidadeId);
      if (localUnidadeId === unidadeId) {
        if (newActiveUnits.length > 0) {
          setLocalUnidadeId(newActiveUnits[newActiveUnits.length - 1]);
        } else {
          setLocalUnidadeId(null);
        }
      }
      return newActiveUnits;
    });

    const itensParaRemover = itensComparacao.filter(
      (i) => i.unidadeId === unidadeId,
    );
    itensParaRemover.forEach((item) =>
      toggleItemComparador(item.id, item.unidadeId),
    );
  };

  const handleToggleIndicador = (indId: number, currentUnitId: number) => {
    const isSelected = itensComparacao.some(
      (i) => i.id === indId && i.unidadeId === currentUnitId,
    );

    if (isSelected) {
      toggleItemComparador(indId, currentUnitId);
    } else {
      if (itensComparacao.length === 0 && activeUnits.length > 0) {
        const unitsToApply = Array.from(
          new Set([...activeUnits, currentUnitId]),
        );
        setActiveUnits(unitsToApply);
        unitsToApply.forEach((uId) => toggleItemComparador(indId, uId));
      } else {
        toggleItemComparador(indId, currentUnitId);
      }
    }
  };

  // --- Preparação de Dados para a UI ---
  const indicadoresUnicos = useMemo(() => {
    const map = new Map<number, { id: number; descricao: string }>();
    dadosComparacao.forEach((ind) =>
      map.set(ind.id, { id: ind.id, descricao: ind.descricao }),
    );
    return Array.from(map.values());
  }, [dadosComparacao]);

  const unidadesUnicasIds = useMemo(() => {
    return Array.from(new Set(itensComparacao.map((i) => i.unidadeId)));
  }, [itensComparacao]);

  const data = useMemo(() => {
    if (dadosComparacao.length === 0) return [];
    const dates = new Set<string>();
    dadosComparacao.forEach((ind) =>
      ind.resultados?.forEach((r) => dates.add(r.competencia.split("T")[0])),
    );
    return Array.from(dates)
      .sort()
      .map((d) => {
        const p: any = { competencia: formatCompetencia(d) };
        dadosComparacao.forEach((ind) => {
          const r = ind.resultados?.find((res) =>
            res.competencia.startsWith(d),
          );
          p[`ind_${ind.id}_${ind.unidadeId}`] = r ? Number(r.valor) : null;
        });
        return p;
      });
  }, [dadosComparacao]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    dadosComparacao.forEach((ind, idx) => {
      config[`ind_${ind.id}_${ind.unidadeId}`] = {
        label: `${ind.descricao} (${getSiglaUnidade(ind.unidadeId!)})`,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
    return config;
  }, [dadosComparacao, unidades]);

  const uniqueUnidadesMedida = useMemo(
    () => [...new Set(dadosComparacao.map((i) => i.unidade_de_medida))],
    [dadosComparacao],
  );
  const sameUnidade = uniqueUnidadesMedida.length === 1;
  const isMultiMode = activeUnits.length > 1 || modo === "MULTI_UNIDADE";
  const isSetorDisabled = itensComparacao.length > 0;

  // --- Renderização do Gráfico ---
  const renderSelectedChart = () => {
    const margin = { top: 20, right: 30, left: 0, bottom: 0 };
    const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} />;
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
      <YAxis tickLine={false} axisLine={false} width={40} fontSize={12} />
    );
    const tooltip = <RechartsTooltip content={<ChartTooltipContent />} />;
    const legend = <Legend content={<ChartLegendContent />} />;

    if (chartType === "bar") {
      return (
        <BarChart data={data} margin={margin}>
          {grid} {xAxis} {yAxis} {tooltip} {legend}
          {dadosComparacao.map((ind, idx) => (
            <Bar
              key={`${ind.id}-${ind.unidadeId}`}
              dataKey={`ind_${ind.id}_${ind.unidadeId}`}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
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
          {dadosComparacao.map((ind, idx) => (
            <Area
              key={`${ind.id}-${ind.unidadeId}`}
              type="monotone"
              dataKey={`ind_${ind.id}_${ind.unidadeId}`}
              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
              fill={`url(#fill-${ind.id}-${ind.unidadeId})`}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </AreaChart>
      );
    }

    return (
      <LineChart data={data} margin={margin}>
        {grid} {xAxis} {yAxis} {tooltip} {legend}
        {dadosComparacao.map((ind, idx) => (
          <Line
            key={`${ind.id}-${ind.unidadeId}`}
            type="monotone"
            dataKey={`ind_${ind.id}_${ind.unidadeId}`}
            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
            strokeWidth={3}
            dot={{
              r: 4,
              fill: CHART_COLORS[idx % CHART_COLORS.length],
              strokeWidth: 0,
            }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            connectNulls
          />
        ))}
      </LineChart>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Comparador de Performance
        </h1>
        <p className="text-sm text-muted-foreground">
          Analise múltiplos indicadores ou compare unidades entre si.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* === PAINEL DE SELEÇÃO === */}
        <Card className="shadow-md border-t-4 border-t-primary">
          <CardHeader className="bg-muted/10 pb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Filter className="h-3 w-3" /> Configuração
              </span>
              {(itensComparacao.length > 0 || activeUnits.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLimparTudo}
                  className="text-destructive h-6 hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Limpar Tudo
                </Button>
              )}
            </div>

            {activeUnits.length > 0 && (
              <div className="mb-4 p-2 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  {isMultiMode
                    ? "Modo: Comparação de Unidades"
                    : "Modo: Análise de Unidade"}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {isMultiMode
                    ? "O indicador selecionado será aplicado às unidades em análise."
                    : "Você pode adicionar múltiplos indicadores para esta unidade."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <LayoutGrid className="h-3 w-3" /> 1. Setor
                  </Label>
                  {isSetorDisabled && (
                    <span className="text-[9px] text-muted-foreground opacity-70">
                      Remova os indicadores para trocar
                    </span>
                  )}
                </div>
                <Select
                  value={localSetor}
                  onValueChange={setLocalSetor}
                  disabled={isSetorDisabled}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" /> 2. Unidade
                </Label>
                <UnitSelector
                  value={localUnidadeId}
                  onChange={(newId) => {
                    setLocalUnidadeId(newId);

                    // --- NOVA LÓGICA DE LIMPEZA DE SETOR ANTERIOR ---
                    const hasForeignUnits = activeUnits.some(
                      (uId) => !unidadesDoSetor.some((u) => u.id === uId),
                    );

                    if (hasForeignUnits && itensComparacao.length === 0) {
                      // Se viemos de outro setor e o gráfico está vazio, a memória reseta para só ter a unidade nova
                      setActiveUnits([newId]);
                    } else if (
                      itensComparacao.length === 0 &&
                      !activeUnits.includes(newId)
                    ) {
                      // Se é do mesmo setor e não tá na memória, inclui na memória
                      setActiveUnits((prev) => [...prev, newId]);
                    }

                    // --- LÓGICA DE AUTO-ADD DE INDICADOR ---
                    const activeIndIds = Array.from(
                      new Set(itensComparacao.map((i) => i.id)),
                    );
                    if (activeIndIds.length === 1) {
                      const indId = activeIndIds[0];
                      const isAlreadySelected = itensComparacao.some(
                        (i) => i.id === indId && i.unidadeId === newId,
                      );
                      if (!isAlreadySelected) {
                        toggleItemComparador(indId, newId);
                      }
                    }
                  }}
                  customList={unidadesDoSetor}
                  disabled={!localSetor}
                  placeholder="Busque a unidade..."
                  selectedIds={activeUnits}
                  groupLabel={localSetor}
                />
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0 h-[400px] relative">
            {loadingIndicadores ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !localUnidadeId ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                <Info className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs">
                  Selecione o setor e a unidade para listar os indicadores.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full p-2">
                <div className="space-y-1">
                  {indicadoresDisponiveis.map((ind) => {
                    const isSelected = itensComparacao.some(
                      (i) => i.id === ind.id && i.unidadeId === localUnidadeId,
                    );

                    const canSelect =
                      itensComparacao.length === 0 ||
                      (modo === "MESMA_UNIDADE" &&
                        localUnidadeId === itensComparacao[0].unidadeId) ||
                      (modo === "MULTI_UNIDADE" &&
                        ind.id === itensComparacao[0].id) ||
                      (itensComparacao.length === 1 &&
                        (ind.id === itensComparacao[0].id ||
                          localUnidadeId === itensComparacao[0].unidadeId));

                    return (
                      <div
                        key={ind.id}
                        onClick={() =>
                          canSelect &&
                          handleToggleIndicador(ind.id, localUnidadeId!)
                        }
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 border-primary/30"
                            : canSelect
                              ? "hover:bg-muted border-transparent"
                              : "opacity-30 cursor-not-allowed grayscale"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="mt-0.5 pointer-events-none"
                          onCheckedChange={() => {}}
                        />
                        <span className="text-sm leading-tight pointer-events-none">
                          {ind.descricao}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* === ÁREA VISUAL === */}
        <div className="flex flex-col gap-4 min-w-0">
          {activeUnits.length === 0 && itensComparacao.length === 0 ? (
            <Card className="h-[550px] border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <GitCompareArrows className="h-12 w-12 mb-4 opacity-10" />
              <p className="text-sm">
                Inicie a configuração no painel lateral.
              </p>
            </Card>
          ) : (
            <>
              {/* Badges de Gestão de Seleção */}
              <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-dashed">
                {/* Linha de Unidades */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Building className="h-3 w-3" /> Unidades em Análise (
                    {activeUnits.length})
                  </Label>
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

                <Separator className="bg-border/50" />

                {/* Linha de Indicadores */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Indicadores Monitorados
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {indicadoresUnicos.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                        Nenhum indicador selecionado. Escolha na lista ao lado.
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

              {/* Lógica Exibição do Gráfico */}
              {itensComparacao.length === 0 ? (
                <Card className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border-dashed bg-muted/5">
                  <Tag className="h-12 w-12 opacity-10 mb-2" />
                  <p className="text-sm font-medium">Gráfico Vazio</p>
                  <p className="text-xs">
                    Selecione um indicador para visualizar os dados das
                    unidades.
                  </p>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Gráfico de Evolução
                        </CardTitle>
                        <CardDescription>
                          {sameUnidade
                            ? `Unidade de Medida: ${uniqueUnidadesMedida[0]}`
                            : "Comparações entre dados normalizados"}
                        </CardDescription>
                      </div>
                      <ChartTypeToggle
                        value={chartType}
                        onChange={setChartType}
                      />
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[400px] w-full"
                      >
                        {renderSelectedChart()}
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {dadosComparacao.map((ind, idx) => {
                      const resultados = ind.resultados || [];
                      const ultimo = resultados[resultados.length - 1];
                      const penultimo = resultados[resultados.length - 2];
                      const valorAtual = ultimo ? Number(ultimo.valor) : 0;
                      const valorAnterior = penultimo
                        ? Number(penultimo.valor)
                        : 0;
                      const variacao = penultimo
                        ? getVariacao(valorAtual, valorAnterior)
                        : 0;

                      return (
                        <Card
                          key={`${ind.id}-${ind.unidadeId}`}
                          className="p-4 flex flex-col justify-between shadow-sm border-l-4"
                          style={{
                            borderLeftColor:
                              CHART_COLORS[idx % CHART_COLORS.length],
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
                                  ? formatValue(
                                      valorAtual,
                                      ind.unidade_de_medida,
                                    )
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
          )}
        </div>
      </div>
    </div>
  );
}
