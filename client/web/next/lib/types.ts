export type UnidadeMedida =
  | "ABSOLUTO"
  | "PERCENTUAL"
  | "FINANCEIRO"
  | "TEMPO_DIAS"
  | "TEMPO_HORAS"
  | "TAXA"
  | "TEXTO";

export interface Superintendencia {
  id: number;
  nome: string;
  sigla: string;
  tipo_de_unidade?: TipoUnidade[]; // Relacionamento incluído na busca
}

export interface TipoUnidade {
  id: number;
  nome: string;
  superintendencia_id: number;
  superintendencias?: Superintendencia;
}

export interface Unidade {
  id: number;
  nome: string;
  sigla?: string;
  tipo_unidade_id: number;
  superintendencia_id?: number;
  tipo_de_unidade?: TipoUnidade;
  superintendencias?: Superintendencia;
}

export interface Resultado {
  id: number;
  indicador_id: number;
  unidade_id: number;
  competencia: string;
  valor: number;
  valor_texto?: string | null;
  analise_critica?: string | null;
  updated_at?: string; // Usado para calcular a última atualização
  unidades?: Unidade;
}

export interface Indicador {
  id: number;
  descricao: string;
  meta: string | null;
  fonte_formula?: string | null;
  unidade_de_medida: UnidadeMedida;
  resultados?: Resultado[];
  indicador_tipo_unidade?: {
    tipo_de_unidade: TipoUnidade;
  }[];
  // Campos virtuais
  unidadeId?: number;
  nomeUnidade?: string;
}
