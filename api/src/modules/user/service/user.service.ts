import { Injectable } from '@nestjs/common';
import { Prisma, usuarios } from 'generated/prisma/client';
import { PrismaService } from 'src/services/prisma-service/prisma-service.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<usuarios | null> {
    return this.prisma.usuarios.findUnique({
      where: { email },
    });
  }

  // O Prisma lidará automaticamente com a geração do UUID se configurado no DB,
  // mas garantimos que a tipagem bate com o schema.
  async create(data: Prisma.usuariosCreateInput): Promise<usuarios> {
    return this.prisma.usuarios.create({ data });
  }
}
