// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Pool } from 'pg'; // <--- Importante: Importe o Pool do driver nativo
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  vw_indicadores_sia_cbo: any;
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // 1. Cria o Pool de conexões usando o driver nativo 'pg'
    const pool = new Pool({
      connectionString,
      // Dica: Em produção, você pode querer configurar max conexões aqui
      // max: 10
    });

    // 2. Passa o pool para o adaptador do Prisma
    const adapter = new PrismaPg(pool);

    // 3. Inicializa o Prisma Client usando o adaptador
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
