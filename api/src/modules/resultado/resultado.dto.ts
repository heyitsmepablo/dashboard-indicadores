import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateResultadoDto {
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() indicadorId: number;
  @ApiProperty({ example: 5 }) @IsInt() @IsNotEmpty() unidadeId: number;
  @ApiProperty({ example: '2026-02-01T00:00:00.000Z' })
  @IsNotEmpty()
  competencia: string;
  @ApiPropertyOptional({ example: 15.5 })
  @IsNumber()
  @IsOptional()
  valor?: number;
  @ApiPropertyOptional({ example: '15.5%' })
  @IsString()
  @IsOptional()
  valorTexto?: string;
  @ApiPropertyOptional({ example: 'Dentro do esperado' })
  @IsString()
  @IsOptional()
  analiseCritica?: string;
}

// ==========================================
// DTOs de Resposta (Swagger Output)
// ==========================================

export class ResultadoResponseDto {
  @ApiProperty({ example: 100 }) id: number;
  @ApiProperty({ example: 1 }) indicador_id: number;
  @ApiProperty({ example: 5 }) unidade_id: number;
  @ApiProperty({ example: '2026-02-01T00:00:00.000Z' }) competencia: Date;
  @ApiPropertyOptional({ example: 15.5 }) valor: number;
  @ApiPropertyOptional({ example: '15.5%' }) valor_texto: string;
  @ApiPropertyOptional({ example: 'Dentro do esperado' })
  analise_critica: string;
}
