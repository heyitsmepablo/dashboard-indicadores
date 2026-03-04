import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { SuperintendenciaService } from 'src/modules/superintendencia/service/superintendencia.service';

@ApiTags('Superintendências')
@ApiBearerAuth()
@Controller('superintendencia')
export class SuperintendenciaController {
  constructor(private readonly service: SuperintendenciaService) {}

  /**
   * Cria uma nova Superintendência.
   * Define um novo agrupamento hierárquico superior na estrutura organizacional.
   */
  @Post()
  @ApiBody({
    description: 'Payload de criação de superintendência gerado pelo Prisma',
    schema: {
      type: 'object',
      properties: {
        nome: {
          type: 'string',
          example: 'Superintendência de Atenção Primária',
        },
        sigla: { type: 'string', example: 'SAP' },
      },
    },
  })
  create(@Body() data: Prisma.superintendenciasCreateInput) {
    return this.service.create(data);
  }

  /**
   * Lista todas as superintendências.
   * Retorna a lista completa ordenada alfabeticamente.
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * Busca uma superintendência pelo ID.
   * Retorna os detalhes junto com os tipos de unidades vinculados a ela.
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findOne(id);
  }
}
