import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ResultadoService } from 'src/services/resultado-service/resultado-service.service';
import { CreateResultadoDto } from './resultado.dto'; // Ajuste path

@Controller('resultados')
export class ResultadosController {
  constructor(private readonly resultadoService: ResultadoService) {}

  @Post()
  salvarResultado(@Body() dto: CreateResultadoDto) {
    return this.resultadoService.saveResult({
      indicadorId: dto.indicadorId,
      unidadeId: dto.unidadeId,
      competencia: dto.competencia,
      valor: dto.valor,
      valorTexto: dto.valorTexto,
      analiseCritica: dto.analiseCritica,
    });
  }

  @Post('lote')
  salvarEmLote(@Body() dtos: CreateResultadoDto[]) {
    return this.resultadoService.bulkCreate(dtos);
  }

  @Get()
  buscarPorCompetencia(
    @Query('competencia') competencia: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.resultadoService.findByCompetencia(competencia, uId);
  }
}
