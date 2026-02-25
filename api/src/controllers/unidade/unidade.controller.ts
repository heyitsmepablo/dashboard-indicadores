import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

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
  findAll(@Query('tipoId') tipoId?: string) {
    if (tipoId) {
      return this.service.findByTipo(parseInt(tipoId));
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
