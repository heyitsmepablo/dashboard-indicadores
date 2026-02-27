import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { Prisma } from 'generated/prisma/client';
import { SuperintendenciaService } from 'src/services/superintendencia/superintendencia.service';

@Controller('superintendencia')
export class SuperintendenciaController {
  constructor(private readonly service: SuperintendenciaService) {}

  @Post()
  create(@Body() data: Prisma.superintendenciasCreateInput) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
