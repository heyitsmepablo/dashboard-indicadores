"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Building2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboard } from "@/lib/dashboard-context";
import { Unidade } from "@/lib/types";

interface UnitSelectorProps {
  value?: number | null;
  onChange?: (val: number) => void;
  customList?: Unidade[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  selectedIds?: number[];
  groupLabel?: string;
}

export function UnitSelector({
  value,
  onChange,
  customList,
  className,
  placeholder = "Selecione a unidade",
  disabled = false,
  selectedIds = [],
  groupLabel,
}: UnitSelectorProps) {
  const {
    unidadesFiltradas,
    unidadeSelecionada,
    setUnidadeSelecionada,
    setorAtivo,
  } = useDashboard();
  const [open, setOpen] = useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : unidadeSelecionada;
  const listToRender =
    isControlled && customList ? customList : unidadesFiltradas;

  const handleSelect = (currentIdStr: string) => {
    const id = Number(currentIdStr);
    if (isControlled && onChange) {
      onChange(id);
    } else {
      setUnidadeSelecionada(id);
    }
    setOpen(false);
  };

  const selectedUnit = useMemo(() => {
    return listToRender.find((u) => u.id === currentValue);
  }, [listToRender, currentValue]);

  const isDisabled = disabled || listToRender.length === 0;

  const groupedList = useMemo(() => {
    const groups: Record<string, typeof listToRender> = {};
    listToRender.forEach((u) => {
      const name =
        groupLabel || setorAtivo || u.tipo_de_unidade?.nome || "Unidades";
      if (!groups[name]) groups[name] = [];
      groups[name].push(u);
    });
    return groups;
  }, [listToRender, groupLabel, setorAtivo]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-[2.5rem] py-2 px-3 text-xs sm:text-sm text-left",
            !currentValue && "text-muted-foreground",
            className,
          )}
          disabled={isDisabled}
        >
          <div className="flex items-start gap-2 w-full overflow-hidden">
            <Building2 className="h-4 w-4 shrink-0 opacity-50 mt-0.5" />
            {selectedUnit ? (
              <div className="flex flex-col leading-tight w-full">
                <span className="font-bold">{selectedUnit.sigla}</span>
                <span className="opacity-70 text-[10px] sm:text-xs whitespace-normal break-words">
                  {selectedUnit.nome}
                </span>
              </div>
            ) : (
              <span className="truncate mt-0.5">
                {isDisabled ? "Indisponível" : placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 self-center" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar unidade..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>

            {Object.entries(groupedList).map(([groupName, units]) => (
              <CommandGroup key={groupName} heading={groupName.toUpperCase()}>
                {units.map((u) => {
                  const isChecked =
                    selectedIds.length > 0
                      ? selectedIds.includes(u.id)
                      : currentValue === u.id;

                  return (
                    <CommandItem
                      key={u.id}
                      value={`${u.id} ${u.sigla} ${u.nome}`}
                      onSelect={() => handleSelect(String(u.id))}
                      className="text-xs sm:text-sm cursor-pointer py-2 transition-colors"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0 transition-opacity",
                          isChecked
                            ? "opacity-100 text-primary font-bold"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col w-full overflow-hidden">
                        <span className="font-bold">{u.sigla}</span>
                        <span
                          className="text-muted-foreground text-xs truncate"
                          title={u.nome}
                        >
                          {u.nome}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
