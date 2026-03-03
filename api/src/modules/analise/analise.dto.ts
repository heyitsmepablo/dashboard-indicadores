import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class SolicitarAnaliseDto {
  @IsNumber()
  indicadorId: number;

  @IsNumber()
  unidadeId: number;

  @IsString()
  competencia: string;
}

export class WebhookRetornoDto {
  @IsNumber()
  indicadorId: number;

  @IsNumber()
  unidadeId: number;

  @IsString()
  competencia: string;

  @IsString()
  analise: string;
}

export class GerarAnaliseSobDemandaDto {
  @IsNumber()
  indicadorId: number;

  @IsNumber()
  unidadeId: number;

  @IsObject()
  dadosContexto: {
    nome: string;
    meta?: string | null;
    unidadeMedida: string;
    historico: any[];
    visaoGlobal?: boolean;
  };
}
