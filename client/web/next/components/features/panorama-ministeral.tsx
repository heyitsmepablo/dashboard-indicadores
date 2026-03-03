"use client";

import { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashifyService } from "@/services/dashify.service";
import { Indicador, Resultado } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnitSelector } from "@/components/shared/unit-selector";
import { Loader2, Globe2 } from "lucide-react";
import { SectorGrid } from "@/components/features/sector/sector-grid";
import { useColumns } from "@/hooks/use-columns";

interface Props {
  tipo: "sih" | "sia";
}

export function PanoramaMinisterial({ tipo }: Props) {
  const {
    unidades,
    tiposUnidade,
    anoFiltro,
    setAnoFiltro,
    toggleItemPainel,
    isNoPainel,
    toggleItemComparador,
    isComparando,
  } = useDashboard();

  const columns = useColumns();
  const [loading, setLoading] = useState(false);
  const [visaoUnidade, setVisaoUnidade] = useState(false);
  const [localTipoId, setLocalTipoId] = useState<string>("");
  const [localUnidadeId, setLocalUnidadeId] = useState<number | null>(null);
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
  const [dadosRaw, setDadosRaw] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tiposPermitidos = useMemo(() => {
    return tiposUnidade.filter((t) =>
      tipo === "sih"
        ? t.nome.toLowerCase().includes("hospital") ||
          t.nome.toLowerCase().includes("mista")
        : t.nome.toLowerCase().includes("ambulatório") ||
          t.nome.toLowerCase().includes("policlínica"),
    );
  }, [tiposUnidade, tipo]);

  const unidadesPermitidas = useMemo(() => {
    if (!localTipoId) return [];
    return unidades.filter((u) => u.tipo_unidade_id === Number(localTipoId));
  }, [unidades, localTipoId]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isGlobal = !visaoUnidade;
        const uid = visaoUnidade && localUnidadeId ? localUnidadeId : undefined;

        if (visaoUnidade && !localUnidadeId) {
          setDadosRaw([]);
          setLoading(false);
          return;
        }

        const dados =
          tipo === "sih"
            ? await DashifyService.getMinisterialSih(uid, anoFiltro, isGlobal)
            : await DashifyService.getMinisterialSia(uid, anoFiltro, isGlobal);

        setDadosRaw(dados);
      } catch (err) {
        console.error("Erro ao buscar dados ministeriais", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tipo, visaoUnidade, localUnidadeId, anoFiltro]);

  const indicadoresMapeados = useMemo(() => {
    if (!dadosRaw || dadosRaw.length === 0) return [];

    const mapField = (
      key: string,
      descricao: string,
      unidadeMedida: any = "ABSOLUTO",
    ): Indicador => {
      // Gera ID fake combinando string com hash simples para evitar colisão
      const fakeId =
        Math.abs(
          key.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0),
        ) + 9000;
      const targetUnitId = visaoUnidade ? localUnidadeId! : 0; // 0 para Global/Rede

      const resultados: Resultado[] = dadosRaw
        .map((d: any, idx) => ({
          id: fakeId + idx,
          indicador_id: fakeId,
          unidade_id: targetUnitId,
          competencia: `${d.ano}-${String(d.mes).padStart(2, "0")}-01T00:00:00.000Z`,
          valor: Number(d[key] || 0),
        }))
        .reverse();

      return {
        id: fakeId,
        descricao,
        meta: null,
        unidade_de_medida: unidadeMedida,
        resultados,
        isMinisterial: true,
        ministerialKey: key,
        unidadeId: targetUnitId,
      };
    };

    return tipo === "sih"
      ? [
          mapField(
            "total_internacoes",
            "Total de Internações (AIH)",
            "ABSOLUTO",
          ),
          mapField(
            "taxa_mortalidade_institucional",
            "Taxa de Mortalidade Institucional",
            "PERCENTUAL",
          ),
          mapField(
            "media_permanencia_dias",
            "Média de Permanência",
            "TEMPO_DIAS",
          ),
          mapField("proporcao_icsap", "Proporção de ICSAP", "PERCENTUAL"),
          mapField(
            "faturamento_total_sih",
            "Faturamento Total SIH",
            "FINANCEIRO",
          ),
          mapField(
            "ticket_medio_internacao",
            "Ticket Médio por Internação",
            "FINANCEIRO",
          ),
        ]
      : [
          mapField(
            "quantidade_produzida",
            "Qtd. Procedimentos Produzidos",
            "ABSOLUTO",
          ),
          mapField(
            "quantidade_aprovada",
            "Qtd. Procedimentos Aprovados",
            "ABSOLUTO",
          ),
          mapField(
            "indice_glosa_ambulatorial",
            "Índice de Glosa Ambulatorial",
            "PERCENTUAL",
          ),
          mapField(
            "faturamento_total_sia",
            "Faturamento Aprovado SIA",
            "FINANCEIRO",
          ),
        ];
  }, [dadosRaw, tipo, visaoUnidade, localUnidadeId]);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Panorama{" "}
            {tipo === "sih" ? "Hospitalar (SIH)" : "Ambulatorial (SIA)"}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Globe2 className="h-4 w-4" /> Dados oficiais agregados do DATASUS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={String(anoFiltro)}
            onValueChange={(v) => setAnoFiltro(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2026, 2025, 2024, 2023].map((ano) => (
                <SelectItem key={ano} value={String(ano)}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-muted/20 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center space-x-2 shrink-0">
          <Checkbox
            id="visao_unidade"
            checked={visaoUnidade}
            onCheckedChange={(c) => {
              setVisaoUnidade(!!c);
              if (!c) {
                setLocalTipoId("");
                setLocalUnidadeId(null);
              }
            }}
          />
          <label
            htmlFor="visao_unidade"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Visão por Unidade Local
          </label>
        </div>

        {visaoUnidade && (
          <div className="flex flex-col sm:flex-row w-full gap-4 items-center animate-in fade-in slide-in-from-left-4">
            <Select value={localTipoId} onValueChange={setLocalTipoId}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Selecione o Tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposPermitidos.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <UnitSelector
              value={localUnidadeId}
              onChange={setLocalUnidadeId}
              unitsList={unidadesPermitidas}
              disabled={!localTipoId}
              isOpen={isUnitSelectorOpen}
              setIsOpen={setIsUnitSelectorOpen}
              className="w-full sm:w-[350px]"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[30vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Processando arquivos ministeriais...
          </p>
        </div>
      ) : indicadoresMapeados.length === 0 ? (
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground">
          Nenhum dado consolidado encontrado para os filtros selecionados.
        </div>
      ) : (
        <SectorGrid
          indicadores={indicadoresMapeados}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          columns={columns}
          unidadeSelecionada={visaoUnidade ? localUnidadeId! : 0}
          toggleItemPainel={(id, uid) =>
            toggleItemPainel(
              id,
              uid,
              indicadoresMapeados.find((i) => i.id === id),
            )
          }
          isNoPainel={isNoPainel}
          toggleItemComparador={(id, uid) =>
            toggleItemComparador(
              id,
              uid,
              indicadoresMapeados.find((i) => i.id === id),
            )
          }
          isComparando={isComparando}
        />
      )}
    </div>
  );
}
