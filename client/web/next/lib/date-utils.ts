export const parseYYYYMM = (val: string): number => {
  if (!val) return 0;
  const [y, m] = val.split("-");
  return parseInt(y) * 12 + parseInt(m);
};

export const formatYYYYMM = (total: number): string => {
  const y = Math.floor((total - 1) / 12);
  const m = ((total - 1) % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
};

export const getAvailableDates = (
  resultados: { competencia: string }[],
): string[] => {
  return Array.from(
    new Set(resultados.map((r) => r.competencia.slice(0, 7))),
  ).sort();
};
