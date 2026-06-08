export const OPERA_STATUS: Record<string, { label: string; color: string }> = {
  in_corso: { label: "In corso", color: "teal" },
  completata: { label: "Completata", color: "green" },
  pianificata: { label: "Pianificata", color: "viola" },
  sospesa: { label: "Sospesa", color: "amber" },
};

export const OPERA_CATEGORY: Record<string, string> = {
  scuola: "Scuola",
  mobilita: "Mobilità",
  piazza: "Piazza",
  restauro: "Restauro",
  verde: "Verde urbano",
  sociale: "Sicurezza",
};

export function operaStatus(s: string) {
  return OPERA_STATUS[s] ?? { label: s, color: "teal" };
}

export function operaCategory(c: string) {
  return OPERA_CATEGORY[c] ?? c;
}

export const POST_CATEGORY: Record<string, { label: string; color: string }> = {
  verde: { label: "Verde", color: "green" },
  mobilita: { label: "Mobilità", color: "viola" },
  servizi: { label: "Servizi", color: "teal" },
  cultura: { label: "Cultura", color: "amber" },
};

export function postCategory(c: string | null | undefined) {
  if (!c) return null;
  return POST_CATEGORY[c] ?? { label: c, color: "teal" };
}
