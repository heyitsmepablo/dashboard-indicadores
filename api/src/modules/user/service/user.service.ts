import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Prisma, usuarios } from 'generated/prisma/client';
import { PrismaService } from 'src/services/prisma-service/prisma-service.service';
@ApiBearerAuth()
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<usuarios | null> {
    return this.prisma.usuarios.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<usuarios | null> {
    return this.prisma.usuarios.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.usuariosCreateInput): Promise<usuarios> {
    return this.prisma.usuarios.create({ data });
  }

  async updatePassword(id: string, novaSenhaHash: string, mustChange: boolean) {
    return this.prisma.usuarios.update({
      where: { id },
      data: {
        senha: novaSenhaHash,
        must_change_password: mustChange,
      },
    });
  }

  async forcePasswordChange(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return this.prisma.usuarios.update({
      where: { email },
      data: { must_change_password: true },
    });
  }
}
