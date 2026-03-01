import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';
import { CreateIndicadorDto } from 'src/module/inidicador/indicador.dto';

@Injectable()
export class IndicadorService {
  constructor(private readonly prisma: PrismaService) {}

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
    const resultadosQuery: any = {
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
    const resultadosQuery: any = {
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

    return this.prisma.indicadores.update({
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
    return this.prisma.indicadores.delete({ where: { id } });
  }
}
