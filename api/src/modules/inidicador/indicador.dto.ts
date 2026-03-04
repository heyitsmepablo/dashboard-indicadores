import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIndicadorDto {
  @ApiProperty({ example: 'Taxa de Mortalidade' })
  @IsString()
  @IsNotEmpty()
  descricao: string;
  @ApiPropertyOptional({ example: '5' })
  @IsString()
  @IsOptional()
  meta?: string;
  @ApiProperty({ example: 'PERCENTUAL' })
  @IsString()
  @IsNotEmpty()
  unidade_de_medida: string;
  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsArray()
  @IsOptional()
  tiposUnidadeIds?: number[];
  @ApiPropertyOptional({ example: 'SIH' })
  @IsString()
  @IsOptional()
  referencia_ministerial_sistema?: string;
  @ApiPropertyOptional({ example: 'taxa_mortalidade_institucional' })
  @IsString()
  @IsOptional()
  referencia_ministerial_chave?: string;
}

// ==========================================
// DTOs de Resposta (Swagger Output)
// ==========================================

export class ResultadoItemDto {
  @ApiProperty({ example: 10 }) id: number;
  @ApiProperty({ example: 4.5 }) valor: number;
  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' }) competencia: Date;
  @ApiPropertyOptional({ example: 'Análise...' }) analise_critica?: string;
}

export class IndicadorResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Taxa de Mortalidade' }) descricao: string;
  @ApiProperty({ example: 'PERCENTUAL' }) unidade_de_medida: string;
  @ApiPropertyOptional({ type: [ResultadoItemDto] })
  resultados?: ResultadoItemDto[];
}

export class MinisterialSihResponseDto {
  @ApiProperty({ example: 0 }) unidade_id: number;
  @ApiProperty({ example: 'REDE' }) cnes: string;
  @ApiProperty({ example: 2026 }) ano: number;
  @ApiProperty({ example: 1 }) mes: number;
  @ApiProperty({ example: 1450 }) total_internacoes: number;
  @ApiProperty({ example: 45 }) total_obitos: number;
  @ApiProperty({ example: 3.1 }) taxa_mortalidade_institucional: number;
  @ApiProperty({ example: 1500000.5 }) faturamento_total_sih: number;
}

export class MinisterialSiaResumoResponseDto {
  @ApiProperty({ example: 0 }) unidade_id: number;
  @ApiProperty({ example: 'REDE' }) cnes: string;
  @ApiProperty({ example: 2026 }) ano: number;
  @ApiProperty({ example: 1 }) mes: number;
  @ApiProperty({ example: 5000 }) quantidade_produzida: number;
  @ApiProperty({ example: 4800 }) quantidade_aprovada: number;
  @ApiProperty({ example: 4.0 }) indice_glosa_ambulatorial: number;
  @ApiProperty({ example: 250000.0 }) faturamento_total_sia: number;
}

export class MinisterialSiaEspecialidadeResponseDto {
  @ApiProperty({ example: 'REDE' }) cnes: string;
  @ApiProperty({ example: 2026 }) ano: number;
  @ApiProperty({ example: 1 }) mes: number;
  @ApiProperty({ example: '225125 - Médico Clínico' }) cbo_profissional: string;
  @ApiProperty({ example: 1200 }) qtd_procedimentos_aprovados: number;
  @ApiProperty({ example: 45000.0 }) faturamento_gerado: number;
}
