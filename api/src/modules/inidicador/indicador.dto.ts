import { IsString, IsOptional, IsIn, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateIndicadorDto {
  @ApiProperty({
    description: 'Nome/Descrição do indicador',
    example: 'Taxa de Mortalidade Institucional',
  })
  @IsString()
  descricao: string;

  @ApiPropertyOptional({
    description: 'Fonte dos dados ou fórmula de cálculo',
    example: '(Óbitos / Internações) * 100',
  })
  @IsOptional()
  @IsString()
  fonte_formula?: string;

  @ApiPropertyOptional({
    description: 'Meta estabelecida para o indicador',
    example: '< 5%',
  })
  @IsOptional()
  @IsString()
  meta?: string;

  @ApiPropertyOptional({
    description: 'Unidade de medida do resultado',
    enum: [
      'ABSOLUTO',
      'PERCENTUAL',
      'FINANCEIRO',
      'TEMPO_DIAS',
      'TEMPO_HORAS',
      'TAXA',
      'TEXTO',
    ],
    default: 'ABSOLUTO',
  })
  @IsOptional() // Adicionado porque tem valor default
  @IsString()
  @IsIn([
    'ABSOLUTO',
    'PERCENTUAL',
    'FINANCEIRO',
    'TEMPO_DIAS',
    'TEMPO_HORAS',
    'TAXA',
    'TEXTO',
  ])
  unidade_de_medida: string = 'ABSOLUTO';

  @ApiPropertyOptional({
    description:
      'Array de IDs dos tipos de unidade vinculados a este indicador',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tiposUnidadeIds?: number[];
}

// Cria o DTO de Update automaticamente tornando todos os campos do Create opcionais
export class UpdateIndicadorDto extends PartialType(CreateIndicadorDto) {}
