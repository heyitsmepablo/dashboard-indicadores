import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseArrayPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IndicadorService } from '../service/indicador-service.service';
import { CreateIndicadorDto } from '../indicador.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/optional-jwt-auth.guard';

@ApiTags('Indicadores')
@ApiBearerAuth()
@Controller('indicador')
export class IndicadorController {
  constructor(private readonly indicadorService: IndicadorService) {}

  /**
   * Cria um novo indicador.
   * Registra o indicador e vincula aos tipos de unidade fornecidos.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createIndicadorDto: CreateIndicadorDto) {
    return await this.indicadorService.create(createIndicadorDto);
  }

  /**
   * Lista os indicadores.
   * Permite filtragem por tipo de unidade ou por uma unidade específica.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'tipoUnidadeId', required: false, type: String })
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  async findAll(
    @Req() req: any,
    @Query('tipoUnidadeId') tipoUnidadeId?: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAuth = !!req.user;
    const tId = tipoUnidadeId ? parseInt(tipoUnidadeId) : undefined;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return await this.indicadorService.findAll(tId, uId, isAuth);
  }

  /**
   * Retorna múltiplos indicadores para comparação.
   * Busca um conjunto específico de indicadores baseado nos IDs fornecidos.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('comparar')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  async comparar(
    @Req() req: any,
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('unidadeId') unidadeId?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return await this.indicadorService.findManyForComparison(ids, uId, isAuth);
  }

  // =========================================================================
  // ROTAS MINISTERIAIS (DATASUS)
  // =========================================================================

  /**
   * Busca dados do panorama Hospitalar (SIH).
   * Retorna as consolidações ministeriais de internações, óbitos, ICSAP e faturamento.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('ministerial/sih')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  @ApiQuery({ name: 'ano', required: false, type: String })
  @ApiQuery({ name: 'mes', required: false, type: String })
  @ApiQuery({
    name: 'global',
    required: false,
    type: String,
    description: 'Soma os dados de todas as unidades na rede',
  })
  async getMinisterialSih(
    @Query('unidadeId') unidadeId?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('global') global?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    const a = ano ? parseInt(ano) : undefined;
    const m = mes ? parseInt(mes) : undefined;
    const isGlobal = global === 'true';
    return await this.indicadorService.findMinisterialSih(uId, a, m, isGlobal);
  }

  /**
   * Busca o resumo do panorama Ambulatorial (SIA).
   * Retorna informações sobre procedimentos produzidos, aprovados, glosas e faturamento.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('ministerial/sia/resumo')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  @ApiQuery({ name: 'ano', required: false, type: String })
  @ApiQuery({ name: 'mes', required: false, type: String })
  @ApiQuery({
    name: 'global',
    required: false,
    type: String,
    description: 'Soma os dados de todas as unidades na rede',
  })
  async getMinisterialSiaResumo(
    @Query('unidadeId') unidadeId?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('global') global?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    const a = ano ? parseInt(ano) : undefined;
    const m = mes ? parseInt(mes) : undefined;
    const isGlobal = global === 'true';
    return this.indicadorService.findMinisterialSiaResumo(uId, a, m, isGlobal);
  }

  /**
   * Busca os dados do SIA segregados por Especialidade Médica/CBO.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('ministerial/sia/especialidade')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  @ApiQuery({ name: 'ano', required: false, type: String })
  @ApiQuery({ name: 'mes', required: false, type: String })
  @ApiQuery({
    name: 'global',
    required: false,
    type: String,
    description: 'Soma os dados de todas as unidades na rede',
  })
  async getMinisterialSiaEspecialidade(
    @Query('unidadeId') unidadeId?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('global') global?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    const a = ano ? parseInt(ano) : undefined;
    const m = mes ? parseInt(mes) : undefined;
    const isGlobal = global === 'true';
    return await this.indicadorService.findMinisterialSiaEspecialidade(
      uId,
      a,
      m,
      isGlobal,
    );
  }

  // =========================================================================
  // ROTAS COM PARÂMETRO DINÂMICO DE ID (SEMPRE POR ÚLTIMO)
  // =========================================================================

  /**
   * Busca um indicador pelo ID.
   * Retorna os detalhes do indicador juntamente com seu histórico de resultados (limitado a 12 meses).
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  async findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return await this.indicadorService.findOneWithResults(id, uId, isAuth);
  }

  /**
   * Atualiza as informações de um indicador.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateIndicadorDto,
  ) {
    return await this.indicadorService.update(id, data);
  }

  /**
   * Exclui um indicador do sistema.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.indicadorService.remove(id);
  }
}
