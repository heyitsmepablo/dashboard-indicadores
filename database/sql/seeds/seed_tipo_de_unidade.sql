-- Arquivo: database/seeds/02_seed_tipo_de_unidade.sql

TRUNCATE TABLE "tipo_de_unidade" RESTART IDENTITY CASCADE;

COPY "tipo_de_unidade" (id, nome, superintendencia_id)
FROM '/tmp/seeds/tipo_de_unidade.csv'
DELIMITER ','
CSV HEADER;

SELECT setval('tipo_de_unidade_id_seq', (SELECT MAX(id) FROM "tipo_de_unidade"));