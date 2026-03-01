-- Habilita a função de remover acentos
CREATE EXTENSION IF NOT EXISTS unaccent;
ALTER FUNCTION unaccent(text) IMMUTABLE;

-- Habilita geração de UUID (para versões mais antigas do Postgres, se necessário)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ESTRUTURA DE TABELAS
-- ============================================================================

-- Nova Tabela: Usuários (Com UUID)
CREATE TABLE "usuarios" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nome" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "senha" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Superintendências
CREATE TABLE "superintendencias" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(255) NOT NULL,
  "sigla" VARCHAR(50),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tipo_de_unidade" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL,
  "superintendencia_id" INT
);

CREATE TABLE "unidades" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(255) NOT NULL,
  "sigla" VARCHAR(50),
  "tipo_unidade_id" INT NOT NULL,
  "superintendencia_id" INT, 
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "indicadores" (
  "id" SERIAL PRIMARY KEY,
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

-- Nova Tabela Intermediária: Indicadores <-> Tipo de Unidade (N:N)
CREATE TABLE "indicador_tipo_unidade" (
  "indicador_id" INT NOT NULL,
  "tipo_unidade_id" INT NOT NULL,
  PRIMARY KEY ("indicador_id", "tipo_unidade_id")
);

CREATE TABLE "resultados" (
  "id" SERIAL PRIMARY KEY,
  "indicador_id" INT NOT NULL,
  "unidade_id" INT NOT NULL,
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

-- Relacionamentos Unidades
ALTER TABLE "unidades"
ADD CONSTRAINT "fk_unidade_tipo" FOREIGN KEY ("tipo_unidade_id") REFERENCES "tipo_de_unidade" ("id"),
ADD CONSTRAINT "fk_unidade_superintendencia" FOREIGN KEY ("superintendencia_id") REFERENCES "superintendencias" ("id") ON DELETE SET NULL;

CREATE INDEX "idx_unidades_tipo" ON "unidades" ("tipo_unidade_id");
CREATE INDEX "idx_unidades_super" ON "unidades" ("superintendencia_id");

-- Relacionamentos tipo_de_unidade (1:N)
ALTER TABLE "tipo_de_unidade"
ADD CONSTRAINT "fk_tipo_unidade_super" FOREIGN KEY ("superintendencia_id") REFERENCES "superintendencias" ("id") ON DELETE SET NULL;

CREATE INDEX "idx_tipo_unidade_super" ON "tipo_de_unidade" ("superintendencia_id");

-- Relacionamentos Indicador_Tipo_Unidade (N:N)
ALTER TABLE "indicador_tipo_unidade"
ADD CONSTRAINT "fk_itu_indicador" FOREIGN KEY ("indicador_id") REFERENCES "indicadores" ("id") ON DELETE CASCADE,
ADD CONSTRAINT "fk_itu_tipo" FOREIGN KEY ("tipo_unidade_id") REFERENCES "tipo_de_unidade" ("id") ON DELETE CASCADE;

CREATE INDEX "idx_itu_tipo_unidade" ON "indicador_tipo_unidade" ("tipo_unidade_id");

-- Relacionamentos Resultados
ALTER TABLE "resultados" 
ADD CONSTRAINT "fk_resultado_indicador" FOREIGN KEY ("indicador_id") REFERENCES "indicadores" ("id") ON DELETE CASCADE,
ADD CONSTRAINT "fk_resultado_unidade" FOREIGN KEY ("unidade_id") REFERENCES "unidades" ("id") ON DELETE CASCADE;

-- Chave única para evitar duplicidade no mesmo mês/indicador/unidade
CREATE UNIQUE INDEX "uk_resultado_competencia_unidade" ON "resultados" ("indicador_id", "competencia", "unidade_id");

-- Índices gerais para performance de busca
CREATE INDEX "idx_resultados_competencia" ON "resultados" ("competencia");
CREATE INDEX "idx_resultados_unidade" ON "resultados" ("unidade_id");