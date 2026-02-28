"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Filter,
  Trash2,
  CheckCircle2,
  FolderTree,
  LayoutGrid,
  Building,
  Search,
  Info,
  Loader2,
} from "lucide-react";
import { UnitSelector } from "@/components/shared/unit-selector";
import { useDashboard } from "@/lib/dashboard-context";
import { Indicador, Unidade } from "@/lib/types";

interface ComparatorSidebarProps {
  localSupId: string;
  setLocalSupId: (val: string) => void;
  localTipoId: string;
  setLocalTipoId: (val: string) => void;
  localUnidadeId: number | null;
  setLocalUnidadeId: (val: number | null) => void;
  activeUnits: number[];
  setActiveUnits: React.Dispatch<React.SetStateAction<number[]>>;
  termoBuscaIndicador: string;
  setTermoBuscaIndicador: (val: string) => void;
  indicadoresFiltrados: Indicador[];
  loadingIndicadores: boolean;
  handleLimparTudo: () => void;
  handleToggleIndicador: (indId: number, currentUnitId: number) => void;
  isMultiMode: boolean;
  modo: string;
  tiposDaSup: any[];
  unidadesDoTipo: Unidade[];
  disabledUnitIds: number[];
  validatingUnits: boolean;
  showSelectAllUnits: boolean;
  handleSelectAllUnits: () => void;
}

export function ComparatorSidebar({
  localSupId,
  setLocalSupId,
  localTipoId,
  setLocalTipoId,
  localUnidadeId,
  setLocalUnidadeId,
  activeUnits,
  setActiveUnits,
  termoBuscaIndicador,
  setTermoBuscaIndicador,
  indicadoresFiltrados,
  loadingIndicadores,
  handleLimparTudo,
  handleToggleIndicador,
  isMultiMode,
  modo,
  tiposDaSup,
  unidadesDoTipo,
  disabledUnitIds,
  validatingUnits,
  showSelectAllUnits,
  handleSelectAllUnits,
}: ComparatorSidebarProps) {
  const { itensComparacao, superintendencias, toggleItemComparador } =
    useDashboard();
  const isConfigDisabled = itensComparacao.length > 0;

  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);

  return (
    <Card className="shadow-md border-t-4 border-t-primary w-full">
      <CardHeader className="bg-muted/10 pb-4">
        <div className="flex items-center justify-between mb-4 gap-2">
          <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 shrink-0">
            <Filter className="h-3 w-3" /> Configuração
          </span>
          {(itensComparacao.length > 0 || activeUnits.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLimparTudo}
              className="text-destructive h-6 hover:bg-destructive/10 shrink-0 px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Limpar Tudo
            </Button>
          )}
        </div>

        {activeUnits.length > 0 && (
          <div className="mb-4 p-2 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {isMultiMode
                  ? "Modo: Comparação de Unidades"
                  : "Modo: Análise de Unidade"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
              {isMultiMode
                ? "O indicador selecionado será aplicado às unidades em análise."
                : "Você pode adicionar múltiplos indicadores para esta unidade."}
            </p>
          </div>
        )}

        <div className="space-y-4 w-82">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 shrink-0">
                <FolderTree className="h-3 w-3" /> 1. Superintendência
              </Label>
              {isConfigDisabled && (
                <span className="text-[9px] text-muted-foreground opacity-70 truncate text-right">
                  Limpe para trocar
                </span>
              )}
            </div>
            <Select
              value={localSupId}
              onValueChange={setLocalSupId}
              disabled={isConfigDisabled}
            >
              <SelectTrigger className="w-full text-left h-auto min-h-[2.5rem] py-2 px-3 [&>span]:whitespace-normal [&>span]:break-words">
                <SelectValue placeholder="Selecione a superintendência" />
              </SelectTrigger>
              <SelectContent>
                {superintendencias.map((sup) => (
                  <SelectItem key={sup.id} value={String(sup.id)}>
                    {sup.sigla} - {sup.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <LayoutGrid className="h-3 w-3" /> 2. Tipo de Unidade
            </Label>
            <Select
              value={localTipoId}
              onValueChange={setLocalTipoId}
              disabled={isConfigDisabled || !localSupId}
            >
              <SelectTrigger className="h-9 w-full [&>span]:truncate text-left">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposDaSup.map((tipo) => (
                  <SelectItem key={tipo.id} value={String(tipo.id)}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Building className="h-3 w-3" /> 3. Unidade
            </Label>
            <UnitSelector
              value={localUnidadeId}
              onChange={(newId) => {
                setLocalUnidadeId(newId);
                const hasForeignUnits = activeUnits.some(
                  (uId) => !unidadesDoTipo.some((u) => u.id === uId),
                );

                if (hasForeignUnits && itensComparacao.length === 0) {
                  setActiveUnits([newId]);
                } else if (
                  itensComparacao.length === 0 &&
                  !activeUnits.includes(newId)
                ) {
                  setActiveUnits((prev) => [...prev, newId]);
                }

                const activeIndIds = Array.from(
                  new Set(itensComparacao.map((i) => i.id)),
                );
                if (activeIndIds.length === 1) {
                  const indId = activeIndIds[0];
                  if (
                    !itensComparacao.some(
                      (i) => i.id === indId && i.unidadeId === newId,
                    )
                  ) {
                    toggleItemComparador(indId, newId);
                  }
                }
              }}
              unitsList={unidadesDoTipo}
              isOpen={isUnitSelectorOpen}
              setIsOpen={setIsUnitSelectorOpen}
              disabled={!localTipoId || validatingUnits}
              placeholder={
                validatingUnits ? "Validando dados..." : "Busque a unidade..."
              }
              selectedIds={activeUnits}
              className="w-full"
              disabledIds={disabledUnitIds}
              showSelectAll={showSelectAllUnits}
              onSelectAll={handleSelectAllUnits}
            />
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0 h-[400px] flex flex-col relative">
        {loadingIndicadores ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !localUnidadeId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <Info className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs">
              Siga os 3 passos acima para listar os indicadores.
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 border-b bg-muted/20 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar indicador..."
                  className="h-9 pl-9 text-xs"
                  value={termoBuscaIndicador}
                  onChange={(e) => setTermoBuscaIndicador(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-2">
                <div className="space-y-1">
                  {indicadoresFiltrados.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Nenhum indicador encontrado com esse nome.
                    </div>
                  ) : (
                    indicadoresFiltrados.map((ind) => {
                      const hasResults =
                        ind.resultados && ind.resultados.length > 0;

                      // CORREÇÃO: Checkbox reflete se o indicador está em QUALQUER unidade selecionada
                      const isSelected = itensComparacao.some(
                        (i) => i.id === ind.id,
                      );

                      const canSelect =
                        hasResults &&
                        (itensComparacao.length === 0 ||
                          (modo === "MESMA_UNIDADE" &&
                            localUnidadeId === itensComparacao[0].unidadeId) ||
                          (modo === "MULTI_UNIDADE" &&
                            ind.id === itensComparacao[0].id) ||
                          (itensComparacao.length === 1 &&
                            (ind.id === itensComparacao[0].id ||
                              localUnidadeId ===
                                itensComparacao[0].unidadeId)));

                      return (
                        <div
                          key={ind.id}
                          onClick={() =>
                            canSelect &&
                            handleToggleIndicador(ind.id, localUnidadeId!)
                          }
                          title={
                            !hasResults
                              ? "Sem dados registrados para esta unidade"
                              : ""
                          }
                          className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                            !hasResults
                              ? "opacity-50 cursor-not-allowed bg-muted/30 border-transparent"
                              : isSelected
                                ? "bg-primary/10 border-primary/30 cursor-pointer"
                                : canSelect
                                  ? "hover:bg-muted border-transparent cursor-pointer"
                                  : "opacity-30 cursor-not-allowed grayscale border-transparent"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={!hasResults}
                            className={`mt-0.5 pointer-events-none ${!hasResults && "opacity-50"}`}
                          />
                          <div className="flex flex-col w-full">
                            <span className="text-sm leading-tight pointer-events-none break-words">
                              {ind.descricao}
                            </span>
                            {!hasResults && (
                              <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Info className="h-3 w-3" /> Sem dados
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
