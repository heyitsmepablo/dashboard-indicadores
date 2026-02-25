import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class IndicadorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.indicadoresCreateInput) {
    return await this.prisma.indicadores.create({ data });
  }

  // findAll pode opcionalmente filtrar resultados de uma unidade específica dentro dos indicadores
  async findAll(setor?: string, unidadeId?: number) {
    const where: Prisma.indicadoresWhereInput = setor
      ? { setor: { contains: setor, mode: 'insensitive' } }
      : {};

    const includeResultados = unidadeId
      ? { where: { unidade_id: unidadeId }, orderBy: { competencia: 'asc' } }
      : { orderBy: { competencia: 'asc' } };

    return this.prisma.indicadores.findMany({
      where,
      include: {
        resultados: includeResultados as any,
      },
      orderBy: { descricao: 'asc' },
    });
  }

  // Busca indicador e seus resultados (filtrados por unidade se fornecido)
  async findOneWithResults(id: number, unidadeId?: number) {
    const resultadosQuery: any = {
      orderBy: { competencia: 'asc' },
      take: 12,
      include: { unidades: true }, // Inclui o nome da unidade no resultado
    };

    if (unidadeId) {
      resultadosQuery.where = { unidade_id: unidadeId };
    }

    return this.prisma.indicadores.findUnique({
      where: { id },
      include: {
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

  async update(id: number, data: Prisma.indicadoresUpdateInput) {
    return this.prisma.indicadores.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.indicadores.delete({ where: { id } });
  }

  async getUniqueSectors() {
    const setores = await this.prisma.indicadores.findMany({
      select: { setor: true },
      distinct: ['setor'],
      orderBy: { setor: 'asc' },
    });
    return setores.map((i) => i.setor);
  }
}
