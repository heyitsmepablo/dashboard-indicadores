-- Arquivo: database/import_data.sql

-- Limpa a tabela antes de importar (opcional, para evitar duplicatas em testes)
TRUNCATE TABLE indicadores RESTART IDENTITY CASCADE;

-- Importa o CSV
-- Nota: O caminho '/data/seeds/...' depende de como seu banco enxerga o arquivo.
-- Se estiver usando Docker, esse é o caminho dentro do container.
COPY indicadores(setor, descricao, fonte_formula, unidade_de_medida)
FROM '/var/lib/postgresql/data/seeds/tabela_indicadores_final_revisada.csv'
WITH (
    FORMAT CSV,
    HEADER true,
    DELIMITER ',',
    QUOTE '"',
    ENCODING 'UTF8'
);