import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UnidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.unidadesCreateInput) {
    return this.prisma.unidades.create({ data });
  }

  async findAll(superintendenciaId?: number) {
    const where = superintendenciaId
      ? { superintendencia_id: superintendenciaId }
      : {};
    return this.prisma.unidades.findMany({
      where,
      include: {
        tipo_de_unidade: true,
        superintendencias: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.unidades.findUnique({
      where: { id },
      include: {
        tipo_de_unidade: true,
        superintendencias: true,
      },
    });
  }

  async findByTipo(tipoId: number) {
    return this.prisma.unidades.findMany({
      where: { tipo_unidade_id: tipoId },
      include: { superintendencias: true },
      orderBy: { nome: 'asc' },
    });
  }
}
