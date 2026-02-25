-- Arquivo: database/import_seeds.sql

TRUNCATE TABLE indicadores RESTART IDENTITY CASCADE;

-- Importa do caminho seguro /tmp/seeds
COPY indicadores(setor, descricao, fonte_formula, unidade_de_medida)
FROM '/tmp/seeds/tabela_indicadores.csv'
WITH (
    FORMAT CSV,
    HEADER true,
    DELIMITER ',',
    QUOTE '"',
    ENCODING 'UTF8'
);

