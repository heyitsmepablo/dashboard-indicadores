-- Arquivo: database/schema.sql

-- Habilita a função de remover acentos
CREATE EXTENSION IF NOT EXISTS unaccent;
ALTER FUNCTION unaccent(text) IMMUTABLE;
-- ============================================================================
-- 1. ESTRUTURA DE TABELAS
-- ============================================================================

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

CREATE UNIQUE INDEX "uk_resultado_competencia" ON "resultados" ("indicador_id", "competencia");

ALTER TABLE "resultados" 
ADD CONSTRAINT "fk_indicador" 
FOREIGN KEY ("indicador_id") 
REFERENCES "indicadores" ("id") 
ON DELETE CASCADE;

CREATE INDEX "idx_indicadores_setor" ON "indicadores" ("setor");
CREATE INDEX "idx_resultados_data" ON "resultados" ("competencia");
CREATE INDEX idx_indicadores_setor_unaccent 
ON indicadores (unaccent(setor));