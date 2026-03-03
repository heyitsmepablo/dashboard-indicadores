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
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/optional-jwt-auth.guard';

@ApiBearerAuth()
@Controller('indicador')
export class IndicadorController {
  constructor(private readonly indicadorService: IndicadorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createIndicadorDto: CreateIndicadorDto) {
    return this.indicadorService.create(createIndicadorDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'tipoUnidadeId', required: false, type: String })
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  findAll(
    @Req() req: any,
    @Query('tipoUnidadeId') tipoUnidadeId?: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAuth = !!req.user;
    const tId = tipoUnidadeId ? parseInt(tipoUnidadeId) : undefined;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findAll(tId, uId, isAuth);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('comparar')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  comparar(
    @Req() req: any,
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('unidadeId') unidadeId?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findManyForComparison(ids, uId, isAuth);
  }

  // =========================================================================
  // ROTAS MINISTERIAIS (DATASUS) - DEVEM FICAR ANTES DO GET(':id')
  // =========================================================================

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
  getMinisterialSih(
    @Query('unidadeId') unidadeId?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('global') global?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    const a = ano ? parseInt(ano) : undefined;
    const m = mes ? parseInt(mes) : undefined;
    const isGlobal = global === 'true';
    return this.indicadorService.findMinisterialSih(uId, a, m, isGlobal);
  }

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
  getMinisterialSiaResumo(
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
  getMinisterialSiaEspecialidade(
    @Query('unidadeId') unidadeId?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('global') global?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    const a = ano ? parseInt(ano) : undefined;
    const m = mes ? parseInt(mes) : undefined;
    const isGlobal = global === 'true';
    return this.indicadorService.findMinisterialSiaEspecialidade(
      uId,
      a,
      m,
      isGlobal,
    );
  }

  // =========================================================================
  // ROTAS COM PARÂMETRO DINÂMICO DE ID (SEMPRE POR ÚLTIMO)
  // =========================================================================

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiQuery({ name: 'unidadeId', required: false, type: String })
  findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findOneWithResults(id, uId, isAuth);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateIndicadorDto,
  ) {
    return this.indicadorService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.indicadorService.remove(id);
  }
}
