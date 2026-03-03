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

  @Post('solicitar')
  async solicitar(@Body() body: SolicitarAnaliseDto) {
    return this.analiseService.solicitarAnalise(body);
  }

  @Post('webhook-retorno')
  async receberDoN8n(@Body() body: WebhookRetornoDto) {
    return this.analiseService.salvarAnaliseGerada(body);
  }

  @Post('gerar-agora')
  async gerarAgora(@Body() body: GerarAnaliseSobDemandaDto) {
    return this.analiseService.gerarAnaliseSobDemanda(body);
  }
}
