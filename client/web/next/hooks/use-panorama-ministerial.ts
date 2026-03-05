"use client";

import { useState, useEffect, useMemo } from "react";
import { DashifyService } from "@/services/dashify.service";
import { adaptMinisterialToIndicador } from "@/adapters/ministerial-adapter";

export function usePanoramaMinisterial(
  tipo: "sih" | "sia",
  anoFiltro: number,
  unidades: any[],
  tiposUnidade: any[],
) {
  const [loading, setLoading] = useState(false);
  const [visaoUnidade, setVisaoUnidade] = useState(false);
  const [localTipoId, setLocalTipoId] = useState<string>("");
  const [localUnidadeId, setLocalUnidadeId] = useState<number | null>(null);
  const [dadosRaw, setDadosRaw] = useState<any[]>([]);

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

        const fetchMethod =
          tipo === "sih"
            ? DashifyService.getMinisterialSih
            : DashifyService.getMinisterialSia;
        const dados = await fetchMethod(uid, anoFiltro, isGlobal);
        setDadosRaw(dados);
      } catch (err) {
        console.error("Erro ao buscar dados ministeriais", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tipo, visaoUnidade, localUnidadeId, anoFiltro]);

  // Olha como ficou limpo! O Hook não sabe COMO o dado é mapeado, ele só delega para o Adapter.
  const indicadoresMapeados = useMemo(() => {
    const targetUnitId = visaoUnidade && localUnidadeId ? localUnidadeId : 0;
    return adaptMinisterialToIndicador(dadosRaw, tipo, targetUnitId);
  }, [dadosRaw, tipo, visaoUnidade, localUnidadeId]);

  return {
    loading,
    visaoUnidade,
    setVisaoUnidade,
    localTipoId,
    setLocalTipoId,
    localUnidadeId,
    setLocalUnidadeId,
    tiposPermitidos,
    unidadesPermitidas,
    indicadoresMapeados,
  };
}
