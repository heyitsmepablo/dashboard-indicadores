import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ResultadoService } from 'src/services/resultado-service/resultado-service.service';
import { IndicadorService } from 'src/modules/inidicador/service/indicador-service.service';
import { Prisma } from 'generated/prisma/client';

// Importação dos DTOs que estabelecem o pacto
import {
  SolicitarAnaliseDto,
  WebhookRetornoDto,
  GerarAnaliseSobDemandaDto,
} from '../analise.dto';

// Tipagem auxiliar para o TypeScript e ESLint entenderem que o join com 'unidades' foi feito no service
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

  /**
   * Dispara o fluxo assíncrono para o n8n.
   * Utiliza SolicitarAnaliseDto para garantir indicadorId, unidadeId e competencia.
   */
  async solicitarAnalise(dto: SolicitarAnaliseDto) {
    const { indicadorId, unidadeId, competencia } = dto;

    // Busca o indicador com histórico de até 12 meses
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
        // Fazemos o cast (as ResultadoComUnidade[]) para habilitar o autocompletar e acalmar o TS
        historico: (indicador.resultados as ResultadoComUnidade[]).map((r) => ({
          mes: r.competencia,
          valor: r.valor,
          unidade: r.unidades?.nome || 'Desconhecida',
        })),
      },
    };

    try {
      // Disparo fire-and-forget para o n8n
      this.httpService.post(this.N8N_WEBHOOK_URL, payload).subscribe({
        error: (err: unknown) => {
          // Verificação de segurança exigida pelo ESLint para ler o .message
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

  /**
   * Recebe o callback do n8n e persiste no banco via ResultadoService.
   */
  async salvarAnaliseGerada(dto: WebhookRetornoDto) {
    return await this.resultadoService.saveResult({
      indicadorId: dto.indicadorId,
      unidadeId: dto.unidadeId,
      competencia: dto.competencia,
      analiseCritica: dto.analise, // Mapeia o campo do DTO para o campo do Prisma
    });
  }

  /**
   * Fluxo síncrono: Aguarda o Gemini processar e retorna direto para a interface.
   */
  async gerarAnaliseSobDemanda(dto: GerarAnaliseSobDemandaDto) {
    const { indicadorId, unidadeId } = dto;

    const indicador = await this.indicadorService.findOneWithResults(
      indicadorId,
      unidadeId,
    );

    if (!indicador || !indicador.resultados.length) {
      throw new HttpException(
        'Dados insuficientes para análise em tempo real.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = {
      dados: {
        nome: indicador.descricao,
        meta: indicador.meta,
        unidadeMedida: indicador.unidade_de_medida,
        historico: (indicador.resultados as ResultadoComUnidade[]).map((r) => ({
          mes: r.competencia,
          valor: r.valor,
        })),
      },
    };

    try {
      // Timeout de 30s para aguardar o raciocínio da IA
      const response = await firstValueFrom(
        this.httpService.post(this.N8N_WEBHOOK_URL, payload, {
          timeout: 30000,
        }),
      );

      // Tratamento para evitar leitura de 'any' na resposta do axios
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const analiseGerada =
        response?.data?.analiseCritica || 'Análise não retornada.';

      return {
        indicadorId,
        analiseGerada: String(analiseGerada),
      };
    } catch (error: unknown) {
      // Verificação de segurança para ler o .message do erro
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Timeout ou Erro no n8n: ${errorMessage}`);

      throw new HttpException(
        'O motor de IA demorou muito para responder. Tente novamente.',
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }
  }
}
