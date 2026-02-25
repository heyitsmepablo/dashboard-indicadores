-- Arquivo: database/seeds/seed_unidades.sql

-- 1. Limpa a tabela
TRUNCATE TABLE "unidades" RESTART IDENTITY CASCADE;

-- 2. Importa via COPY especificando as colunas
-- O ID será gerado automaticamente pelo banco
COPY "unidades" (nome, sigla, tipo_unidade_id)
FROM '/tmp/seeds/unidades.csv'
DELIMITER ','
CSV HEADER;

-- Não é necessário ajustar sequência aqui, pois o autoincrement foi usado nativamente.