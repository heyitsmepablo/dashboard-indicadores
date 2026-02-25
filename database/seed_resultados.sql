-- Arquivo: database/seeds/seed_resultados.sql

-- 1. Limpa resultados antigos
TRUNCATE TABLE "resultados" RESTART IDENTITY CASCADE;

-- 2. Função Geradora
CREATE OR REPLACE FUNCTION popular_resultados_por_unidade() RETURNS void AS $$
DECLARE
    reg_indicador RECORD;
    reg_unidade RECORD;
    data_competencia DATE;
    valor_base NUMERIC;
    valor_final NUMERIC;
    fator_unidade NUMERIC;
    variacao_mensal NUMERIC;
    texto_analise TEXT;
    mes INTEGER;
BEGIN
    -- Itera sobre cada UNIDADE importada do CSV
    FOR reg_unidade IN SELECT * FROM "unidades" ORDER BY id LOOP
        
        -- Define um "perfil" para a unidade (ex: hospitais maiores têm números maiores)
        -- Gera um fator entre 0.8 e 1.2
        fator_unidade := 0.8 + (random() * 0.4);

        -- Itera sobre cada INDICADOR
        FOR reg_indicador IN SELECT * FROM "indicadores" ORDER BY id LOOP

            -- Define o Valor Base dependendo do tipo de indicador
            IF reg_indicador.unidade_de_medida IN ('PERCENTUAL', 'TAXA') THEN
                IF reg_indicador.descricao ILIKE '%mortalidade%' THEN valor_base := 2.5;
                ELSIF reg_indicador.descricao ILIKE '%satisfação%' THEN valor_base := 90.0;
                ELSE valor_base := 60.0; END IF;
            
            ELSIF reg_indicador.unidade_de_medida = 'FINANCEIRO' THEN
                valor_base := 50000 * fator_unidade; -- Unidades maiores faturam mais

            ELSE -- ABSOLUTO
                valor_base := 200 * fator_unidade;
            END IF;

            -- Gera 12 meses de histórico
            FOR mes IN 1..12 LOOP
                data_competencia := make_date(2025, mes, 1);
                variacao_mensal := 0.9 + (random() * 0.2); -- +/- 10%
                
                valor_final := valor_base * variacao_mensal;

                -- Ajustes finos
                IF reg_indicador.unidade_de_medida IN ('PERCENTUAL', 'TAXA') AND valor_final > 100 THEN 
                    valor_final := 100; 
                END IF;
                
                IF reg_indicador.unidade_de_medida = 'ABSOLUTO' THEN 
                    valor_final := floor(valor_final); 
                END IF;

                -- Gera análise crítica aleatória
                texto_analise := NULL;
                IF (random() > 0.85) THEN texto_analise := 'Variação atípica analisada.'; END IF;

                -- Insere o resultado vinculado à UNIDADE e ao INDICADOR
                INSERT INTO "resultados" (indicador_id, unidade_id, competencia, valor, analise_critica)
                VALUES (reg_indicador.id, reg_unidade.id, data_competencia, valor_final, texto_analise);
            END LOOP;

        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Executa e Limpa
SELECT popular_resultados_por_unidade();
DROP FUNCTION popular_resultados_por_unidade();