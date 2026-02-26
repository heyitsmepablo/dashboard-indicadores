-- Arquivo: database/seeds/05_seed_indicador_tipo_unidade.sql

-- 1. Limpa a tabela intermediária
TRUNCATE TABLE "indicador_tipo_unidade" CASCADE;

-- 2. Importa os vínculos reais do CSV
COPY "indicador_tipo_unidade" (indicador_id, tipo_unidade_id)
FROM '/tmp/seeds/indicador_tipo_unidade.csv'
WITH (
    FORMAT CSV,
    HEADER true,
    DELIMITER ',',
    QUOTE '"',
    ENCODING 'UTF8'
);