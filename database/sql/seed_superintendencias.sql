-- Arquivo: database/seeds/01_seed_superintendencias.sql

-- 1. Limpa a tabela
TRUNCATE TABLE "superintendencias" RESTART IDENTITY CASCADE;

-- 2. Importa do CSV
COPY "superintendencias" (id, nome, sigla)
FROM '/tmp/seeds/superintendencias.csv'
WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ENCODING 'UTF8');

-- 3. Ajusta a sequência
SELECT setval('superintendencias_id_seq', (SELECT MAX(id) FROM "superintendencias"));