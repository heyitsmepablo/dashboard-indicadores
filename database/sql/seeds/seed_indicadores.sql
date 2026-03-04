-- Arquivo: database/seeds/04_seed_indicadores.sql

TRUNCATE TABLE "indicadores" RESTART IDENTITY CASCADE;

COPY "indicadores" (id, descricao, fonte_formula, unidade_de_medida,meta,referencia_ministerial_sistema,referencia_ministerial_chave)
FROM '/tmp/seeds/tabela_indicadores_meta.csv'
WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ENCODING 'UTF8');

SELECT setval('indicadores_id_seq', (SELECT MAX(id) FROM "indicadores"));