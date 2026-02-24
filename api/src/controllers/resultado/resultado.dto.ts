import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateResultadoDto {
  @IsNumber()
  indicadorId: number;

  @IsDateString() // Valida formato ISO 8601 (YYYY-MM-DD)
  competencia: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsString()
  analiseCritica?: string;
}
