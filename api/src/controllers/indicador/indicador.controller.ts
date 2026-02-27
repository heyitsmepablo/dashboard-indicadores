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
} from '@nestjs/common';
import { IndicadorService } from 'src/services/indicadores-service/indicador-service.service';
import { CreateIndicadorDto } from './indicador.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('indicador')
export class IndicadorController {
  constructor(private readonly indicadorService: IndicadorService) {}

  @Post()
  create(@Body() createIndicadorDto: CreateIndicadorDto) {
    return this.indicadorService.create(createIndicadorDto);
  }

  // src/controllers/indicador.controller.ts

  @Get()
  @ApiQuery({
    name: 'tipoUnidadeId',
    required: false,
    type: String,
    description: 'Filtra indicadores por um tipo de unidade específico',
  })
  @ApiQuery({
    name: 'unidadeId',
    required: false,
    type: String,
    description:
      'Filtra indicadores que pertencem ao tipo de uma unidade específica',
  })
  findAll(
    @Query('tipoUnidadeId') tipoUnidadeId?: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const tId = tipoUnidadeId ? parseInt(tipoUnidadeId) : undefined;
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findAll(tId, uId);
  }

  @Get('comparar')
  comparar(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('unidadeId') unidadeId?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findManyForComparison(ids, uId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findOneWithResults(id, uId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateIndicadorDto,
  ) {
    return this.indicadorService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.indicadorService.remove(id);
  }
}
