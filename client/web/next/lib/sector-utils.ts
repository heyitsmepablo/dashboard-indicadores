import { Unidade } from "./types";

// Normaliza: Remove acentos, passa para minúsculo e remove espaços extras
function normalize(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim();
}

/**
 * Mapeamento Explícito:
 * Chave (Parte do nome do Setor Normalizada) -> Lista de Nomes de Tipos de Unidade (Exatos do Banco)
 */
const MAPA_SETOR_TIPO: Record<string, string[]> = {
  // Mapeamentos Gerais
  hospital: ["Hospital"],
  urgencia: ["Pronto Socorro", "Samu", "Unidade Mista"],
  mental: ["Ambulatório de Saúde Mental", "Residência Terapêutica"],
  especializada: ["Ambulatório", "Centro de Especialidades", "Policlínica"],
  samu: ["Samu"],
  administrativo: ["Secretaria", "Sede"],
  maternidade: ["Maternidade", "Centro de Parto"],

  // CORREÇÃO ESPECÍFICA PARA UNIDADE MISTA
  // Cobre "Unidade Mista", "Unidades Mistas", "Mista"
  mista: ["Unidade Mista"],
  "unidade mista": ["Unidade Mista"],

  // Outros casos comuns
  parto: ["Centro de Parto", "Maternidade"],
  caps: ["Caps"],
  externa: ["Externa"],
  secretaria: ["Secretaria"],
};

export function filtrarUnidadesPorSetor(
  setor: string,
  todasUnidades: Unidade[],
): Unidade[] {
  if (!setor) return [];

  const setorNorm = normalize(setor);

  // REGRA 1: "Compilados" mostra tudo
  if (setorNorm === "compilados") {
    return todasUnidades;
  }

  let tiposPermitidos: string[] = [];

  // REGRA 2: Busca no Mapa Explícito
  // Verifica se alguma palavra chave do mapa está contida no nome do setor
  for (const [chave, tipos] of Object.entries(MAPA_SETOR_TIPO)) {
    if (setorNorm.includes(chave)) {
      tiposPermitidos = [...tiposPermitidos, ...tipos];
    }
  }

  // Se encontrou mapeamentos explícitos, filtra por eles
  if (tiposPermitidos.length > 0) {
    // Remove duplicatas dos tipos permitidos
    const unicos = [...new Set(tiposPermitidos)];

    return todasUnidades.filter((u) => {
      // O nome do tipo vem do banco (ex: "Unidade Mista")
      // Verificamos se ele está na lista permitida
      return u.tipo_de_unidade?.nome && unicos.includes(u.tipo_de_unidade.nome);
    });
  }

  // REGRA 3: Tentativa de Match Automático (Fallback)
  // Útil se o setor for exatamente igual ao tipo, ex: Setor "Samu" -> Tipo "Samu"
  // Normaliza o tipo da unidade também para comparar
  return todasUnidades.filter((u) => {
    const nomeTipo = u.tipo_de_unidade?.nome;
    if (!nomeTipo) return false;

    const tipoNorm = normalize(nomeTipo);

    // Verifica containcia mútua: "unidade mista" contém "mista" ou vice-versa
    // Também checa singular/plural simplificado removendo o 's' final
    const matchSimples =
      setorNorm.includes(tipoNorm) || tipoNorm.includes(setorNorm);
    const matchSingular = setorNorm
      .replace(/s$/, "")
      .includes(tipoNorm.replace(/s$/, ""));

    return matchSimples || matchSingular;
  });
}
