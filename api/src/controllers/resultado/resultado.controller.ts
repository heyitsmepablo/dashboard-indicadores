import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ResultadoService } from 'src/services/resultado-service/resultado-service.service';
import { CreateResultadoDto } from './resultado.dto';
import { JwtAuthGuard } from 'src/module/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/module/auth/optional-jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('resultados')
export class ResultadosController {
  constructor(private readonly resultadoService: ResultadoService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('lote')
  salvarEmLote(@Body() dtos: CreateResultadoDto[]) {
    return this.resultadoService.bulkCreate(dtos);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  buscarPorCompetencia(
    @Req() req: any,
    @Query('competencia') competencia: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.resultadoService.findByCompetencia(competencia, uId, isAuth);
  }
}
