import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { UnidadeService } from 'src/modules/unidade/service/unidade.service';

@ApiTags('Unidades')
@ApiBearerAuth()
@Controller('unidades')
export class UnidadeController {
  constructor(private readonly service: UnidadeService) {}

  /**
   * Cria uma nova Unidade de Saúde.
   * Representa o nível mais baixo da estrutura organizacional.
   */
  @Post()
  @ApiBody({
    description: 'Payload de criação de unidade',
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', example: 'Unidade Básica Central' },
        sigla: { type: 'string', example: 'UBC' },
        cnes: { type: 'string', example: '1234567' },
        tipo_unidade_id: { type: 'number', example: 1 },
      },
    },
  })
  create(@Body() data: Prisma.unidadesCreateInput) {
    return this.service.create(data);
  }

  /**
   * Lista as unidades cadastradas.
   * Permite filtragem por tipo de unidade ou por superintendência (cascade).
   */
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

  /**
   * Busca uma unidade de saúde pelo ID.
   * Traz as informações detalhadas, incluindo os dados de sua hierarquia.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
