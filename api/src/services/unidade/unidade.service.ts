import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UnidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.unidadesCreateInput) {
    return this.prisma.unidades.create({ data });
  }

  async findAll() {
    return this.prisma.unidades.findMany({
      include: { tipo_de_unidade: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.unidades.findUnique({
      where: { id },
      include: { tipo_de_unidade: true },
    });
  }

  // Buscar unidades por tipo (ex: listar só hospitais)
  async findByTipo(tipoId: number) {
    return this.prisma.unidades.findMany({
      where: { tipo_unidade_id: tipoId },
      orderBy: { nome: 'asc' },
    });
  }
}
