import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';
import { CreateIndicadorDto } from 'src/controllers/indicador/indicador.dto';

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

  async findAll(tipoUnidadeId?: number, unidadeId?: number) {
    const where: Prisma.indicadoresWhereInput = {};

    // Se passou tipoUnidadeId, filtra direto pelo tipo
    if (tipoUnidadeId) {
      where.indicador_tipo_unidade = {
        some: { tipo_unidade_id: tipoUnidadeId },
      };
    }
    // Se passou unidadeId, busca os indicadores vinculados ao tipo daquela unidade
    else if (unidadeId) {
      where.indicador_tipo_unidade = {
        some: {
          tipo_de_unidade: {
            unidades: {
              some: { id: unidadeId },
            },
          },
        },
      };
    }

    return this.prisma.indicadores.findMany({
      where,
      // Retorna apenas os dados do indicador e a relação com o tipo
      include: {
        indicador_tipo_unidade: { include: { tipo_de_unidade: true } },
      },
      orderBy: { descricao: 'asc' },
    });
  }

  async findOneWithResults(id: number, unidadeId?: number) {
    const resultadosQuery: any = {
      orderBy: { competencia: 'asc' },
      take: 12,
      include: { unidades: true },
    };

    if (unidadeId) {
      resultadosQuery.where = { unidade_id: unidadeId };
    }

    return this.prisma.indicadores.findUnique({
      where: { id },
      include: {
        indicador_tipo_unidade: { include: { tipo_de_unidade: true } },
        resultados: resultadosQuery,
      },
    });
  }

  async findManyForComparison(ids: number[], unidadeId?: number) {
    const resultadosQuery: any = {
      orderBy: { competencia: 'asc' },
    };

    if (unidadeId) {
      resultadosQuery.where = { unidade_id: unidadeId };
    }

    return this.prisma.indicadores.findMany({
      where: { id: { in: ids } },
      include: {
        resultados: resultadosQuery,
      },
    });
  }

  async update(id: number, data: CreateIndicadorDto) {
    const { tiposUnidadeIds, ...indicadorData } = data;

    return this.prisma.indicadores.update({
      where: { id },
      data: {
        ...indicadorData,
        ...(tiposUnidadeIds && {
          indicador_tipo_unidade: {
            deleteMany: {}, // Limpa as relações antigas
            create: tiposUnidadeIds.map((tid) => ({ tipo_unidade_id: tid })), // Insere as novas
          },
        }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.indicadores.delete({ where: { id } });
  }
}
