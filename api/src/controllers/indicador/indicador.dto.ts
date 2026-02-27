import { IsString, IsOptional, IsIn, IsArray, IsNumber } from 'class-validator';

export class CreateIndicadorDto {
  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  fonte_formula?: string;

  @IsOptional()
  @IsString()
  meta?: string;

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

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tiposUnidadeIds?: number[];
}
