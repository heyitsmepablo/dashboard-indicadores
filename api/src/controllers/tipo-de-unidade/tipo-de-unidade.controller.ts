import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { TipoUnidadeService } from 'src/services/tipo-de-unidade-service/tipo-de-unidade-service.service';

@Controller('tipo-unidade')
export class TipoUnidadeController {
  constructor(private readonly service: TipoUnidadeService) {}

  @Get()
  @ApiQuery({ name: 'superintendenciaId', required: false, type: String })
  findAll(@Query('superintendenciaId') supId?: string) {
    const sId = supId ? parseInt(supId) : undefined;
    return this.service.findAll(sId);
  }

  @Post()
  create(@Body() data: Prisma.tipo_de_unidadeCreateInput) {
    return this.service.create(data);
  }
}
