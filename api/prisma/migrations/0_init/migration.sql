-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "indicadores" (
    "id" SERIAL NOT NULL,
    "setor" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "fonte_formula" TEXT,
    "meta" TEXT,
    "unidade_de_medida" VARCHAR(50) NOT NULL DEFAULT 'ABSOLUTO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados" (
    "id" SERIAL NOT NULL,
    "indicador_id" INTEGER NOT NULL,
    "competencia" DATE NOT NULL,
    "valor" DECIMAL(15,2),
    "valor_texto" TEXT,
    "analise_critica" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_indicadores_setor" ON "indicadores"("setor");

-- CreateIndex
CREATE INDEX "idx_resultados_data" ON "resultados"("competencia");

-- CreateIndex
CREATE UNIQUE INDEX "uk_resultado_competencia" ON "resultados"("indicador_id", "competencia");

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "fk_indicador" FOREIGN KEY ("indicador_id") REFERENCES "indicadores"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

