-- 1. Limpa resultados antigos
TRUNCATE TABLE "resultados" RESTART IDENTITY CASCADE;

-- 2. Função Geradora
CREATE OR REPLACE FUNCTION popular_resultados_por_unidade() RETURNS void AS $$
DECLARE
    reg_unidade RECORD;
    reg_indicador RECORD;
    data_competencia DATE;
    valor_base NUMERIC;
    valor_final NUMERIC;
    fator_unidade NUMERIC;
    variacao_mensal NUMERIC;
    texto_analise TEXT;
    mes INTEGER;
    sars_id INTEGER;
    textos_analise TEXT[] := ARRAY[
        'Houve um aumento no volume de atendimentos devido à sazonalidade típica do período.',
        'Queda nos números justificada pela falta temporária de insumos na segunda quinzena.',
        'Meta atingida após implementação do novo protocolo de triagem rápida.',
        'Afastamento de profissionais médicos por atestado impactou negativamente o indicador.',
        'Necessário revisar a escala de plantão para o próximo ciclo para melhorar este índice.',
        'Resultado satisfatório, mantendo a média histórica da unidade com folga.',
        'Pico de demanda devido a surto viral na região atendida pela unidade.',
        'Melhoria contínua observada após treinamento da equipe de enfermagem.'
    ];
BEGIN
    -- Pega o ID da Superintendência SARS
    SELECT id INTO sars_id FROM "superintendencias" WHERE sigla = 'SARS' LIMIT 1;

    -- Se não achar a SARS, cancela a execução para evitar erros
    IF sars_id IS NULL THEN
        RAISE NOTICE 'Superintendência SARS não encontrada.';
        RETURN;
    END IF;

    -- Itera sobre as unidades vinculadas à SARS de forma direta (na unidade) OU indireta (no tipo da unidade)
    FOR reg_unidade IN 
        SELECT u.* FROM "unidades" u
        LEFT JOIN "tipo_de_unidade" t ON u.tipo_unidade_id = t.id
        WHERE u.superintendencia_id = sars_id OR t.superintendencia_id = sars_id
        ORDER BY u.id 
    LOOP
        
        -- Define um "perfil" para a unidade (ex: hospitais maiores têm números maiores)
        fator_unidade := 0.8 + (random() * 0.4);

        -- Itera APENAS sobre os INDICADORES vinculados ao TIPO desta unidade
        FOR reg_indicador IN 
            SELECT i.* FROM "indicadores" i
            JOIN "indicador_tipo_unidade" itu ON i.id = itu.indicador_id
            WHERE itu.tipo_unidade_id = reg_unidade.tipo_unidade_id
            ORDER BY i.id 
        LOOP

            -- 15% de chance de NÃO gerar resultados para este indicador nesta unidade
            -- Simulando que o indicador pertence ao grupo, mas a unidade não preencheu/não monitora
            IF random() < 0.15 THEN
                CONTINUE;
            END IF;

            -- Define o Valor Base dependendo do tipo de indicador
            IF reg_indicador.unidade_de_medida IN ('PERCENTUAL', 'TAXA') THEN
                IF reg_indicador.descricao ILIKE '%mortalidade%' THEN valor_base := 2.5;
                ELSIF reg_indicador.descricao ILIKE '%satisfação%' THEN valor_base := 90.0;
                ELSE valor_base := 60.0; END IF;
            
            ELSIF reg_indicador.unidade_de_medida = 'FINANCEIRO' THEN
                valor_base := 50000 * fator_unidade;

            ELSE -- ABSOLUTO
                valor_base := 200 * fator_unidade;
            END IF;

            -- Gera 12 meses de histórico (Janeiro a Dezembro de 2025)
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

                -- 20% de chance de gerar uma análise crítica para aquele mês específico
                texto_analise := NULL;
                IF random() < 0.20 THEN 
                    texto_analise := textos_analise[1 + floor(random() * array_length(textos_analise, 1))]; 
                END IF;

                -- Insere o resultado
                INSERT INTO "resultados" (indicador_id, unidade_id, competencia, valor, analise_critica)
                VALUES (reg_indicador.id, reg_unidade.id, data_competencia, valor_final, texto_analise);
            END LOOP;

        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Executa e Limpa a função
SELECT popular_resultados_por_unidade();
DROP FUNCTION popular_resultados_por_unidade();