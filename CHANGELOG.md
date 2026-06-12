# Changelog — Dashboard di Pistoia

> Tutte le modifiche rilevanti del progetto, in ordine cronologico inverso.
> Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/); le versioni seguono
> [SemVer](https://semver.org/lang/it/) in fase 0.x (demo mock, nessuna API pubblica stabile).
> Il dettaglio tecnico di ogni voce è in [DOCUMENTATION.md §10](DOCUMENTATION.md); il piano è in [ROADMAP.md](ROADMAP.md).

## [0.7.0] — 2026-06-12 · Ondata 0 «Fondamenta visive & design system»

### Aggiunto
- **DESIGN.md**: direzione estetica formalizzata (carattere istituzionale toscano, tre motivi identitari — scacchiera, fasce romaniche, città verde — tipografia a due voci, regole di colore/motion/data-viz, tema scuro, Sì/No).
- Tipografia display **Fraunces** (titoli e numeri protagonisti) accanto a Plus Jakarta Sans.
- Utility identitarie CSS: `.bande-romaniche`, `.scacchiera`, `.divider-bande`.
- Motion system: View Transitions sulle navigazioni, `.page-enter`, `.stagger`, `.pulse-civico`, easing `--ease-out-civic`.
- **EmptyState** illustrato (arco romanico + scacchiera) adottato in segnalazioni, proposte, eventi, comunità e notifiche.
- **Centro notifiche 2.0**: filtri per tema, raggruppamento Oggi / Questa settimana / Più vecchie, azione inline "segna come letta".
- **Command palette 2.0**: oltre la ricerca, comandi diretti (tema chiaro/scuro, avvio presentazione).
- **Tour demo guidato** in 9 passi: la piattaforma si presenta da sola (scheda non modale, naviga tra le pagine).
- **Treemap squarified** della spesa per missione nel bilancio, con elenco testuale alternativo.
- Roadmap riscritta come documento professionale: visione, obiettivi OB-1…OB-5, tag di livello su ogni idea, 18 proposte nuove, regole di prodotto n. 8 (design) e n. 9 (sponsor); pianificata «Vetrina aziende & sponsorizzazioni» (O5).

### Modificato
- Tema scuro rifinito: `color-scheme`, bagliori d'angolo più intensi di sera (`--glow-alpha`).
- Titoli di pagina (SectionHeader), statistiche (Stat) e hero del bilancio in Fraunces.

### Verificato
- `tsc` pulito · eslint 0 problemi · Vitest 47/47 · Playwright 5/5 · `next build` ok.

## [0.6.0] — 2026-06-11 · Ondata 2 «Semplicità & profilo civico»

### Aggiunto
- **Ricerca globale Ctrl/Cmd+K** (combobox accessibile) su segnalazioni, proposte, opere, eventi, sondaggi e quartieri.
- Home **"La mia città"** ridisegnata a percorsi guidati ("Cosa vuoi fare?").
- **Preferenze civiche**: 12 temi, feed personalizzato "Per te" con motivazione visibile.
- **Civic ID Card** e "Il mio impatto civico" nel profilo.
- **Modalità semplice** (cookie server-side, font 115 %, home a 4 azioni).
- **Wizard proposte** in 5 passi + gruppi di cittadini beneficiari.
- **Valutazione sintetica** delle proposte da parte dello staff (impatto, costo, tempi, fattibilità).

### Modificato
- Migrazione `ondata2_semplicita_profilo`; seed arricchito; fix `db:reset` (Prisma 7).

## [0.5.1] — 2026-06-11 · Review accessibilità & UX

### Corretto
- 8 finding: live region per ActionError e toast, skeleton accessibili, focus sugli error boundary, numeri in formato it-IT, `aria-disabled`, RingGauge.

## [0.5.0] — 2026-06-11 · Fase 1 «Abilitatori»

### Aggiunto
- Rate-limit pronto per Upstash Redis (multi-istanza).
- Cache a tag con `cachedShared()` (revive delle date, mai dati per-utente).
- Schema **provenance** (fonte + freschezza) + componente SourceBadge.
- 5 test E2E Playwright (auth, segnalazioni, voto).
- Predisposto switch Postgres/Neon (non eseguito); mailer rinviato.

## [0.4.0] — 2026-06-11 · Fase 0 «Hardening»

### Aggiunto
- CSP con nonce per-request + `strict-dynamic`; validazione Zod delle env; rate-limit su tutte le write action; `DEMO_MODE` con badge; pagine error/loading/not-found; 32 test Vitest; CI GitHub Actions con drift-check migrazioni; `pistoia.config.ts`.

## [0.3.0] — 2026-06-10 · Community v2

### Aggiunto
- Mappa Leaflet multilivello; foto e geolocalizzazione sulle segnalazioni; dettaglio opere ricco; calendario eventi; moderazione avanzata; privacy completa; feedback sulle risposte; follow esteso; pagine quartiere.

## [0.2.0] — 2026-06-09 · Community MVP

### Aggiunto
- Profili verificati (coda admin), badge e ruoli (cittadino/moderatore/staff/admin); quartieri; **segnalazioni** con storico stati e "Anche io"; **proposte civiche** con soglie 50/200/500; follow generico; audit log moderazione; home "La mia città"; feed Comunità.

## [0.1.1] — 2026-06-08 · Security review

### Corretto
- 18 finding: rate-limit per-account, guard `SESSION_SECRET`, anti open-redirect, contrasto WCAG AA, percentuali sondaggi, hydration, ARIA.

## [0.1.0] — 2026-06-08 · v1 «Piattaforma base»

### Aggiunto
- Prototipo end-to-end: Next.js 16 (App Router) + TypeScript + Tailwind 4 + Prisma 7/SQLite; auth Argon2id con sessioni DB; sezioni Bilancio, Opere, Sondaggi, Comunità, Organigramma; profilo, impostazioni, notifiche; Area Comune (admin); design mobile-first nei colori di Pistoia; tutto su **dati mock dichiarati**.
