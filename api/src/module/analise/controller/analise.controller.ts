import { Controller, Post, Body } from '@nestjs/common';
import { AnaliseService } from '../service/analise.service';
import {
  SolicitarAnaliseDto,
  WebhookRetornoDto,
  GerarAnaliseSobDemandaDto,
} from '../analise.dto';

@Controller('analises')
export class AnaliseController {
  constructor(private readonly analiseService: AnaliseService) {}

  /**
   * Fluxo Assíncrono: Solicita análise e não aguarda o Gemini.
   */
  @Post('solicitar')
  async solicitar(@Body() body: SolicitarAnaliseDto) {
    // CORREÇÃO: Passando o objeto DTO completo conforme definido no pacto
    return this.analiseService.solicitarAnalise(body);
  }

  /**
   * Endpoint de Callback: Recebe o resultado processado pelo n8n.
   */
  @Post('webhook-retorno')
  async receberDoN8n(@Body() body: WebhookRetornoDto) {
    return this.analiseService.salvarAnaliseGerada(body);
  }

  /**
   * Fluxo Síncrono: Aguarda o processamento do Gemini e retorna direto para a UI.
   */
  @Post('gerar-agora')
  async gerarAgora(@Body() body: GerarAnaliseSobDemandaDto) {
    // CORREÇÃO: Passando o objeto DTO completo para o serviço
    return this.analiseService.gerarAnaliseSobDemanda(body);
  }
}
