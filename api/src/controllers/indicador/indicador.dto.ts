import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateIndicadorDto {
  @IsString()
  setor: string = '';

  @IsString()
  descricao: string = '';

  @IsOptional()
  @IsString()
  meta?: string = '';

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
  unidadeMedida: string = 'ABSOLUTO';
}
