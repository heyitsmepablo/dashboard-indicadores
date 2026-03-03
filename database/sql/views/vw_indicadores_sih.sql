CREATE OR REPLACE VIEW vw_indicadores_sih AS
SELECT 
    unidade_id,
    cnes,
    ano,
    mes,
    COUNT(id) AS total_internacoes,
    
    SUM(CASE WHEN dados->>'MORTE' = '1' THEN 1 ELSE 0 END) AS total_obitos,
    ROUND(
        (SUM(CASE WHEN dados->>'MORTE' = '1' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(id), 0)) * 100, 2
    ) AS taxa_mortalidade_institucional,
    
    ROUND(AVG((dados->>'DIAS_PERM')::numeric), 2) AS media_permanencia_dias,
    
    SUM(
        CASE WHEN substring(dados->>'DIAG_PRINC' from 1 for 3) IN (
            'A15', 'A16', 'A37', 'A50', 'B50', 'B54', 'E10', 'E11', 'E12', 'E13', 'E14', 
            'E40', 'E41', 'E42', 'E43', 'E44', 'E45', 'E46', 'E50', 'E64', 'G40', 'G41', 
            'I10', 'I11', 'I20', 'I50', 'J00', 'J01', 'J02', 'J03', 'J06', 'J13', 'J14', 
            'J15', 'J18', 'J20', 'J21', 'J41', 'J42', 'J43', 'J44', 'J45', 'J46', 'N39', 
            'N70', 'N71', 'N72', 'N73', 'O23', 'A00', 'A01', 'A02', 'A03', 'A04', 'A05', 
            'A06', 'A07', 'A08', 'A09'
        ) THEN 1 ELSE 0 END
    ) AS total_icsap,
    ROUND(
        (SUM(
            CASE WHEN substring(dados->>'DIAG_PRINC' from 1 for 3) IN (
                'A15', 'A16', 'A37', 'A50', 'B50', 'B54', 'E10', 'E11', 'E12', 'E13', 'E14', 
                'E40', 'E41', 'E42', 'E43', 'E44', 'E45', 'E46', 'E50', 'E64', 'G40', 'G41', 
                'I10', 'I11', 'I20', 'I50', 'J00', 'J01', 'J02', 'J03', 'J06', 'J13', 'J14', 
                'J15', 'J18', 'J20', 'J21', 'J41', 'J42', 'J43', 'J44', 'J45', 'J46', 'N39', 
                'N70', 'N71', 'N72', 'N73', 'O23', 'A00', 'A01', 'A02', 'A03', 'A04', 'A05', 
                'A06', 'A07', 'A08', 'A09'
            ) THEN 1 ELSE 0 END
        )::numeric / NULLIF(COUNT(id), 0)) * 100, 2
    ) AS proporcao_icsap,

    SUM((dados->>'VAL_TOT')::numeric) AS faturamento_total_sih,
    ROUND(SUM((dados->>'VAL_TOT')::numeric) / NULLIF(COUNT(id), 0), 2) AS ticket_medio_internacao,

    SUM(CASE WHEN dados->>'MARCA_UTI' != '00' THEN 1 ELSE 0 END) AS internacoes_uti,
    SUM(CASE WHEN dados->>'MORTE' = '1' AND dados->>'MARCA_UTI' != '00' THEN 1 ELSE 0 END) AS obitos_uti,
    ROUND(
        (SUM(CASE WHEN dados->>'MORTE' = '1' AND dados->>'MARCA_UTI' != '00' THEN 1 ELSE 0 END)::numeric / 
         NULLIF(SUM(CASE WHEN dados->>'MARCA_UTI' != '00' THEN 1 ELSE 0 END), 0)) * 100, 2
    ) AS proporcao_obitos_uti

FROM sih_registros
GROUP BY unidade_id, cnes, ano, mes;