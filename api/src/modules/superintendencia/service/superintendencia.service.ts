import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class SuperintendenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.superintendenciasCreateInput) {
    return this.prisma.superintendencias.create({ data });
  }

  async findAll() {
    return this.prisma.superintendencias.findMany({
      orderBy: { nome: 'asc' },
      include: {
        tipo_de_unidade: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.superintendencias.findUnique({
      where: { id },
      include: {
        tipo_de_unidade: true,
        unidades: true,
      },
    });
  }
}
