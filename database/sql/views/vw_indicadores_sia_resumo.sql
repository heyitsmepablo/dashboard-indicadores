CREATE OR REPLACE VIEW vw_indicadores_sia_resumo AS
SELECT 
    unidade_id,
    cnes,
    ano,
    mes,
    
    SUM((dados->>'PA_QTDPRO')::numeric) AS quantidade_produzida,
    SUM((dados->>'PA_QTDAPR')::numeric) AS quantidade_aprovada,

    ROUND(
        ((SUM((dados->>'PA_QTDPRO')::numeric) - SUM((dados->>'PA_QTDAPR')::numeric)) / 
         NULLIF(SUM((dados->>'PA_QTDPRO')::numeric), 0)) * 100, 2
    ) AS indice_glosa_ambulatorial,

    SUM((dados->>'PA_VALPRO')::numeric) AS valor_produzido,
    SUM((dados->>'PA_VALAPR')::numeric) AS faturamento_total_sia
    
FROM sia_registros
GROUP BY unidade_id, cnes, ano, mes;