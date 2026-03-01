import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class ResultadoService {
  constructor(private readonly prisma: PrismaService) {}

  async saveResult(data: {
    indicadorId: number;
    unidadeId: number;
    competencia: Date | string;
    valor?: number;
    valorTexto?: string;
    analiseCritica?: string;
  }) {
    const dataCompetencia = new Date(data.competencia);

    return await this.prisma.resultados.upsert({
      where: {
        indicador_id_competencia_unidade_id: {
          indicador_id: data.indicadorId,
          competencia: dataCompetencia,
          unidade_id: data.unidadeId,
        },
      },
      update: {
        valor: data.valor,
        valor_texto: data.valorTexto,
        analise_critica: data.analiseCritica,
      },
      create: {
        indicador_id: data.indicadorId,
        unidade_id: data.unidadeId,
        competencia: dataCompetencia,
        valor: data.valor,
        valor_texto: data.valorTexto,
        analise_critica: data.analiseCritica,
      },
    });
  }

  async findByCompetencia(
    competencia: string,
    unidadeId?: number,
    isAuth: boolean = false,
  ) {
    const date = new Date(competencia);
    const where: any = { competencia: date };

    if (unidadeId) {
      where.unidade_id = unidadeId;
    }

    const resultados = await this.prisma.resultados.findMany({
      where,
      include: {
        indicadores: true,
        unidades: true,
      },
    });

    if (!isAuth) {
      return resultados.map((resultado) => ({
        ...resultado,
        analise_critica: null,
      }));
    }

    return resultados;
  }

  async bulkCreate(dataList: any[]) {
    return this.prisma.$transaction(
      dataList.map((item) =>
        this.prisma.resultados.upsert({
          where: {
            indicador_id_competencia_unidade_id: {
              indicador_id: item.indicadorId,
              competencia: new Date(item.competencia),
              unidade_id: item.unidadeId,
            },
          },
          create: {
            indicador_id: item.indicadorId,
            competencia: new Date(item.competencia),
            unidade_id: item.unidadeId,
            valor: item.valor,
            valor_texto: item.valorTexto,
            analise_critica: item.analiseCritica,
          },
          update: {
            valor: item.valor,
            valor_texto: item.valorTexto,
            analise_critica: item.analiseCritica,
          },
        }),
      ),
    );
  }
}
