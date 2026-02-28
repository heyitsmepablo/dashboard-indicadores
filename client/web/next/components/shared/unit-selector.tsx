"use client";

import { useMemo } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
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
import { Unidade } from "@/lib/types";

/**
 * Propriedades para o componente de seleção de unidades.
 */
interface UnitSelectorProps {
  /** Unidade singular selecionada no momento. Utilizado para controle externo. */
  value?: number | null;
  /** Função de callback chamada quando uma unidade é selecionada. */
  onChange: (val: number) => void;
  /** Lista de unidades a serem renderizadas no seletor. */
  unitsList: Unidade[];
  /** Classes CSS adicionais para o gatilho do Popover. */
  className?: string;
  /** Texto de placeholder exibido quando nenhuma unidade está selecionada. */
  placeholder?: string;
  /** Desabilita completamente o seletor. */
  disabled?: boolean;
  /** Array de IDs de unidades atualmente selecionadas (modo multi-seleção). */
  selectedIds?: number[];
  /** String estática para forçar um nome de grupo específico. */
  groupLabel?: string;
  /** Array de IDs de unidades que devem aparecer visualmente desabilitadas (ex: sem dados). */
  disabledIds?: number[];
  /** Controla a exibição do botão "Selecionar todas". */
  showSelectAll?: boolean;
  /** Função disparada ao clicar no botão "Selecionar todas". */
  onSelectAll?: () => void;
  /** Texto customizado para o botão de selecionar todas. */
  selectAllText?: string;
  /** Estado de controle do popover (aberto/fechado). */
  isOpen: boolean;
  /** Função para alterar o estado do popover. */
  setIsOpen: (open: boolean) => void;
}

/**
 * Componente apresentacional (Dumb) para selecionar unidades.
 * Requer que o estado e a lista de unidades sejam gerenciados pelo componente pai.
 */
export function UnitSelector({
  value,
  onChange,
  unitsList,
  className,
  placeholder = "Selecione a unidade",
  disabled = false,
  selectedIds = [],
  groupLabel,
  disabledIds = [],
  showSelectAll = false,
  onSelectAll,
  selectAllText = "SELECIONAR TODAS DISPONÍVEIS",
  isOpen,
  setIsOpen,
}: UnitSelectorProps) {
  const handleSelect = (currentIdStr: string) => {
    const id = Number(currentIdStr);
    onChange(id);
    setIsOpen(false);
  };

  const selectedUnit = useMemo(() => {
    return unitsList.find((u) => u.id === value);
  }, [unitsList, value]);

  const isDisabled = disabled || unitsList.length === 0;

  const groupedList = useMemo(() => {
    const groups: Record<string, typeof unitsList> = {};
    unitsList.forEach((u) => {
      const name = groupLabel || u.tipo_de_unidade?.nome || "Unidades";
      if (!groups[name]) groups[name] = [];
      groups[name].push(u);
    });
    return groups;
  }, [unitsList, groupLabel]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-between h-auto min-h-[2.5rem] py-2 px-3 text-xs sm:text-sm text-left",
            !value && "text-muted-foreground",
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
              <CommandGroup
                key={groupName}
                heading={
                  <div className="flex items-center justify-between w-full pr-1">
                    <span className="uppercase">{groupName}</span>
                    {showSelectAll && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onSelectAll) onSelectAll();
                          setIsOpen(false);
                        }}
                        className="text-[10px] uppercase font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                      >
                        {selectAllText}
                      </button>
                    )}
                  </div>
                }
              >
                {units.map((u) => {
                  const isChecked =
                    selectedIds.length > 0
                      ? selectedIds.includes(u.id)
                      : value === u.id;

                  const isItemDisabled = disabledIds.includes(u.id);

                  return (
                    <CommandItem
                      key={u.id}
                      value={`${u.id} ${u.sigla} ${u.nome}`}
                      onSelect={() => {
                        if (!isItemDisabled) handleSelect(String(u.id));
                      }}
                      disabled={isItemDisabled}
                      className={cn(
                        "text-xs sm:text-sm py-2 transition-colors",
                        isItemDisabled
                          ? "opacity-50 cursor-not-allowed grayscale"
                          : "cursor-pointer",
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0 transition-opacity",
                          isChecked && !isItemDisabled
                            ? "opacity-100 text-primary font-bold"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col w-full overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{u.sigla}</span>
                          {isItemDisabled && (
                            <span className="text-[9px] font-normal text-muted-foreground bg-muted/50 border px-1 rounded leading-tight">
                              Sem dados
                            </span>
                          )}
                        </div>
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
