"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { useColumns } from "@/hooks/use-columns";
import { Loader2, Building2, Search } from "lucide-react";
import { SectorHeader } from "./sector-header";
import { SectorGrid } from "./sector-grid";
import { UnitSelector } from "@/components/shared/unit-selector";

/**
 * Componente Contêiner (Smart) do Dashboard Setorial.
 * Gerencia a conexão com o contexto do dashboard, estados de busca,
 * filtragem e orquestra a renderização da interface e estados vazios.
 */
export function SectorDashboard() {
  const {
    tiposUnidade,
    tipoUnidadeAtivoId,
    indicadoresAtuais,
    unidadesFiltradas,
    unidadeSelecionada,
    setUnidadeSelecionada,
    loading,
    toggleItemComparador,
    itensComparacao,
    setComparadorAberto,
    toggleItemPainel,
    isNoPainel,
    isComparando,
  } = useDashboard();

  // Estados Locais
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
  const columns = useColumns();

  // Helpers / Cálculos
  const tipoAtivoNome =
    tiposUnidade.find((t) => t.id === tipoUnidadeAtivoId)?.nome ||
    "Selecione um tipo";

  const indicadoresFiltrados = useMemo(() => {
    if (!termoBusca.trim()) return indicadoresAtuais;
    const termo = termoBusca.toLowerCase();
    return indicadoresAtuais.filter((ind) =>
      ind.descricao.toLowerCase().includes(termo),
    );
  }, [indicadoresAtuais, termoBusca]);

  // Renderizações Condicionais (Early Returns)
  if (loading) {
    return (
      <div className="flex flex-col gap-4 h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Carregando indicadores...
        </p>
      </div>
    );
  }

  if (unidadesFiltradas.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-20">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {tipoAtivoNome}
        </h1>
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4 border-2 border-dashed rounded-xl bg-muted/10 p-8 text-center animate-in fade-in duration-500">
          <div className="bg-background p-4 rounded-full shadow-sm mb-2">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Sem unidades vinculadas
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Não encontramos nenhuma unidade cadastrada ou mapeada para o tipo de
            unidade <strong className="text-foreground">{tipoAtivoNome}</strong>
            .
          </p>
        </div>
      </div>
    );
  }

  if (!unidadeSelecionada) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Selecione uma Unidade
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma unidade para visualizar seus indicadores.
        </p>
        <div className="w-full max-w-xs mt-2">
          <UnitSelector
            value={unidadeSelecionada}
            onChange={setUnidadeSelecionada}
            unitsList={unidadesFiltradas}
            isOpen={isUnitSelectorOpen}
            setIsOpen={setIsUnitSelectorOpen}
          />
        </div>
      </div>
    );
  }

  // Renderização Principal
  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectorHeader
        tipoAtivoNome={tipoAtivoNome}
        totalIndicadores={indicadoresAtuais.length}
        totalComparacao={itensComparacao.length}
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
        onCompareClick={() => setComparadorAberto(true)}
        unidadeSelecionada={unidadeSelecionada}
        setUnidadeSelecionada={setUnidadeSelecionada}
        unidadesFiltradas={unidadesFiltradas}
        isUnitSelectorOpen={isUnitSelectorOpen}
        setIsUnitSelectorOpen={setIsUnitSelectorOpen}
      />

      {indicadoresAtuais.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl bg-muted/5 gap-2">
          <p className="text-muted-foreground font-medium">
            Nenhum indicador registrado.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Esta unidade ainda não possui dados alimentados.
          </p>
        </div>
      ) : indicadoresFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl bg-muted/5 gap-2">
          <Search className="h-8 w-8 text-muted-foreground/30 mb-1" />
          <p className="text-muted-foreground font-medium">
            Nenhum resultado encontrado.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Tente buscar por outro termo.
          </p>
        </div>
      ) : (
        <SectorGrid
          indicadores={indicadoresFiltrados}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          columns={columns}
          unidadeSelecionada={unidadeSelecionada}
          toggleItemPainel={toggleItemPainel}
          isNoPainel={isNoPainel}
          toggleItemComparador={toggleItemComparador}
          isComparando={isComparando}
        />
      )}
    </div>
  );
}
