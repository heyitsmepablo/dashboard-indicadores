-- Arquivo: database/schema.sql

-- Habilita a função de remover acentos
CREATE EXTENSION IF NOT EXISTS unaccent;
ALTER FUNCTION unaccent(text) IMMUTABLE;

-- ============================================================================
-- 1. ESTRUTURA DE TABELAS
-- ============================================================================

CREATE TABLE "tipo_de_unidade" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL
);

CREATE TABLE "unidades" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(255) NOT NULL,
  "sigla" VARCHAR(50),
  "tipo_unidade_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "indicadores" (
  "id" SERIAL PRIMARY KEY,
  "setor" VARCHAR(100) NOT NULL,
  "descricao" TEXT NOT NULL,
  "fonte_formula" TEXT,
  "meta" TEXT,
  "unidade_de_medida" VARCHAR(50) NOT NULL DEFAULT 'ABSOLUTO'
    CHECK (unidade_de_medida IN (
        'ABSOLUTO', 'PERCENTUAL', 'FINANCEIRO', 
        'TEMPO_DIAS', 'TEMPO_HORAS', 'TAXA', 'TEXTO'
    )),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "resultados" (
  "id" SERIAL PRIMARY KEY,
  "indicador_id" INT NOT NULL,
  "unidade_id" INT NOT NULL, -- Nova coluna para relacionamento com unidades
  "competencia" DATE NOT NULL,
  "valor" NUMERIC(15,2),
  "valor_texto" TEXT,
  "analise_critica" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. ÍNDICES E RELACIONAMENTOS
-- ============================================================================

-- Relacionamento Unidades -> Tipo de Unidade
ALTER TABLE "unidades"
ADD CONSTRAINT "fk_unidade_tipo"
FOREIGN KEY ("tipo_unidade_id")
REFERENCES "tipo_de_unidade" ("id");

-- Índices para Unidades
CREATE INDEX "idx_unidades_tipo" ON "unidades" ("tipo_unidade_id");

-- Chave única para Resultados (agora considerando a unidade)
CREATE UNIQUE INDEX "uk_resultado_competencia_unidade" ON "resultados" ("indicador_id", "competencia", "unidade_id");

-- Relacionamento Resultados -> Indicadores
ALTER TABLE "resultados" 
ADD CONSTRAINT "fk_resultado_indicador" 
FOREIGN KEY ("indicador_id") 
REFERENCES "indicadores" ("id") 
ON DELETE CASCADE;

-- Relacionamento Resultados -> Unidades
ALTER TABLE "resultados" 
ADD CONSTRAINT "fk_resultado_unidade" 
FOREIGN KEY ("unidade_id") 
REFERENCES "unidades" ("id") 
ON DELETE CASCADE;

-- Índices gerais
CREATE INDEX "idx_indicadores_setor" ON "indicadores" ("setor");
CREATE INDEX "idx_resultados_competencia" ON "resultados" ("competencia");
CREATE INDEX "idx_resultados_unidade" ON "resultados" ("unidade_id");
CREATE INDEX "idx_indicadores_setor_unaccent" ON "indicadores" (unaccent(setor));