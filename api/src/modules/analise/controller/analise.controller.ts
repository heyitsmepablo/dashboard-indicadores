import { Controller, Post, Body } from '@nestjs/common';
import { AnaliseService } from '../service/analise.service';
import {
  SolicitarAnaliseDto,
  WebhookRetornoDto,
  GerarAnaliseSobDemandaDto,
} from '../analise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Análises IA')
@ApiBearerAuth()
@Controller('analises')
export class AnaliseController {
  constructor(private readonly analiseService: AnaliseService) {}

  /**
   * Solicita uma análise crítica assíncrona.
   * Envia os dados do indicador para o motor de IA via Webhook (n8n).
   */
  @Post('solicitar')
  async solicitar(@Body() body: SolicitarAnaliseDto) {
    return await this.analiseService.solicitarAnalise(body);
  }

  /**
   * Webhook de retorno do n8n.
   * Recebe a análise crítica processada pela IA e a salva no banco de dados.
   */
  @Post('webhook-retorno')
  async receberDoN8n(@Body() body: WebhookRetornoDto) {
    return await this.analiseService.salvarAnaliseGerada(body);
  }

  /**
   * Gera uma análise crítica sob demanda (síncrona).
   * Envia os dados de contexto filtrados para a IA e aguarda a resposta em tempo real.
   */
  @Post('gerar-agora')
  async gerarAgora(@Body() body: GerarAnaliseSobDemandaDto) {
    return await this.analiseService.gerarAnaliseSobDemanda(body);
  }
}
