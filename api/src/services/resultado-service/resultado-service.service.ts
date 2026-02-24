// src/resultados/resultados.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class ResultadosService {
  constructor(private readonly prisma: PrismaService) {}

  // Salva ou Atualiza um resultado (Upsert)
  async saveResult(data: {
    indicadorId: number;
    competencia: Date | string;
    valor?: number;
    valorTexto?: string;
    analiseCritica?: string;
  }) {
    // Garante que a data esteja no formato Date ISO
    const dataCompetencia = new Date(data.competencia);

    return await this.prisma.resultados.upsert({
      where: {
        indicador_id_competencia: {
          indicador_id: data.indicadorId,
          competencia: dataCompetencia,
        },
      },
      update: {
        valor: data.valor,
        valor_texto: data.valorTexto,
        analise_critica: data.analiseCritica,
      },
      create: {
        indicador_id: data.indicadorId,
        competencia: dataCompetencia,
        valor: data.valor,
        valor_texto: data.valorTexto,
        analise_critica: data.analiseCritica,
      },
    });
  }

  async findByCompetencia(competencia: string) {
    const date = new Date(competencia);
    return this.prisma.resultados.findMany({
      where: { competencia: date },
      include: { indicadores: true },
    });
  }

  // Importação em lote (caso você queira colar uma planilha)
  async bulkCreate(dataList: any[]) {
    return this.prisma.$transaction(
      dataList.map((item: { indicador_id: number; competencia: Date }) =>
        this.prisma.resultados.upsert({
          where: {
            indicador_id_competencia: {
              indicador_id: item.indicador_id,
              competencia: new Date(item.competencia),
            },
          },
          create: { ...item, competencia: new Date(item.competencia) },
          update: { ...item, competencia: new Date(item.competencia) },
        }),
      ),
    );
  }
}
