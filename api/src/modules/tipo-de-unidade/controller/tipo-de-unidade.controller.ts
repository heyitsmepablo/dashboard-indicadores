import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { TipoDeUnidadeService } from 'src/modules/tipo-de-unidade/service/tipo-de-unidade-service.service';

@ApiTags('Tipos de Unidade')
@ApiBearerAuth()
@Controller('tipo-unidade')
export class TipoUnidadeController {
  constructor(private readonly service: TipoDeUnidadeService) {}

  /**
   * Lista os tipos de unidade disponíveis.
   * Permite filtrar os tipos de unidade que pertencem a uma superintendência específica.
   */
  @Get()
  @ApiQuery({ name: 'superintendenciaId', required: false, type: String })
  findAll(@Query('superintendenciaId') supId?: string) {
    const sId = supId ? parseInt(supId) : undefined;
    return this.service.findAll(sId);
  }

  /**
   * Cria um novo Tipo de Unidade.
   * Exemplo: Hospitais, Policlínicas, UBS.
   */
  @Post()
  @ApiBody({
    description: 'Payload de criação do tipo de unidade',
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', example: 'Hospital de Urgência' },
        superintendencia_id: { type: 'number', example: 1 },
      },
    },
  })
  create(@Body() data: Prisma.tipo_de_unidadeCreateInput) {
    return this.service.create(data);
  }
}
