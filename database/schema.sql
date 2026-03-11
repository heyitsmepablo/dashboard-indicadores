-- ============================================================================
-- PREPARAÇÃO DO AMBIENTE
-- ============================================================================

-- Habilita a função de remover acentos
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Habilita geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para atualizar o timestamp de 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;   
END;
$$ language 'plpgsql';

-- ============================================================================
-- 1. ESTRUTURA DE TABELAS (CORE)
-- ============================================================================

CREATE TABLE "usuarios" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nome" VARCHAR(255) NOT NULL,
  "matricula" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "senha" VARCHAR(255) NOT NULL,
  "must_change_password" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  "superintendencia_id" INT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "unidades" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(255) NOT NULL,
  "sigla" VARCHAR(50),
  "cnes" VARCHAR(20) UNIQUE,           
  "uf" CHAR(2) DEFAULT 'MA',           
  "tipo_unidade_id" INT NOT NULL,
  "superintendencia_id" INT, 
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "coordenacoes" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(255) NOT NULL,
  "sigla" VARCHAR(50),
  "superintendencia_id" INT,
  "unidade_id" INT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Regra de Ouro: Garante vínculo exclusivo (Ou Super, ou Unidade)
  CONSTRAINT "check_vinculo_obrigatorio" CHECK (
    ("superintendencia_id" IS NOT NULL AND "unidade_id" IS NULL) OR 
    ("superintendencia_id" IS NULL AND "unidade_id" IS NOT NULL)
  )
);

-- ============================================================================
-- 2. INDICADORES E RESULTADOS
-- ============================================================================

CREATE TABLE "tipo_indicador"(
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(50) NOT NULL,
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
  "tipo_indicador_id" INT NOT NULL,
  "referencia_ministerial_sistema" VARCHAR(50) 
    CHECK (referencia_ministerial_sistema IN ('SIH', 'SIA_RESUMO', 'SIA_ESPECIALIDADE')),
  "referencia_ministerial_chave" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela associativa: Quais tipos de unidade respondem a quais tipos de indicadores
CREATE TABLE "tipo_unidade_tipo_indicador" (
  "tipo_indicador_id" INT NOT NULL,
  "tipo_unidade_id" INT NOT NULL,
  PRIMARY KEY ("tipo_indicador_id", "tipo_unidade_id")
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
-- 3. INTEGRAÇÃO DATASUS (PYSUS)
-- ============================================================================

CREATE TABLE "sih_registros" (
  "id" SERIAL PRIMARY KEY,
  "unidade_id" INT NOT NULL,
  "cnes" VARCHAR(20) NOT NULL,
  "ano" INT NOT NULL,
  "mes" INT NOT NULL,
  "n_aih" VARCHAR(50),
  "dados" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "sia_registros" (
  "id" SERIAL PRIMARY KEY,
  "unidade_id" INT NOT NULL,
  "cnes" VARCHAR(20) NOT NULL,
  "ano" INT NOT NULL,
  "mes" INT NOT NULL,
  "dados" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "datasus_sync_log" (
  "id" SERIAL PRIMARY KEY,
  "uf" CHAR(2) NOT NULL,
  "sistema" VARCHAR(10) NOT NULL,
  "ano" INT NOT NULL,
  "mes" INT NOT NULL,
  "data_sincronizacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("uf", "sistema", "ano", "mes")
);

-- ============================================================================
-- 4. ÍNDICES E RELACIONAMENTOS (FKs)
-- ============================================================================

-- Unidades
ALTER TABLE "unidades"
ADD CONSTRAINT "fk_unidade_tipo" FOREIGN KEY ("tipo_unidade_id") REFERENCES "tipo_de_unidade" ("id"),
ADD CONSTRAINT "fk_unidade_superintendencia" FOREIGN KEY ("superintendencia_id") REFERENCES "superintendencias" ("id") ON DELETE SET NULL;

CREATE INDEX "idx_unidades_tipo" ON "unidades" ("tipo_unidade_id");
CREATE INDEX "idx_unidades_super" ON "unidades" ("superintendencia_id");

-- Tipo de Unidade
ALTER TABLE "tipo_de_unidade"
ADD CONSTRAINT "fk_tipo_unidade_super" FOREIGN KEY ("superintendencia_id") REFERENCES "superintendencias" ("id") ON DELETE SET NULL;

-- Coordenações
ALTER TABLE "coordenacoes" 
ADD CONSTRAINT "fk_coord_superintendencia" FOREIGN KEY ("superintendencia_id") REFERENCES "superintendencias" ("id") ON DELETE CASCADE,
ADD CONSTRAINT "fk_coord_unidade" FOREIGN KEY ("unidade_id") REFERENCES "unidades" ("id") ON DELETE CASCADE;

CREATE INDEX "idx_coordenacoes_super" ON "coordenacoes" ("superintendencia_id");
CREATE INDEX "idx_coordenacoes_unidade" ON "coordenacoes" ("unidade_id");

-- Indicadores
ALTER TABLE "indicadores"
ADD CONSTRAINT "fk_ind_tipo_indicador" FOREIGN KEY ("tipo_indicador_id") REFERENCES "tipo_indicador"("id") ON DELETE CASCADE;

-- Tabela Associativa
ALTER TABLE "tipo_unidade_tipo_indicador"
ADD CONSTRAINT "fk_tuti_tipo_indicador" FOREIGN KEY ("tipo_indicador_id") REFERENCES "tipo_indicador" ("id") ON DELETE CASCADE,
ADD CONSTRAINT "fk_tuti_tipo_unidade" FOREIGN KEY ("tipo_unidade_id") REFERENCES "tipo_de_unidade" ("id") ON DELETE CASCADE;

-- Resultados
ALTER TABLE "resultados" 
ADD CONSTRAINT "fk_resultado_indicador" FOREIGN KEY ("indicador_id") REFERENCES "indicadores" ("id") ON DELETE CASCADE,
ADD CONSTRAINT "fk_resultado_unidade" FOREIGN KEY ("unidade_id") REFERENCES "unidades" ("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX "uk_resultado_competencia_unidade" ON "resultados" ("indicador_id", "competencia", "unidade_id");
CREATE INDEX "idx_resultados_competencia" ON "resultados" ("competencia");

-- Registros DATASUS
ALTER TABLE "sih_registros" ADD CONSTRAINT "fk_sih_unidade" FOREIGN KEY ("unidade_id") REFERENCES "unidades" ("id") ON DELETE CASCADE;
ALTER TABLE "sia_registros" ADD CONSTRAINT "fk_sia_unidade" FOREIGN KEY ("unidade_id") REFERENCES "unidades" ("id") ON DELETE CASCADE;

-- ============================================================================
-- 5. ATIVAÇÃO DOS TRIGGERS (AUTO-UPDATE)
-- ============================================================================

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER trg_update_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t);
    END LOOP;
END $$;