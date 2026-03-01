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
import { IndicadorService } from 'src/module/inidicador/service/indicador-service.service';
import { CreateIndicadorDto } from '../indicador.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/module/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/module/auth/optional-jwt-auth.guard';

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
    const isAuth = !!req.user;
    const tId = tipoUnidadeId ? parseInt(tipoUnidadeId) : undefined;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findAll(tId, uId, isAuth);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('comparar')
  comparar(
    @Req() req: any,
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('unidadeId') unidadeId?: string,
  ) {
    const isAuth = !!req.user;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findManyForComparison(ids, uId, isAuth);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
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
