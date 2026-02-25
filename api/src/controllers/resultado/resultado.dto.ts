// src/resultados/resultado.dto.ts
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
  unidadeId: number; // Novo campo obrigatório

  @IsDateString() // Valida formato ISO 8601 (YYYY-MM-DD)
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
