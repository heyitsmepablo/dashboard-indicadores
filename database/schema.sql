ALTER DATABASE "postgres" SET lc_numeric = 'pt_BR.utf8';
ALTER DATABASE "postgres" SET lc_monetary = 'pt_BR.utf8';
ALTER DATABASE "postgres" SET lc_collate = 'pt_BR.utf8';
ALTER DATABASE "postgres" SET lc_ctype = 'pt_BR.utf8';
ALTER DATABASE "postgres" SET timezone = 'America/Sao_Paulo';

CREATE TABLE "indicadores" (
  "id" SERIAL PRIMARY KEY,
  "setor" "VARCHAR(100)" NOT NULL,
  "descricao" TEXT NOT NULL,
  "fonte_formula" TEXT,
  "meta" TEXT,
  "unidade_de_medida" "VARCHAR(50)" NOT NULL CHECK (unidade_de_medida IN (
        'ABSOLUTO',    -- Ex: 150 (pacientes, partos, consultas)
        'PERCENTUAL',  -- Ex: 85.5 (para 85,5%)
        'FINANCEIRO',  -- Ex: 1500.00 (para R$ 1.500,00)
        'TEMPO_DIAS',  -- Ex: 5 (dias de internação)
        'TEMPO_HORAS', -- Ex: 12 (horas de espera)
        'TAXA',        -- Ex: 2.5 (infecções por 1000 dias)
        'TEXTO'        -- Ex: 'SIM' / 'NÃO' / 'Adequado'
    )) DEFAULT 'ABSOLUTO',
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "resultados" (
  "id" SERIAL PRIMARY KEY,
  "indicador_id" INT NOT NULL,
  "competencia" DATE NOT NULL,
  "valor" NUMERIC(15,2),
  "valor_texto" TEXT,
  "analise_critica" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX "uk_resultado_competencia" ON "resultados" ("indicador_id", "competencia");

ALTER TABLE "resultados" ADD CONSTRAINT "fk_indicador" FOREIGN KEY ("indicador_id") REFERENCES "indicadores" ("id") ON DELETE CASCADE;