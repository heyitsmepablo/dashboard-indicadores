-- Arquivo: database/seeds/seed_tipo_de_unidade.sql

-- 1. Limpa a tabela
TRUNCATE TABLE "tipo_de_unidade" RESTART IDENTITY CASCADE;

-- 2. Importa via COPY
-- Ajuste o caminho '/tmp/tipo_de_unidade.csv' para onde o arquivo está no seu servidor/container
COPY "tipo_de_unidade" (id, nome)
FROM '/tmp/seeds/tipo_de_unidade.csv'
DELIMITER ','
CSV HEADER;

-- 3. Ajusta a sequência (Sequence Reset)
-- Como inserimos IDs manualmente, precisamos dizer ao Postgres onde parou
SELECT setval('tipo_de_unidade_id_seq', (SELECT MAX(id) FROM "tipo_de_unidade"));