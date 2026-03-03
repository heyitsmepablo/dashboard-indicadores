CREATE OR REPLACE VIEW vw_indicadores_sia_especialidades AS
SELECT 
    unidade_id,
    cnes,
    ano,
    mes,
    -- O COALESCE garante que se não vier CBO no JSON, ele preenche com 'N/I', evitando erros no Prisma
    COALESCE(dados->>'PA_CBOCOP', 'N/I') AS cbo_profissional,
    
    SUM((dados->>'PA_QTDPRO')::numeric) AS qtd_procedimentos_apresentados,
    SUM((dados->>'PA_QTDAPR')::numeric) AS qtd_procedimentos_aprovados,
    SUM((dados->>'PA_VALAPR')::numeric) AS faturamento_gerado
    
FROM sia_registros
GROUP BY unidade_id, cnes, ano, mes, COALESCE(dados->>'PA_CBOCOP', 'N/I');