SELECT
  unidade_id,
  cnes,
  ano,
  mes,
  COALESCE((dados ->> 'PA_CBOCOP' :: text), 'N/I' :: text) AS cbo_profissional,
  sum(((dados ->> 'PA_QTDPRO' :: text)) :: numeric) AS qtd_procedimentos_apresentados,
  sum(((dados ->> 'PA_QTDAPR' :: text)) :: numeric) AS qtd_procedimentos_aprovados,
  sum(((dados ->> 'PA_VALAPR' :: text)) :: numeric) AS faturamento_gerado
FROM
  sia_registros
GROUP BY
  unidade_id,
  cnes,
  ano,
  mes,
  COALESCE((dados ->> 'PA_CBOCOP' :: text), 'N/I' :: text);