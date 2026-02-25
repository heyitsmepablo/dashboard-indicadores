import { Controller, Get, Post, Body } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

import { TipoUnidadeService } from 'src/services/tipo-de-unidade-service/tipo-de-unidade-service.service';

@Controller('tipo-unidade')
export class TipoUnidadeController {
  constructor(private readonly service: TipoUnidadeService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() data: Prisma.tipo_de_unidadeCreateInput) {
    return this.service.create(data);
  }
}
