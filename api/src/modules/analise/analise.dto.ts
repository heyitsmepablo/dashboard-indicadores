import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SolicitarAnaliseDto {
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() indicadorId: number;
  @ApiProperty({ example: 5 }) @IsInt() @IsNotEmpty() unidadeId: number;
  @ApiProperty({ example: '2026-02-01T00:00:00.000Z' }) @IsString() @IsNotEmpty() competencia: string;
}

export class WebhookRetornoDto {
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() indicadorId: number;
  @ApiProperty({ example: 5 }) @IsInt() @IsNotEmpty() unidadeId: number;
  @ApiProperty({ example: '2026-02-01T00:00:00.000Z' }) @IsString() @IsNotEmpty() competencia: string;
  @ApiProperty({ example: 'Análise gerada via n8n' }) @IsString() @IsNotEmpty() analise: string;
}

export class GerarAnaliseSobDemandaDto {
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() indicadorId: number;
  @ApiPropertyOptional({ example: 5 }) @IsInt() @IsOptional() unidadeId?: number;
  @ApiProperty({ example: { historico: [] } }) @IsNotEmpty() dadosContexto: any;
}

// ==========================================
// DTOs de Resposta (Swagger Output)
// ==========================================

export class AnaliseSolicitadaResponseDto {
  @ApiProperty({ example: 'Análise solicitada com sucesso. O resultado será processado pela IA.' })
  message: string;
}

export class AnaliseSobDemandaResponseDto {
  @ApiProperty({ example: 1 })
  indicadorId: number;

  @ApiProperty({ example: 'A análise identificou queda de 5%...' })
  analiseGerada: string;
}