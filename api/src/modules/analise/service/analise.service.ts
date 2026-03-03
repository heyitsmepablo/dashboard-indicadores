import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  SolicitarAnaliseDto,
  WebhookRetornoDto,
  GerarAnaliseSobDemandaDto,
} from '../analise.dto';
import { IndicadorService } from 'src/modules/inidicador/service/indicador-service.service';
import { ResultadoService } from 'src/services/resultado-service/resultado-service.service';
import { Prisma } from 'generated/prisma/client';

type ResultadoComUnidade = Prisma.resultadosGetPayload<{
  include: { unidades: true };
}>;

@Injectable()
export class AnaliseService {
  private readonly logger = new Logger(AnaliseService.name);
  private readonly N8N_WEBHOOK_URL =
    'http://localhost:5678/webhook-test/analise-dashify';

  constructor(
    private readonly indicadorService: IndicadorService,
    private readonly resultadoService: ResultadoService,
    private readonly httpService: HttpService,
  ) {}

  async solicitarAnalise(dto: SolicitarAnaliseDto) {
    const { indicadorId, unidadeId, competencia } = dto;
    const indicador = await this.indicadorService.findOneWithResults(
      indicadorId,
      unidadeId,
    );

    if (!indicador || !indicador.resultados.length) {
      throw new Error('Sem dados suficientes para gerar análise.');
    }

    const payload = {
      callback: { indicadorId, unidadeId, competencia },
      dados: {
        nome: indicador.descricao,
        meta: indicador.meta,
        unidadeMedida: indicador.unidade_de_medida,
        historico: (indicador.resultados as ResultadoComUnidade[]).map((r) => ({
          mes: r.competencia,
          valor: r.valor,
          unidade: r.unidades?.nome || 'Desconhecida',
        })),
      },
    };

    try {
      this.httpService.post(this.N8N_WEBHOOK_URL, payload).subscribe({
        error: (err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.error(`Erro ao notificar n8n: ${errorMessage}`);
        },
      });
      return {
        message:
          'Análise solicitada com sucesso. O resultado será processado pela IA.',
      };
    } catch (error: unknown) {
      throw new Error('Falha ao contatar o motor de IA.');
    }
  }

  async salvarAnaliseGerada(dto: WebhookRetornoDto) {
    return await this.resultadoService.saveResult({
      indicadorId: dto.indicadorId,
      unidadeId: dto.unidadeId,
      competencia: dto.competencia,
      analiseCritica: dto.analise,
    });
  }

  // Fluxo 100% dinâmico: recebe os dados filtrados diretamente do Frontend
  async gerarAnaliseSobDemanda(dto: GerarAnaliseSobDemandaDto) {
    const { indicadorId, dadosContexto } = dto;

    if (!dadosContexto.historico || !dadosContexto.historico.length) {
      throw new HttpException(
        'Dados insuficientes para análise.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = { dados: dadosContexto };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.N8N_WEBHOOK_URL, payload, {
          timeout: 30000,
        }),
      );

      const analiseGerada =
        response?.data?.analiseCritica || 'Análise não retornada.';

      return {
        indicadorId,
        analiseGerada: String(analiseGerada),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Timeout ou Erro no n8n: ${errorMessage}`);
      throw new HttpException(
        'O motor de IA demorou muito para responder.',
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }
  }
}
