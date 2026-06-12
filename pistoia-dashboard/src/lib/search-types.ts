// Tipi e label condivisi tra il data layer della ricerca (server-only) e la
// palette client (Cmd+K). Pure data: importabile ovunque.

export type SearchResultType =
  | "report"
  | "proposal"
  | "opera"
  | "event"
  | "poll"
  | "neighborhood"
  | "decision"
  | "commitment"
  | "notice"
  | "faq";

export type SearchResult = {
  type: SearchResultType;
  id: string;
  title: string;
  /** Riga secondaria: categoria/stato già etichettati per la UI. */
  subtitle: string | null;
  href: string;
};

export const SEARCH_GROUP_LABEL: Record<SearchResultType, string> = {
  report: "Segnalazioni",
  proposal: "Proposte",
  opera: "Opere pubbliche",
  event: "Eventi",
  poll: "Sondaggi e consultazioni",
  neighborhood: "Quartieri e frazioni",
  decision: "Decisioni del Comune",
  commitment: "Promesse e risultati",
  notice: "Avvisi urgenti",
  faq: "FAQ della città",
};
