-- Arquivo: database/seeds/03_seed_unidades.sql

TRUNCATE TABLE "unidades" RESTART IDENTITY CASCADE;

COPY "unidades" (nome, sigla, tipo_unidade_id,cnes)
FROM '/tmp/seeds/unidades.csv'
WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ENCODING 'UTF8');