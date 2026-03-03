"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface MonthPickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  availableDates?: string[]; // Array com as datas disponíveis (Ex: ["2025-01", "2025-02", "2026-01"])
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Selecione",
  className,
  availableDates = [],
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() =>
    value ? parseInt(value.split("-")[0]) : new Date().getFullYear(),
  );
  const [isYearView, setIsYearView] = useState(false);

  // Extrai apenas os anos únicos da base de dados
  const availableYears = useMemo(() => {
    if (!availableDates || availableDates.length === 0) return [];
    return Array.from(
      new Set(availableDates.map((d) => parseInt(d.split("-")[0]))),
    ).sort();
  }, [availableDates]);

  useEffect(() => {
    if (isOpen) {
      setViewYear(
        value
          ? parseInt(value.split("-")[0])
          : availableYears.length > 0
            ? availableYears[availableYears.length - 1]
            : new Date().getFullYear(),
      );
      setIsYearView(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isOpen]);

  const handleMonthSelect = (monthIndex: number) => {
    const val = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    onChange(val);
    setIsOpen(false);
  };

  const handleYearSelect = (selectedYear: number) => {
    setViewYear(selectedYear);
    setIsYearView(false);
  };

  // Se não houver datas passadas como prop, faz o fallback para a década atual
  const decadeStart = Math.floor(viewYear / 10) * 10;
  const yearsToShow =
    availableYears.length > 0
      ? availableYears
      : Array.from({ length: 12 }, (_, i) => decadeStart + i);

  const displayValue = value
    ? `${MONTHS[parseInt(value.split("-")[1]) - 1]}/${value.split("-")[0]}`
    : placeholder;

  // Lógica para esconder as setas de navegação se estivermos nos limites dos anos disponíveis
  const minYear =
    availableYears.length > 0 ? Math.min(...availableYears) : -Infinity;
  const maxYear =
    availableYears.length > 0 ? Math.max(...availableYears) : Infinity;
  const canGoPrev = !isYearView && viewYear > minYear;
  const canGoNext = !isYearView && viewYear < maxYear;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-[105px] justify-start text-left font-medium text-xs px-2",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {displayValue}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3" align="start">
        {/* CABEÇALHO DE NAVEGAÇÃO */}
        <div className="flex items-center justify-between pb-3 border-b mb-3">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-7 w-7 text-muted-foreground hover:text-foreground",
              (!canGoPrev && !isYearView) ||
                (isYearView && availableYears.length > 0)
                ? "invisible"
                : "",
            )}
            onClick={() => {
              if (isYearView) setViewYear((y) => y - 10);
              else setViewYear((y) => y - 1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            className="h-7 px-2 font-semibold text-sm hover:bg-muted/50"
            onClick={() => setIsYearView(!isYearView)}
          >
            {isYearView
              ? availableYears.length > 0
                ? "Anos Disponíveis"
                : `${decadeStart} - ${decadeStart + 11}`
              : viewYear}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-7 w-7 text-muted-foreground hover:text-foreground",
              (!canGoNext && !isYearView) ||
                (isYearView && availableYears.length > 0)
                ? "invisible"
                : "",
            )}
            onClick={() => {
              if (isYearView) setViewYear((y) => y + 10);
              else setViewYear((y) => y + 1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* GRADE DE SELEÇÃO */}
        {isYearView ? (
          // VISÃO DE ANOS (ZOOM OUT - MOSTRA APENAS OS QUE EXISTEM)
          <div className="grid grid-cols-3 gap-2">
            {yearsToShow.map((y) => {
              const isSelected = value && parseInt(value.split("-")[0]) === y;
              return (
                <Button
                  key={y}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "h-8 text-xs",
                    !isSelected && y === new Date().getFullYear()
                      ? "border border-primary/50 text-primary"
                      : "",
                  )}
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </Button>
              );
            })}
          </div>
        ) : (
          // VISÃO DE MESES (PADRÃO)
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((m, i) => {
              const monthKey = `${viewYear}-${String(i + 1).padStart(2, "0")}`;
              const isSelected = value === monthKey;
              // Bloqueia o botão se a data não existir no banco
              const isDisabled =
                availableDates.length > 0 && !availableDates.includes(monthKey);
              const isCurrentMonth =
                viewYear === new Date().getFullYear() &&
                i === new Date().getMonth();

              return (
                <Button
                  key={m}
                  variant={isSelected ? "default" : "ghost"}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 text-xs",
                    !isSelected && isCurrentMonth && !isDisabled
                      ? "border border-primary/50 text-primary"
                      : "",
                    isDisabled ? "opacity-30 cursor-not-allowed" : "",
                  )}
                  onClick={() => handleMonthSelect(i)}
                >
                  {m}
                </Button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
