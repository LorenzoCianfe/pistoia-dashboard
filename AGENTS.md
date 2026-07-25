# AGENTS.md — regole operative permanenti

> Questo file esiste perché Lorenzo non debba ripetere le stesse istruzioni a
> ogni sessione. Vale per qualunque agente (Claude Code o altro) lavori su
> questo repository.
>
> **Leggilo per intero all'inizio di ogni sessione, prima di toccare codice.**
>
> Aggiornato: 2026-07-25

---

## 0. In trenta secondi

Piattaforma civica per il Comune di Pistoia: bilancio, opere, segnalazioni,
partecipazione. **Next.js 16** (App Router) · React 19 · TypeScript · Tailwind
v4 · **Astryx** (design system Meta) · Prisma 7 + SQLite · Motion 12.
Interfaccia e documentazione **in italiano**. Dati dimostrativi, autenticazione
reale.

L'app vive in `pistoia-dashboard/`. La documentazione vive nella radice.

---

## 1. Cosa fare a ogni sessione

1. **Orientati col grafo, non col grep.** Esiste `graphify-out/`. Per domande
   sul codice usa `graphify query "<domanda>"`, `graphify path "<A>" "<B>"`,
   `graphify explain "<concetto>"`. Restituiscono un sottografo mirato, molto
   più piccolo di una lettura a tappeto.
2. **Leggi `DESIGN.md` prima di qualunque lavoro visivo.** È vincolante. Se una
   scelta lo contraddice, o cambi la scelta o cambi il documento — mai lasciarli
   in disaccordo in silenzio.
3. **Aggiorna i documenti vivi mentre lavori**, non alla fine: `FEATURES.md` a
   ogni funzionalità, `ROADMAP.md` a ogni ondata chiusa, `CHANGELOG.md` a ogni
   commit sostanziale.
4. **A fine modifica del codice**: `graphify update .` (solo AST, nessun costo
   di API).

---

## 2. Cosa NON fare mai

- **Non fare commit o push** se non richiesto esplicitamente.
- **Non introdurre dipendenze** senza chiedere. Vale anche per le "piccole":
  ogni pacchetto è superficie di manutenzione e di sicurezza su un servizio
  pubblico.
- **Non usare `--no-verify`**, non aggirare hook, non disattivare regole di lint
  per far passare qualcosa.
- **Non inventare dati.** I dati sono dimostrativi e devono restare dichiarati
  come tali (`SourceBadge`, banner "Anteprima").
- **Non toccare l'autenticazione** senza leggere prima `SECURITY.md`. È l'unica
  parte reale e non negoziabile del progetto.
- **Non regredire l'accessibilità.** Contrasto AA ovunque, AAA sul body: già
  verificato, non si torna indietro.
- **Non aggiungere sfondi WebGL, cursori animati o parallax.** Il servizio deve
  girare su telefoni Android vecchi. (Vedi `REFERENCES.md` §6.)

---

## 3. Design system — le regole che si sbagliano più spesso

**Prima di tutto: Astryx è la sorgente dei TOKEN, non lo strato di primitive.**
Le primitive in `components/ui/` restano Pistoia, e non è pigrizia: ogni caso è
stato valutato e la motivazione è scritta in testa al file
(`TextInput` è controllato per contratto, `Button` non veste i link, `Banner` è
troppo pesante inline, `ProgressBar` perde lo stagger). Non "sistemarle"
migrandole ad Astryx senza aver letto quei commenti e `ROADMAP.md` ondata 5.

Per un componente **nuovo**, invece, guarda prima se Astryx ce l'ha:
`npm run astryx component <Nome>`.



1. **I token di sistema stanno in `src/themes/pistoia.ts`**, non in
   `globals.css`. Dopo averlo modificato: `npm run theme:build`. Il CSS
   compilato in `src/themes/generated/` è generato — non modificarlo a mano.
2. **I token che Astryx non modella** (lime `--highlight`, stop dei mesh,
   griglia dot-matrix) stanno in `globals.css`, nel layer `pistoia`. Astryx
   rifiuta nomi di token custom: è un vincolo di tipo, non una preferenza.
3. **Non importare `@astryxdesign/core/tailwind-theme.css`.** Il ponte ufficiale
   mappa `--color-muted` su uno *sfondo*, mentre qui `text-muted` significa da
   sempre un *colore di testo*, usato in ~200 punti. Il motivo è spiegato in
   testa a `globals.css`: leggilo prima di "sistemare" quell'import.

4. **Non scrivere prefissi vendor a mano nel CSS.** Lightning CSS (il
   compilatore di Tailwind v4) li mette da solo in base a `browserslist`. Un
   `-webkit-backdrop-filter` scritto DOPO la proprietà standard **collassa le
   due dichiarazioni tenendo solo la `-webkit-`**: il vetro diventa un pannello
   opaco fuori da Safari e nulla segnala l'errore. Il `browserslist` in
   `package.json` è la fonte di verità della soglia di supporto — se non c'è,
   il compilatore fa scelte tutte sue.

Altre due che costano ore se ignorate:

- **Non usare il provider `<Theme>` di Astryx.** Applica `color-scheme` sul
  proprio wrapper e, appena diverge da `<html>`, ribalta tutte le `light-dark()`
  dei discendenti (sintomo: card bianche su tela nera). Il tema è già CSS
  compilato più attributi su `<html>`. Vedi `theme-provider.tsx`.
- **Il tema DEVE essere compilato**, mai a runtime: la CSP con nonce del proxy
  bloccherebbe il `<style>` iniettato all'hydration.

---

## 4. Comandi

```bash
npm run dev            # sviluppo
npm run typecheck      # tsc --noEmit — sempre prima di dire "fatto"
npm run lint
npm test               # vitest
npm run test:e2e       # playwright
npm run theme:build    # ricompila il tema dopo aver toccato pistoia.ts
npm run shots          # schermate delle pagine chiave, temi chiaro e scuro
npm run db:reset       # ricrea il DB e ripopola i dati dimostrativi
```

Se il dev server si comporta in modo assurdo (moduli non trovati, panic di
Turbopack, azioni server che falliscono in silenzio): **cancella `.next` e
riavvia**. Succede dopo un cambio di dipendenze ed è costato un'ora una volta.

---

## 5. Verifica — cosa significa "fatto"

Una modifica è finita quando **tutte** queste sono vere:

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] I test esistenti passano
- [ ] L'hai **guardata**: `npm run shots`, o il browser, in tema chiaro **e**
      scuro. Un typecheck verde non è una prova visiva.
- [ ] Funziona da tastiera e il focus è visibile
- [ ] Regge la **modalità semplice** (`html.simple-mode`, scala 115%)
- [ ] `prefers-reduced-motion` non lascia contenuto invisibile o inaccessibile

Sulle schermate: le animazioni d'ingresso durano fino a ~2,2s e i grafici si
rivelano allo scroll. Uno screenshot troppo presto, o senza scorrere la pagina,
fotografa grafici a metà o vuoti e sembra un bug che non c'è. `scripts/shots.mjs`
gestisce già entrambe le cose.

---

## 6. Stile del codice

- **Commenti**: si spiega il *perché*, mai il *cosa*. In italiano, come il
  resto. Un commento che ripete il nome della funzione è rumore; un commento che
  spiega perché una scelta apparentemente strana è necessaria vale dieci righe
  di codice.
- **Nomi**: italiano per il dominio civico (`segnalazione`, `quartiere`,
  `opera`), inglese per l'infrastruttura (`ThemeProvider`, `useInView`).
- **Server Components di default.** `"use client"` il più in basso possibile
  nell'albero, mai sul layout.
- **Motion**: importa da `motion/react`. È già in progetto ed è l'unica libreria
  che porta le animazioni legate allo scroll sulla ScrollTimeline nativa.
- Rispetta le convenzioni del file che stai modificando prima delle tue.

---

## 7. Interazione con Lorenzo

- **Non dare per scontato: chiedi.** Il processo di questo progetto è
  esplicitamente guidato dalla scoperta (vedi `DISCOVERY.md`). Quando due
  letture di una richiesta portano a lavori diversi, chiedi prima di costruire.
- **Riporta con onestà.** Se un test fallisce, dillo con l'output. Se hai
  saltato una parte, dillo e spiega perché. Mai dichiarare finito ciò che non
  hai verificato.
- **Segnala i costi, poi procedi.** Se una richiesta ha un problema reale,
  dillo in una o due frasi e continua a costruire sotto ipotesi dichiarate.
  Ridurre l'ambito è una decisione sua, non tua.
- Le decisioni già prese non si rimettono in discussione: sono in `DISCOVERY.md`
  e in `DESIGN.md`.
