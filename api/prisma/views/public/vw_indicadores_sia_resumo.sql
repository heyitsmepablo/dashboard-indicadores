SELECT
  unidade_id,
  cnes,
  ano,
  mes,
  sum(((dados ->> 'PA_QTDPRO' :: text)) :: numeric) AS quantidade_produzida,
  sum(((dados ->> 'PA_QTDAPR' :: text)) :: numeric) AS quantidade_aprovada,
  round(
    (
      (
        (
          sum(((dados ->> 'PA_QTDPRO' :: text)) :: numeric) - sum(((dados ->> 'PA_QTDAPR' :: text)) :: numeric)
        ) / NULLIF(
          sum(((dados ->> 'PA_QTDPRO' :: text)) :: numeric),
          (0) :: numeric
        )
      ) * (100) :: numeric
    ),
    2
  ) AS indice_glosa_ambulatorial,
  sum(((dados ->> 'PA_VALPRO' :: text)) :: numeric) AS valor_produzido,
  sum(((dados ->> 'PA_VALAPR' :: text)) :: numeric) AS faturamento_total_sia
FROM
  sia_registros
GROUP BY
  unidade_id,
  cnes,
  ano,
  mes;