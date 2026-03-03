import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';
import { CreateIndicadorDto } from '../indicador.dto';

// =========================================================================
// TIPAGENS AUXILIARES PARA AGREGAÇÃO GLOBAL
// =========================================================================

type SihGlobalAgrupado = {
  ano: number;
  mes: number;
  total_internacoes: number;
  total_obitos: number;
  total_icsap: number;
  faturamento_total_sih: number;
  internacoes_uti: number;
  obitos_uti: number;
  soma_dias_perm: number;
};

type SiaResumoGlobalAgrupado = {
  ano: number;
  mes: number;
  quantidade_produzida: number;
  quantidade_aprovada: number;
  valor_produzido: number;
  faturamento_total_sia: number;
};

type SiaCboGlobalAgrupado = {
  ano: number;
  mes: number;
  cbo_profissional: string;
  qtd_procedimentos_apresentados: number;
  qtd_procedimentos_aprovados: number;
  faturamento_gerado: number;
};

interface MinisterialFiltroInput {
  unidade_id?: number;
  ano?: number;
  mes?: number;
}

@Injectable()
export class IndicadorService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // INDICADORES LOCAIS (PLANILHAS/MANUAL)
  // =========================================================================

  async create(data: CreateIndicadorDto) {
    const { tiposUnidadeIds, ...indicadorData } = data;

    return await this.prisma.indicadores.create({
      data: {
        ...indicadorData,
        indicador_tipo_unidade: {
          create:
            tiposUnidadeIds?.map((id) => ({
              tipo_unidade_id: id,
            })) || [],
        },
      },
    });
  }

  async findAll(
    tipoUnidadeId?: number,
    unidadeId?: number,
    isAuth: boolean = false,
  ) {
    const where: Prisma.indicadoresWhereInput = {};

    if (tipoUnidadeId) {
      where.indicador_tipo_unidade = {
        some: { tipo_unidade_id: tipoUnidadeId },
      };
    } else if (unidadeId) {
      where.indicador_tipo_unidade = {
        some: { tipo_de_unidade: { unidades: { some: { id: unidadeId } } } },
      };
    }

    return this.prisma.indicadores.findMany({
      where,
      include: {
        indicador_tipo_unidade: { include: { tipo_de_unidade: true } },
      },
      orderBy: { descricao: 'asc' },
    });
  }

  async findOneWithResults(
    id: number,
    unidadeId?: number,
    isAuth: boolean = false,
  ) {
    const resultadosQuery: Prisma.resultadosFindManyArgs = {
      orderBy: { competencia: 'asc' },
      take: 12,
      include: { unidades: true },
    };

    if (unidadeId) {
      resultadosQuery.where = { unidade_id: unidadeId };
    }

    const indicador = await this.prisma.indicadores.findUnique({
      where: { id },
      include: {
        indicador_tipo_unidade: { include: { tipo_de_unidade: true } },
        resultados: resultadosQuery,
      },
    });

    if (indicador && !isAuth) {
      indicador.resultados = indicador.resultados.map((resultado) => ({
        ...resultado,
        analise_critica: null,
      }));
    }

    return indicador;
  }

  async findManyForComparison(
    ids: number[],
    unidadeId?: number,
    isAuth: boolean = false,
  ) {
    const resultadosQuery: Prisma.resultadosFindManyArgs = {
      orderBy: { competencia: 'asc' },
    };

    if (unidadeId) {
      resultadosQuery.where = { unidade_id: unidadeId };
    }

    const indicadores = await this.prisma.indicadores.findMany({
      where: { id: { in: ids } },
      include: {
        resultados: resultadosQuery,
      },
    });

    if (!isAuth) {
      return indicadores.map((ind) => ({
        ...ind,
        resultados: ind.resultados.map((res) => ({
          ...res,
          analise_critica: null,
        })),
      }));
    }

    return indicadores;
  }

  async update(id: number, data: CreateIndicadorDto) {
    const { tiposUnidadeIds, ...indicadorData } = data;

    return await this.prisma.indicadores.update({
      where: { id },
      data: {
        ...indicadorData,
        ...(tiposUnidadeIds && {
          indicador_tipo_unidade: {
            deleteMany: {},
            create: tiposUnidadeIds.map((tid) => ({ tipo_unidade_id: tid })),
          },
        }),
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.indicadores.delete({ where: { id } });
  }

  // =========================================================================
  // INDICADORES MINISTERIAIS (VIEWS DO DATASUS)
  // =========================================================================

  async findMinisterialSih(
    unidadeId?: number,
    ano?: number,
    mes?: number,
    isGlobal: boolean = false,
  ) {
    const where: MinisterialFiltroInput = {};
    if (ano) where.ano = ano;
    if (mes) where.mes = mes;

    if (!isGlobal && unidadeId) {
      where.unidade_id = unidadeId;
    }

    const records = await this.prisma.vw_indicadores_sih.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });

    if (!isGlobal) return records;

    const agrupado = records.reduce<Record<string, SihGlobalAgrupado>>(
      (acc, curr) => {
        const key = `${curr.ano}-${curr.mes}`;
        if (!acc[key]) {
          acc[key] = {
            ano: curr.ano || 0,
            mes: curr.mes || 0,
            total_internacoes: 0,
            total_obitos: 0,
            total_icsap: 0,
            faturamento_total_sih: 0,
            internacoes_uti: 0,
            obitos_uti: 0,
            soma_dias_perm: 0,
          };
        }
        acc[key].total_internacoes += Number(curr.total_internacoes || 0);
        acc[key].total_obitos += Number(curr.total_obitos || 0);
        acc[key].total_icsap += Number(curr.total_icsap || 0);
        acc[key].faturamento_total_sih += Number(
          curr.faturamento_total_sih || 0,
        );
        acc[key].internacoes_uti += Number(curr.internacoes_uti || 0);
        acc[key].obitos_uti += Number(curr.obitos_uti || 0);
        acc[key].soma_dias_perm +=
          Number(curr.media_permanencia_dias || 0) *
          Number(curr.total_internacoes || 0);

        return acc;
      },
      {},
    );

    return Object.values(agrupado)
      .map((g) => ({
        unidade_id: 0,
        cnes: 'REDE',
        ano: g.ano,
        mes: g.mes,
        total_internacoes: g.total_internacoes,
        total_obitos: g.total_obitos,
        taxa_mortalidade_institucional: g.total_internacoes
          ? Number(((g.total_obitos / g.total_internacoes) * 100).toFixed(2))
          : 0,
        media_permanencia_dias: g.total_internacoes
          ? Number((g.soma_dias_perm / g.total_internacoes).toFixed(2))
          : 0,
        total_icsap: g.total_icsap,
        proporcao_icsap: g.total_internacoes
          ? Number(((g.total_icsap / g.total_internacoes) * 100).toFixed(2))
          : 0,
        faturamento_total_sih: g.faturamento_total_sih,
        ticket_medio_internacao: g.total_internacoes
          ? Number((g.faturamento_total_sih / g.total_internacoes).toFixed(2))
          : 0,
        internacoes_uti: g.internacoes_uti,
        obitos_uti: g.obitos_uti,
        proporcao_obitos_uti: g.internacoes_uti
          ? Number(((g.obitos_uti / g.internacoes_uti) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => b.ano - a.ano || b.mes - a.mes);
  }

  async findMinisterialSiaResumo(
    unidadeId?: number,
    ano?: number,
    mes?: number,
    isGlobal: boolean = false,
  ) {
    const where: MinisterialFiltroInput = {};
    if (ano) where.ano = ano;
    if (mes) where.mes = mes;

    if (!isGlobal && unidadeId) {
      where.unidade_id = unidadeId;
    }

    const records = await this.prisma.vw_indicadores_sia_resumo.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });

    if (!isGlobal) return records;

    const agrupado = records.reduce<Record<string, SiaResumoGlobalAgrupado>>(
      (acc, curr) => {
        const key = `${curr.ano}-${curr.mes}`;
        if (!acc[key]) {
          acc[key] = {
            ano: curr.ano || 0,
            mes: curr.mes || 0,
            quantidade_produzida: 0,
            quantidade_aprovada: 0,
            valor_produzido: 0,
            faturamento_total_sia: 0,
          };
        }
        acc[key].quantidade_produzida += Number(curr.quantidade_produzida || 0);
        acc[key].quantidade_aprovada += Number(curr.quantidade_aprovada || 0);
        acc[key].valor_produzido += Number(curr.valor_produzido || 0);
        acc[key].faturamento_total_sia += Number(
          curr.faturamento_total_sia || 0,
        );
        return acc;
      },
      {},
    );

    return Object.values(agrupado)
      .map((g) => ({
        unidade_id: 0,
        cnes: 'REDE',
        ano: g.ano,
        mes: g.mes,
        quantidade_produzida: g.quantidade_produzida,
        quantidade_aprovada: g.quantidade_aprovada,
        indice_glosa_ambulatorial: g.quantidade_produzida
          ? Number(
              (
                ((g.quantidade_produzida - g.quantidade_aprovada) /
                  g.quantidade_produzida) *
                100
              ).toFixed(2),
            )
          : 0,
        valor_produzido: g.valor_produzido,
        faturamento_total_sia: g.faturamento_total_sia,
      }))
      .sort((a, b) => b.ano - a.ano || b.mes - a.mes);
  }

  async findMinisterialSiaEspecialidade(
    unidadeId?: number,
    ano?: number,
    mes?: number,
    isGlobal: boolean = false,
  ) {
    const where: MinisterialFiltroInput = {};
    if (ano) where.ano = ano;
    if (mes) where.mes = mes;

    if (!isGlobal && unidadeId) {
      where.unidade_id = unidadeId;
    }

    const records =
      await this.prisma.vw_indicadores_sia_especialidades.findMany({
        where,
        orderBy: [
          { ano: 'desc' },
          { mes: 'desc' },
          { faturamento_gerado: 'desc' },
        ],
      });

    if (!isGlobal) return records;

    const agrupado = records.reduce<Record<string, SiaCboGlobalAgrupado>>(
      (acc, curr) => {
        const key = `${curr.ano}-${curr.mes}-${curr.cbo_profissional}`;
        if (!acc[key]) {
          acc[key] = {
            ano: curr.ano || 0,
            mes: curr.mes || 0,
            cbo_profissional: curr.cbo_profissional || 'N/I',
            qtd_procedimentos_apresentados: 0,
            qtd_procedimentos_aprovados: 0,
            faturamento_gerado: 0,
          };
        }
        acc[key].qtd_procedimentos_apresentados += Number(
          curr.qtd_procedimentos_apresentados || 0,
        );
        acc[key].qtd_procedimentos_aprovados += Number(
          curr.qtd_procedimentos_aprovados || 0,
        );
        acc[key].faturamento_gerado += Number(curr.faturamento_gerado || 0);
        return acc;
      },
      {},
    );

    return Object.values(agrupado)
      .map((g) => ({
        unidade_id: 0,
        cnes: 'REDE',
        ano: g.ano,
        mes: g.mes,
        cbo_profissional: g.cbo_profissional,
        qtd_procedimentos_apresentados: g.qtd_procedimentos_apresentados,
        qtd_procedimentos_aprovados: g.qtd_procedimentos_aprovados,
        faturamento_gerado: g.faturamento_gerado,
      }))
      .sort(
        (a, b) =>
          b.ano - a.ano ||
          b.mes - a.mes ||
          b.faturamento_gerado - a.faturamento_gerado,
      );
  }
}
