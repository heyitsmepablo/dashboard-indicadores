import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsISO8601,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Opcional: caso use Swagger

/**
 * DTO Base para garantir consistência entre as operações de análise
 */
export class BaseAnaliseDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID do indicador referente à análise' })
  indicadorId: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID da unidade de saúde da SEMUS' })
  unidadeId: number;

  @IsISO8601()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Data de competência no formato ISO8601 (AAAA-MM-DD)',
  })
  competencia: string;
}

/**
 * DTO para solicitação inicial (Fluxo Assíncrono)
 */
export class SolicitarAnaliseDto extends BaseAnaliseDto {}

/**
 * DTO para geração em tempo real (Fluxo Síncrono)
 * Permite que a competência seja opcional caso queira assumir o mês atual no service
 */
export class GerarAnaliseSobDemandaDto extends BaseAnaliseDto {
  @IsOptional()
  @IsISO8601()
  competencia: string = new Date(Date.now()).toISOString();
}

/**
 * DTO para o retorno do Webhook do n8n
 * Inclui o campo obrigatório da análise crítica gerada pelo Gemini
 */
export class WebhookRetornoDto extends BaseAnaliseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Texto da análise crítica gerado pela IA' })
  analise: string;
}
