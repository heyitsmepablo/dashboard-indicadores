import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class TipoUnidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(superintendenciaId?: number) {
    const where = superintendenciaId
      ? { superintendencia_id: superintendenciaId }
      : {};
    return await this.prisma.tipo_de_unidade.findMany({
      where,
      include: { superintendencias: true },
      orderBy: { nome: 'asc' },
    });
  }

  async create(data: Prisma.tipo_de_unidadeCreateInput) {
    return await this.prisma.tipo_de_unidade.create({ data });
  }
}
