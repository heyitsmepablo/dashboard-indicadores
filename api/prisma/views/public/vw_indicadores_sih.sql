SELECT
  unidade_id,
  cnes,
  ano,
  mes,
  count(id) AS total_internacoes,
  sum(
    CASE
      WHEN ((dados ->> 'MORTE' :: text) = '1' :: text) THEN 1
      ELSE 0
    END
  ) AS total_obitos,
  round(
    (
      (
        (
          sum(
            CASE
              WHEN ((dados ->> 'MORTE' :: text) = '1' :: text) THEN 1
              ELSE 0
            END
          )
        ) :: numeric / (NULLIF(count(id), 0)) :: numeric
      ) * (100) :: numeric
    ),
    2
  ) AS taxa_mortalidade_institucional,
  round(avg(((dados ->> 'DIAS_PERM' :: text)) :: numeric), 2) AS media_permanencia_dias,
  sum(
    CASE
      WHEN (
        SUBSTRING(
          (dados ->> 'DIAG_PRINC' :: text)
          FROM
            1 FOR 3
        ) = ANY (
          ARRAY ['A15'::text, 'A16'::text, 'A37'::text, 'A50'::text, 'B50'::text, 'B54'::text, 'E10'::text, 'E11'::text, 'E12'::text, 'E13'::text, 'E14'::text, 'E40'::text, 'E41'::text, 'E42'::text, 'E43'::text, 'E44'::text, 'E45'::text, 'E46'::text, 'E50'::text, 'E64'::text, 'G40'::text, 'G41'::text, 'I10'::text, 'I11'::text, 'I20'::text, 'I50'::text, 'J00'::text, 'J01'::text, 'J02'::text, 'J03'::text, 'J06'::text, 'J13'::text, 'J14'::text, 'J15'::text, 'J18'::text, 'J20'::text, 'J21'::text, 'J41'::text, 'J42'::text, 'J43'::text, 'J44'::text, 'J45'::text, 'J46'::text, 'N39'::text, 'N70'::text, 'N71'::text, 'N72'::text, 'N73'::text, 'O23'::text, 'A00'::text, 'A01'::text, 'A02'::text, 'A03'::text, 'A04'::text, 'A05'::text, 'A06'::text, 'A07'::text, 'A08'::text, 'A09'::text]
        )
      ) THEN 1
      ELSE 0
    END
  ) AS total_icsap,
  round(
    (
      (
        (
          sum(
            CASE
              WHEN (
                SUBSTRING(
                  (dados ->> 'DIAG_PRINC' :: text)
                  FROM
                    1 FOR 3
                ) = ANY (
                  ARRAY ['A15'::text, 'A16'::text, 'A37'::text, 'A50'::text, 'B50'::text, 'B54'::text, 'E10'::text, 'E11'::text, 'E12'::text, 'E13'::text, 'E14'::text, 'E40'::text, 'E41'::text, 'E42'::text, 'E43'::text, 'E44'::text, 'E45'::text, 'E46'::text, 'E50'::text, 'E64'::text, 'G40'::text, 'G41'::text, 'I10'::text, 'I11'::text, 'I20'::text, 'I50'::text, 'J00'::text, 'J01'::text, 'J02'::text, 'J03'::text, 'J06'::text, 'J13'::text, 'J14'::text, 'J15'::text, 'J18'::text, 'J20'::text, 'J21'::text, 'J41'::text, 'J42'::text, 'J43'::text, 'J44'::text, 'J45'::text, 'J46'::text, 'N39'::text, 'N70'::text, 'N71'::text, 'N72'::text, 'N73'::text, 'O23'::text, 'A00'::text, 'A01'::text, 'A02'::text, 'A03'::text, 'A04'::text, 'A05'::text, 'A06'::text, 'A07'::text, 'A08'::text, 'A09'::text]
                )
              ) THEN 1
              ELSE 0
            END
          )
        ) :: numeric / (NULLIF(count(id), 0)) :: numeric
      ) * (100) :: numeric
    ),
    2
  ) AS proporcao_icsap,
  sum(((dados ->> 'VAL_TOT' :: text)) :: numeric) AS faturamento_total_sih,
  round(
    (
      sum(((dados ->> 'VAL_TOT' :: text)) :: numeric) / (NULLIF(count(id), 0)) :: numeric
    ),
    2
  ) AS ticket_medio_internacao,
  sum(
    CASE
      WHEN ((dados ->> 'MARCA_UTI' :: text) <> '00' :: text) THEN 1
      ELSE 0
    END
  ) AS internacoes_uti,
  sum(
    CASE
      WHEN (
        ((dados ->> 'MORTE' :: text) = '1' :: text)
        AND ((dados ->> 'MARCA_UTI' :: text) <> '00' :: text)
      ) THEN 1
      ELSE 0
    END
  ) AS obitos_uti,
  round(
    (
      (
        (
          sum(
            CASE
              WHEN (
                ((dados ->> 'MORTE' :: text) = '1' :: text)
                AND ((dados ->> 'MARCA_UTI' :: text) <> '00' :: text)
              ) THEN 1
              ELSE 0
            END
          )
        ) :: numeric / (
          NULLIF(
            sum(
              CASE
                WHEN ((dados ->> 'MARCA_UTI' :: text) <> '00' :: text) THEN 1
                ELSE 0
              END
            ),
            0
          )
        ) :: numeric
      ) * (100) :: numeric
    ),
    2
  ) AS proporcao_obitos_uti
FROM
  sih_registros
GROUP BY
  unidade_id,
  cnes,
  ano,
  mes;