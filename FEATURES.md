# FEATURES.md — funzionalità implementate

> Documento **vivo**: si aggiorna a ogni funzionalità aggiunta, non a fine
> ondata. Se una funzionalità esiste nel codice e non è qui, il documento è in
> debito.
>
> Legenda: ✅ completa · 🚧 in corso · 🔒 richiede verifica · 👤 richiede login
>
> Aggiornato: 2026-07-25 (ondata 7)

---

## 1. Sezioni civiche

| Sezione | Rotta | Stato | Cosa fa |
|---|---|---|---|
| **La mia città** | `/la-mia-citta` | ✅ | Home personalizzata: saluto, quartiere, KPI "vicino a te", segnalazioni vicine, proposte in evidenza, banner avvisi attivi. "Stato della città" **a bento**: cifra display del tasso di risoluzione e superficie `MeshSurface` la cui tinta deriva da quello stesso dato. Redirect post-login |
| **Bilancio** | `/bilancio` | ✅ | Apertura a bento con la **cifra display** (142 mln) e i tre anelli; **sankey a due stadi** "dove scorrono i soldi" (entrate → spesa/avanzo → 6 missioni), preceduto dall'unica **sezione narrata** della piattaforma; andamento mensile, treemap e elenco come lettura alternativa, glossario contestuale |
| **Opere** | `/opere` · `/opere/[id]` | ✅ | **Cifra display** sull'investimento nei cantieri aperti e `MeshSurface` la cui tinta è la quota di cantieri che rispettano il calendario. **Cronoprogramma**: per ogni cantiere il lavoro fatto contro il tempo passato, col marcatore di dove i tempi previsti direbbero di essere. Dettaglio: stessa lettura in una riga, fonte di finanziamento, RUP, foto prima/durante/dopo, FAQ, commenti, mini-mappa, "Cosa cambia per me", "Spiegamelo semplice". **Transizione a elemento condiviso** lista → dettaglio |
| **Mappa** | `/mappa` | ✅ | Leaflet + tile OSM, layer attivabili (opere, segnalazioni, eventi, avvisi urgenti, uffici, scuole, verde, servizi) |
| **Segnalazioni** | `/segnalazioni` · `/[id]` | ✅ 👤 | Filtri + KPI, **timeline a punti** dell'andamento (altezza = arrivate, diametro = chiuse, colore = settimana in pari), foto reale, geolocalizzazione, **invio anonimo**, workflow di stato, "Anche io", timeline ufficiale, follow. **Transizione a elemento condiviso** lista → dettaglio |
| **Sondaggi** | `/sondaggi` | ✅ 👤🔒 | Voto ottimistico. Consultazioni ufficiali e voti territoriali riservati ai verificati |
| **Proposte** | `/proposte` · `/[id]` | ✅ 👤🔒 | Cifra display sui sostegni raccolti in tutto. Dettaglio: **scala a tacche** sull'intervallo reale 0→500 e i tre gradini 50/200/500 con cosa scatta a ciascuno. Sostegno riservato ai verificati, risposta ufficiale, "Perché non si può fare?" sulle respinte. **Transizione a elemento condiviso** |
| **Comunità** | `/comunita` | ✅ 👤 | Cifra display sulla quota di **domande con risposta ufficiale** (contata sulle sole domande). Stanze tematiche a griglia col numero di conversazioni. Composer con tipo post e quartiere, feed con badge autore, like/commenti ottimistici, risposte ufficiali con ufficio, "questa risposta è utile?", segnala commento |
| **Eventi** | `/eventi` | ✅ | Calendario mensile, pubblicazione dal Comune, proposta dalle associazioni verificate con approvazione |
| **Quartieri** | `/quartieri` · `/[slug]` | ✅ | Ogni scheda porta una fascia `MeshSurface` la cui tinta è il **tasso di risoluzione di quell'area** — lo slot dove una fotografia entrerà (`DISCOVERY` D7). Sotto il campione minimo la scheda resta neutra e lo dichiara. Il dettaglio aggrega segnalazioni, opere, eventi, proposte, discussioni; follow. **Transizione a elemento condiviso** |
| **Organigramma** | `/organigramma` | ✅ | Sindaco e giunta ad albero, follow degli assessori |

## 2. Trasparenza

| Sezione | Rotta | Stato | Cosa fa |
|---|---|---|---|
| **Decisioni** | `/decisioni` | ✅ | Archivio con esito e motivo in linguaggio semplice |
| **Promesse** | `/promesse` | ✅ | Tracker degli impegni per stato, origine, scadenza, nota di aggiornamento |
| **Avvisi urgenti** | `/avvisi` | ✅ | Severità, "cosa cambia per me" a punti, mini-mappa, archivio |
| **FAQ della città** | `/faq` | ✅ | Domande per tema, badge "Risposta ufficiale" |
| **Report del mese** | `/digest` | ✅ | Riepilogo 30 giorni calcolato dai dati + export PDF via print stylesheet |
| **Glossario** | `/glossario` | ✅ | Termini amministrativi in linguaggio semplice + tooltip `GlossaryTip` |
| **Question time** | `/question-time` | ✅ | Domande dei cittadini con risposta istituzionale |
| **Patti, priorità, progetti, iniziative, volontariato** | varie | ✅ | Partecipazione civica |

## 3. Utente

| Funzionalità | Stato | Note |
|---|---|---|
| Registrazione e accesso | ✅ | Argon2id, sessioni opache, rate-limit a tre livelli |
| Profilo | ✅ | Badge, stato verifica, richiesta verifica, statistiche, nome pubblico abbreviato |
| Notifiche | ✅ | Per tipo, segna-come-letta, badge nel TopBar |
| Impostazioni | ✅ | Preferenze notifiche, tema, cambio password, logout globale |
| Privacy e dati | ✅ | Consenso geo, **export JSON**, **cancellazione account** |
| Modalità semplice | ✅ | Scala tutto al 115%, target touch più ampi |
| Tema chiaro / scuro | ✅ | next-themes + `light-dark()` di Astryx |
| Ricerca globale | ✅ | Command palette (⌘K) |
| Tour dimostrativo | ✅ | Onboarding guidato |

## 4. Area Comune

| Funzionalità | Stato |
|---|---|
| Coda verifiche identità/associazione | ✅ |
| Triage segnalazioni e workflow di stato | ✅ |
| Revisione proposte e risposte ufficiali | ✅ |
| Broadcast e registro azioni (audit append-only) | ✅ |
| Moderazione: commenti segnalati, ban, sospensioni, parole bloccate | ✅ |
| Unione dei duplicati | ✅ |
| Approvazione eventi | ✅ |

---

## 5. Design system

> Ondata 5 — *Fondamenta Astryx & direzione ibrida* (2026-07-25)

| Elemento | Stato | Dove |
|---|---|---|
| **Tema Pistoia su Astryx** | ✅ | `src/themes/pistoia.ts` → 112 token, 6 override di componente |
| Build del tema per SSR | ✅ | `npm run theme:build` → `generated/pistoia.css` (2,2 KB gzip) |
| Tela grigio-calda + superfici squircle | ✅ | `--color-background-body` · `--radius-container` 32px |
| **Card a vetro in stile Apple** | ✅ | `backdrop-filter: blur(24px) saturate(180%)`, filo di luce interno, nessun alone. Contrasto misurato **16,8:1 / 16,0:1 → AAA** |
| Grana sulla tela come substrato del vetro | ✅ | `--canvas-grain-opacity: 0.045` — senza, il vetro non ha materia da sfocare |
| `browserslist` esplicito | ✅ | Chrome/Edge 123+, Firefox 120+, Safari 17.5+ — governa i prefissi di Lightning CSS |
| Tipografia Schibsted Grotesk + JetBrains Mono | ✅ | self-hosted via `next/font` |
| Accento teal + lime decorativo vincolato | ✅ | `--color-accent` · `--highlight` (solo sfondo) |
| Ponte di retrocompatibilità | ✅ | ~1050 utility storiche adottano i nuovi token senza toccare le rotte |
| Palette data-viz civica | ✅ | `--color-data-*` ritinti |
| Vetrina del design system | ✅ | `/design-system` (esclusa dall'indicizzazione) |
| Script di revisione visiva | ✅ | `npm run shots` — pagine chiave, temi chiaro e scuro |
| Bottoni come classi su token, condivise con i link | ✅ | `.btn` in `globals.css` · `Button` + `buttonClasses` |
| Rimosso ogni gradiente/alone residuo dai controlli | ✅ | bottone primario, barre di avanzamento, 3 bottoni fatti a mano |

### Componenti-firma

| Componente | Stato | Cosa fa |
|---|---|---|
| **`DisplayNumber`** | ✅ | Cifra display a scala estrema (88px/300 contro label 11px/600). Testo vero: selezionabile e accessibile senza equivalenti nascosti. Corredo opzionale: unità, scala a tacche, delta, sparkline |
| **`MeshSurface`** | ✅ | Gradiente mesh con grana; **la tinta codifica un dato** (`good`/`warn`/`bad`/`cool`) |
| **`DotScatterTimeline`** | ✅ | Attività nel tempo: posizione = valore, diametro = intensità, colore = stato. Attraversabile da tastiera, con tabella equivalente |
| **`ScrollTold` / `ScrollStep`** | ✅ | Sezione narrata dallo scroll su ScrollTimeline nativa; statica con `prefers-reduced-motion` |

Nessuno dei quattro introduce dipendenze: niente GSAP, niente WebGL.

### Il sistema sulle pagine

> Ondata 6 — *Il design system arriva sulle pagine* (2026-07-25)

| Elemento | Stato | Dove |
|---|---|---|
| **`SankeyFlow`** | ✅ | `charts/sankey-flow.tsx` — flusso a colonne sui token Pistoia, senza registry. Opacità come rampa sequenziale, tabella equivalente, attraversamento a frecce |
| Cifra display in uso | ✅ | Bilancio (spesa programmata) · La mia città (tasso di risoluzione) — una per schermata |
| `MeshSurface` con tinta che codifica un dato | ✅ | «Stato della città» (`toneFromPercent` del tasso di risoluzione) · pannello del login (tono `cool`, neutro) |
| `ScrollTold` in uso | ✅ | Bilancio, tre passaggi — l'unica sezione narrata della piattaforma |
| `DotScatterTimeline` in uso | ✅ | Segnalazioni: altezza = arrivate, diametro = chiuse, colore = settimana in pari |
| **Transizione a elemento condiviso** | ✅ | `community/report-link.tsx` + `lib/view-transitions.ts` — View Transitions native, non `layoutId` (vedi `DESIGN.md` §7) |
| Inchiostro leggibile sopra il mesh | ✅ | `.mesh-surface` imposta `--highlight-ink`; contrasti misurati per tono in `DESIGN.md` §8 |
| Revisione visiva in modalità semplice | ✅ | `npm run shots -- --simple --width=360`, con misura del traboccamento orizzontale |

---

## 6. Piattaforma

| Elemento | Stato |
|---|---|
| CSP con nonce per-request | ✅ |
| Header di sicurezza statici | ✅ |
| Rate-limit su tutte le write action | ✅ |
| Store rate-limit intercambiabile (memoria / Upstash) | ✅ |
| Validazione env fail-fast al boot | ✅ |
| Cache a tag per letture condivise | ✅ |
| `DEMO_MODE` con zero-state onesti | ✅ |
| Provenienza dati dichiarata (`SourceBadge`) | ✅ |
| Test unitari (Vitest) + E2E (Playwright) | ✅ |
| Grafo di conoscenza del codice | ✅ `graphify-out/` |

---

## 7. Non ancora fatto

| Elemento | Perché |
|---|---|
| Primitive sui *componenti* Astryx | **Valutato e scartato con motivo** (vedi `ROADMAP.md` ondata 5): `TextInput` è controllato per contratto, `Button` non offre un gancio per i link, `Banner` è troppo pesante inline, `ProgressBar` perde lo stagger. Astryx resta la sorgente dei token |
| **26 rotte non ancora ridisegnate** | L'ondata 6 ha portato il sistema sulle quattro di punta. Le altre hanno *ereditato* i token dal ponte di retrocompatibilità: coerenti nei colori, non nella composizione. Nessuna usa i componenti-firma |
| Terzo stadio del sankey (entrate per fonte) | Il modello dati non ha la scomposizione: servirebbe un `BudgetRevenue`, o l'ETL della Fase 2. Il sankey si ferma a due stadi invece di inventare |
| Dichiarazione di accessibilità | Dovuta per legge a un ente pubblico italiano, ma il contenuto dipende da un audit vero: pubblicarla non verificata sarebbe peggio che non averla |
| Test automatici di accessibilità | `axe-core` negli E2E resta da impostare. I contrasti dell'ondata 6 sono misurati a mano |
| Verifica con screen reader | NVDA non è mai stato provato: il codice è scritto a specifica |
| Dati reali da fonti aperte | In pausa: vedi `ROADMAP.md` §8 |
| Identità reale (SPID/CIE) | Fuori portata dichiarata: `SECURITY.md` §8 |
| Architettura dell'informazione delle 30+ rotte | Gerarchia troppo piatta, serve un passaggio dedicato |
