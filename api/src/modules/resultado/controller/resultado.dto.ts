import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateResultadoDto {
  @IsInt()
  indicadorId: number;

  @IsInt()
  unidadeId: number;

  @IsDateString()
  competencia: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsString()
  valorTexto?: string;

  @IsOptional()
  @IsString()
  analiseCritica?: string;
}
