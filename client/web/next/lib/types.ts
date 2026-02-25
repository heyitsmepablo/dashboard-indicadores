// src/lib/types.ts

export type UnidadeMedida =
  | "ABSOLUTO"
  | "PERCENTUAL"
  | "FINANCEIRO"
  | "TEMPO_DIAS"
  | "TEMPO_HORAS"
  | "TAXA"
  | "TEXTO";

export interface TipoUnidade {
  id: number;
  nome: string;
}

export interface Unidade {
  id: number;
  nome: string;
  sigla?: string;
  tipo_unidade_id: number;
  tipo_de_unidade?: TipoUnidade;
}

export interface Resultado {
  id: number;
  indicador_id: number;
  unidade_id: number; // Adicionado
  competencia: string; // ISO Date String (yyyy-mm-dd)
  valor: number;
  valor_texto?: string | null;
  analise_critica?: string | null;
  unidades?: Unidade; // Caso venha populado pelo include
}

export interface Indicador {
  id: number;
  setor: string;
  descricao: string;
  meta: string | null;
  unidade_de_medida: UnidadeMedida;
  resultados?: Resultado[];
  // Campos virtuais para o frontend (opcionais)
  unidadeId?: number; // Para saber de qual unidade veio este objeto no contexto
  nomeUnidade?: string; // Para exibir no card/gráfico
}
