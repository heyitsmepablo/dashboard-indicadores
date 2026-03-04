import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ResultadoService } from 'src/modules/resultado/service/resultado-service.service';
import { CreateResultadoDto } from '../resultado.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/optional-jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Resultados')
@ApiBearerAuth()
@Controller('resultados')
export class ResultadoController {
  constructor(private readonly resultadoService: ResultadoService) {}

  /**
   * Salva o resultado de um indicador.
   * Insere ou atualiza o valor alcançado por um indicador em uma determinada unidade e competência.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async salvarResultado(@Body() dto: CreateResultadoDto) {
    return await this.resultadoService.saveResult({
      indicadorId: dto.indicadorId,
      unidadeId: dto.unidadeId,
      competencia: dto.competencia,
      valor: dto.valor,
      valorTexto: dto.valorTexto,
      analiseCritica: dto.analiseCritica,
    });
  }

  /**
   * Salva resultados em lote.
   * Permite o lançamento de múltiplos resultados de uma só vez.
   */
  @UseGuards(JwtAuthGuard)
  @Post('lote')
  async salvarEmLote(@Body() dtos: CreateResultadoDto[]) {
    return await this.resultadoService.bulkCreate(dtos);
  }

  /**
   * Busca resultados por competência.
   * Lista os resultados filtrando por mês/ano e, opcionalmente, por unidade específica.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async buscarPorCompetencia(
    @Req() req: any,
    @Query('competencia') competencia: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return await this.resultadoService.findByCompetencia(
      competencia,
      uId,
      isAuth,
    );
  }
}
