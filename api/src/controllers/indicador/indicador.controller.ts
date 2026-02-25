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
import { Prisma } from 'generated/prisma/client';

@Controller('indicador')
export class IndicadorController {
  constructor(private readonly indicadorService: IndicadorService) {}

  @Post()
  create(@Body() createIndicadorDto: CreateIndicadorDto) {
    return this.indicadorService.create(
      createIndicadorDto as Prisma.indicadoresCreateInput,
    );
  }

  @Get()
  findAll(
    @Query('setor') setor?: string,
    @Query('unidadeId') unidadeId?: string,
  ) {
    const uId = unidadeId ? parseInt(unidadeId) : undefined;
    return this.indicadorService.findAll(setor, uId);
  }

  @Get('setores')
  getSetores() {
    return this.indicadorService.getUniqueSectors();
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
    @Body() data: Prisma.indicadoresUpdateInput,
  ) {
    return this.indicadorService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.indicadorService.remove(id);
  }
}
