import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { UnidadeService } from 'src/services/unidade/unidade.service';

@Controller('unidades')
export class UnidadesController {
  constructor(private readonly service: UnidadeService) {}

  @Post()
  create(@Body() data: Prisma.unidadesCreateInput) {
    return this.service.create(data);
  }

  @Get()
  @ApiQuery({ name: 'tipoId', required: false, type: String })
  @ApiQuery({ name: 'superintendenciaId', required: false, type: String })
  findAll(
    @Query('tipoId') tipoId?: string,
    @Query('superintendenciaId') supId?: string,
  ) {
    if (tipoId) return this.service.findByTipo(parseInt(tipoId));

    const sId = supId ? parseInt(supId) : undefined;
    return this.service.findAll(sId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
