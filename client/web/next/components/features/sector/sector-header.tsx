"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitCompareArrows, Search } from "lucide-react";
import { UnitSelector } from "@/components/shared/unit-selector";
import { Unidade } from "@/lib/types";

interface SectorHeaderProps {
  tipoAtivoNome: string;
  totalIndicadores: number;
  totalComResultados: number;
  totalComparacao: number;
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
  onCompareClick: () => void;
  unidadeSelecionada: number | null;
  setUnidadeSelecionada: (id: number) => void;
  unidadesFiltradas: Unidade[];
  isUnitSelectorOpen: boolean;
  setIsUnitSelectorOpen: (open: boolean) => void;
}

export function SectorHeader({
  tipoAtivoNome,
  totalIndicadores,
  totalComResultados,
  totalComparacao,
  termoBusca,
  setTermoBusca,
  onCompareClick,
  unidadeSelecionada,
  setUnidadeSelecionada,
  unidadesFiltradas,
  isUnitSelectorOpen,
  setIsUnitSelectorOpen,
}: SectorHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            {tipoAtivoNome}
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalComResultados} indicadores monitorados na unidade selecionada.
          </p>
        </div>

        {totalComparacao > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0 border-chart-2/50 text-chart-2 hover:bg-chart-2/10 hover:text-chart-2"
            onClick={onCompareClick}
          >
            <GitCompareArrows className="h-4 w-4" /> Comparar ({totalComparacao}
            )
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-[350px]">
          <UnitSelector
            value={unidadeSelecionada}
            onChange={setUnidadeSelecionada}
            unitsList={unidadesFiltradas}
            isOpen={isUnitSelectorOpen}
            setIsOpen={setIsUnitSelectorOpen}
          />
        </div>
        {totalIndicadores > 0 && (
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar indicador..."
              className="pl-9 h-10 w-full bg-background shadow-sm"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
