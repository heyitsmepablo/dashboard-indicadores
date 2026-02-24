// src/indicadores/indicadores.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class IndicadorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.indicadoresCreateInput) {
    return await this.prisma.indicadores.create({ data });
  }

  async findAll(setor?: string) {
    const where: Prisma.indicadoresWhereInput = setor
      ? { setor: { contains: setor, mode: 'insensitive' } } // mode insensitive ignora Maiusculas/minusculas
      : {};

    return this.prisma.indicadores.findMany({
      where,
      orderBy: { descricao: 'asc' },
    });
  }

  async findOneWithResults(id: number) {
    return this.prisma.indicadores.findUnique({
      where: { id },
      include: {
        resultados: {
          orderBy: { competencia: 'asc' }, // Ordena cronologicamente para o gráfico não quebrar
          take: 12, // Opcional: Pegar apenas os últimos 12 meses
        },
      },
    });
  }

  async findManyForComparison(ids: number[]) {
    return this.prisma.indicadores.findMany({
      where: { id: { in: ids } },
      include: {
        resultados: {
          orderBy: { competencia: 'asc' },
        },
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

  // Lista apenas os setores únicos para montar o menu de navegação
  async getUniqueSectors() {
    const setores = await this.prisma.indicadores.findMany({
      select: { setor: true },
      distinct: ['setor'],
      orderBy: { setor: 'asc' },
    });
    return setores.map((i) => i.setor);
  }
}
