# SECURITY.md — modello di sicurezza

> I dati della piattaforma sono dimostrativi. **L'autenticazione no: è reale.**
> Questo documento descrive cosa è già implementato, cosa è deliberatamente
> fuori portata, e come segnalare un problema.
>
> Aggiornato: 2026-08-06 (§7: `npm audit` è bloccante in CI)

---

## 1. Segnalare una vulnerabilità

Scrivi a **lorenzomaya20000@gmail.com** con oggetto `[security] pistoia-dashboard`.
Non aprire una issue pubblica per problemi sfruttabili.

Include: cosa hai trovato, come riprodurlo, quale impatto stimi. Risposta
attesa entro 7 giorni.

Progetto dimostrativo e non commerciale: nessun programma di bug bounty.

---

## 2. Password e sessioni

- **Argon2id** con i parametri OWASP (m = 19 MiB, t = 2, p = 1). Le password non
  sono mai salvate in chiaro né reversibili.
- **Sessioni opache lato server.** Il cookie contiene un token casuale da 32
  byte; nel database si salva solo il suo **HMAC-SHA256** (chiave
  `SESSION_SECRET`). Una fuga del database **non** permette di forgiare un
  cookie valido.
- Cookie `pistoia_session`: `HttpOnly`, `SameSite=Lax`, `Secure` in produzione,
  durata 30 giorni.
- `SESSION_SECRET` è **obbligatorio in produzione** (≥32 caratteri). La
  validazione vive in `src/lib/env.ts` e **blocca l'avvio** via
  `instrumentation.ts`: meglio non partire che partire insicuri.
- "Cambia password" e "Esci da tutti i dispositivi" invalidano **tutte** le
  sessioni esistenti.
- **Equalizzazione dei tempi** sul login (verifica contro un hash fittizio
  quando l'utente non esiste): impedisce di enumerare gli account misurando le
  risposte.

---

## 3. Difese di rete e di piattaforma

### Content-Security-Policy con nonce per-request
Generata in `src/proxy.ts`:
`script-src 'self' 'nonce-…' 'strict-dynamic'`, `frame-ancestors 'none'`,
`form-action 'self'`, tile OSM in `img-src`. Il nonce raggiunge il root layout
via header `x-nonce` per lo script inline di next-themes.

> **Conseguenza architetturale:** il tema Astryx **deve** essere compilato in
> CSS statico. Un tema a runtime inietterebbe un `<style>` all'hydration che la
> CSP bloccherebbe. Non è un'ottimizzazione: è un vincolo di sicurezza.

### Header statici (`next.config.ts`)
`X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` ·
`Referrer-Policy: strict-origin-when-cross-origin` ·
`Permissions-Policy` (solo `geolocation=(self)`) ·
`Strict-Transport-Security`. Più `serverActions.allowedOrigins` da env per i
reverse proxy.

### Rate-limiting
Sul login, a tre livelli indipendenti:
- IP + email — 5 / 15 min
- **per-account, indipendente dall'IP** — 10 / 15 min (la vera difesa
  anti-brute-force: regge anche con IP falsificato)
- per-IP — 40 / 15 min (difesa in profondità)

Registrazione: 8 / ora per IP.

**Su tutte le write action** (`src/lib/limits.ts`): budget per-utente — post
10/h, commenti 30/h, segnalazioni 6/h, proposte 4/giorno, e così per voti,
follow, like, flag, richieste di verifica, export. La chiave è lo **userId**
(stabile), non l'IP (falsificabile).

Store intercambiabile (`src/lib/auth/rate-limit.ts`): in memoria per default,
**Upstash Redis via REST** quando `UPSTASH_REDIS_REST_URL/TOKEN` sono presenti
(pipeline atomica `INCR` + `PEXPIRE NX` + `PTTL`, timeout 3s, ripiego in memoria
se Redis è irraggiungibile).

### CSRF e redirect
- Protezione integrata delle Server Actions (controllo Origin/Host) più cookie
  `SameSite=Lax`.
- Il parametro `next` post-login è validato: solo path locali, niente
  open-redirect.

### Validazione
Zod su client **e** server. Nessun input si fida del client. Policy password:
minimo 10 caratteri, almeno una lettera e un numero.

---

## 4. Autorizzazione

**DAL** (`src/lib/auth/dal.ts`), memoizzata con `React.cache`:
`getCurrentUser` (DTO senza hash), `requireUser`, `requireVerified`,
`requireStaff`, `requireModerator`, `requireAdmin`.

> `proxy.ts` fa **solo** un controllo ottimistico sulla presenza del cookie. La
> verifica reale contro il database avviene nella DAL, vicino ai dati. Il
> middleware non è un confine di sicurezza: è un acceleratore.

**Ruoli** (`User.role`): `CITIZEN`, `MODERATOR`, `MUNICIPAL_STAFF`, `ADMIN`.
**Tipi di profilo** (`User.accountType`): `CITIZEN`, `ASSOCIATION`, `BUSINESS`,
`MUNICIPAL`.

**Gating**, applicato lato server nelle action:

| Azione | Requisito |
|---|---|
| Commentare, aprire segnalazioni, votare sondaggi aperti | registrato |
| Votare consultazioni ufficiali (`Poll.requiresVerified`) | **verificato** |
| Sostenere proposte | **verificato** |
| Moderare, rispondere ufficialmente, broadcast | staff / moderatore |
| **Valutare un servizio** (stelle + email, R-3) | **nessuno** — per decisione di prodotto |
| Rispondere a una valutazione (quadro/singola) o **segnalarla** (R-4) | staff del Comune (`requireStaff`) |
| **Rimuovere una valutazione** (R-4) | **solo la Redazione** — `requireRedazione` (`src/lib/auth/redazione.ts`), ruolo `MODERATOR`. **Mai un account del Comune, `ADMIN` compreso**: `ADMIN` è il super-account del Comune, e chi è giudicato può contestare, non cancellare. È il cancello di R-4, provato da unit (`puoRimuovere("ADMIN") === false`) ed E2E (`/redazione` respinge l'admin) |

**La valutazione è l'unica write action aperta a chi non ha un account**
(`app/actions/valutazioni.ts`, decisione 2026-08-03). Le sue difese sono
diverse per costruzione: rate limit per **IP ed email** (entrambi
dichiaratamente best-effort — l'IP è spoofabile senza proxy fidato), filtro
parole della community, e la mail di conferma con **revoca via token**
(`crypto.randomBytes(24)`, unico in schema). Conferma e revoca sono **azioni
di form, mai effetti del GET**: i filtri antispam aprono i link delle mail, e
un GET che mutasse agirebbe al posto della persona. Il prefisso **`/v/` è
pubblico per disegno** — è la porta del QR e dell'atterraggio della mail — e
sta fuori dai `PROTECTED_PREFIXES` di `proxy.ts`. Vale anche per
`/v/promemoria/[token]` (R-5): la disiscrizione dal promemoria mensile è
un'azione di form sulla pagina del token.

**Da R-5 anche `/valutazioni` e le schede sono a LETTURA pubblica**
(decisione W1 del 2026-08-04): fuori dai `PROTECTED_PREFIXES`, nel gruppo
`(pubblico)` con layout tollerante (`getCurrentUser`). Cambia solo la
lettura: la **scrittura** resta com'era — il modulo sulla scheda esige la
sessione (per gli anonimi degrada a invito), i controlli staff non entrano
nell'albero di chi non è staff, e il voto senza account resta confinato a
`/v/[codice]`. La passata anonima di `rotte.mjs` prova l'atterraggio; un E2E
prova che il resto del muro non si è mosso.

**Da R-6 è pubblica anche `/metodologia`** (forma C1 del 2026-08-05, coerente
con W1: le schede che chiunque legge citano quelle regole). Solo lettura per
costruzione — la pagina non ha azioni né form: rende `lib/metodologia.ts`, che
non tocca il database. Stesso gruppo `(pubblico)`, stessa passata anonima con
atterraggio preteso, stesso E2E di regime.

**La verifica è simulata** (nessuna integrazione SPID/CIE) ed è **etichettata
come tale nella UI**. Su una piattaforma che parla di trasparenza, fingere una
verifica reale sarebbe la cosa peggiore da fare.

---

## 5. Moderazione e audit

- Ogni azione del Comune o di un moderatore (verifica, cambio stato, risposta,
  post nascosto, broadcast) è registrata in `ModerationAction`: log
  **append-only**, che vale anche come audit trail. Da R-4 valgono anche per
  le valutazioni: risposta al quadro/singola, segnalazione (col motivo),
  rimozione, «lasciata pubblicata», Nota della Redazione.
- **Valutazioni (R-4)**: la rimozione redazionale **azzera il testo e lascia
  la riga** — il registro pubblico della scheda mostra data e motivo, firmati
  «Redazione della Dashboard di Pistoia». La segnalazione del Comune non ha
  segni pubblici finché la Redazione non decide; l'esito pubblico è il
  registro, quello interno il log.
- I post si nascondono in soft-hide (`CommunityPost.hidden`), non si cancellano.
- Filtro parole bloccate (`src/lib/word-filter.ts`), puro e testabile.
- Ban e sospensioni, segnalazione dei commenti, unione dei duplicati.

---

## 6. Privacy

- **Nome pubblico abbreviato** (`publicName`, es. "Lorenzo C.") in tutti i
  contenuti pubblici; il nome completo resta interno.
- **Export dei propri dati** e **cancellazione dell'account** implementati.
- Consenso esplicito per la geolocalizzazione; `Permissions-Policy` la limita a
  `self`.
- Pagine legali: privacy, cookie, regole della comunità.
- Le segnalazioni possono essere inviate in forma anonima.
- **Valutazioni (R-3): due dati, due vite** — l'email vive finché la
  valutazione resta pubblicata (la revoca cancella riga, email e token per
  intero); l'**IP si azzera da solo dopo 180 giorni**
  (`limiteConservazioneIp()`, eseguita a ogni voto — niente cron in una demo).
  Il telefono non si raccoglie. In locale nessuna email parte: ogni messaggio
  è un file in `.email/` (`src/lib/email.ts`), e `/privacy` lo dichiara.
- **Sollecitazioni (R-5): il contatore registra il minimo che serve** — per
  chi ha un account, data e canale di ogni invito a valutare
  (`Sollecitazione`, append-only), con un solo scopo dichiarato su
  `/privacy`: non chiedere più di una volta per finestra. Il **promemoria
  mensile** (`PromemoriaRinnovo`) esiste solo su richiesta esplicita dopo un
  voto, tiene la sola email, e la disiscrizione (azione di form, mai GET)
  cancella la riga per intero. Chi non ha un account non viene mai
  sollecitato: non c'è niente da registrare su di lui.

---

## 7. Dipendenze

Al **2026-08-05** `npm audit` riporta **zero vulnerabilità**. Erano **12** al
2026-07-25 (7 high, 4 moderate, 1 low), tutte transitive e preesistenti. Le tre
passate che le hanno chiuse:

| Passata | Cosa | Esito |
|---|---|---|
| Patch delle foglie | `js-yaml` `esbuild` `postcss` `nanoid` `fast-uri` `brace-expansion` | 12 → 8, col **solo lockfile**: `package.json` intatto |
| **`next` 16.2.7 → 16.3.0** | la voce a priorità più alta: **bypass di middleware in App Router**, più otto avvisi suoi | 8 → 5. Porta con sé `postcss` 8.5.23 e `sharp` 0.35.3, che erano due delle voci |
| **`prisma` 7.8.0 → 7.9.1** (con `@prisma/client` e l'adapter allineati) | la catena `@prisma/dev` → `hono`, `@hono/node-server`, `valibot` — il server locale di Prisma Studio | 5 → **0** |

**Il passo `npm audit` in CI è BLOCCANTE dal 2026-08-06**: `npm audit
--audit-level=high`, senza `|| true`.

> Questo paragrafo diceva «diventerà bloccante quando lo zero avrà retto qualche
> settimana». Ha retto **un giorno**, e la riga è stata chiusa lo stesso, per
> decisione esplicita di Lorenzo (2026-08-06). La condizione originale non è
> stata dimenticata: è stata **scavalcata**, e vale la pena scrivere perché
> l'argomento che la sosteneva era più debole di quanto sembrasse.
>
> Il timore era «scoprire dalla CI rossa che è uscito un avviso nuovo, invece
> che da una lettura». Ma è esattamente il mestiere di un cancello: nessuno
> rilegge `npm audit` a mano ogni settimana, ed è per non doverlo fare che
> esiste la CI.
>
> Resta valido il rischio opposto — un cancello che diventa rosso per rumore
> smette di essere letto — e la soglia lo tiene a bada: `--audit-level=high`
> agisce sul **codice di uscita**, non sul referto. Il report esce comunque
> intero nei log, quindi un avviso `moderate` resta **visibile** senza far
> cadere la pipeline. Se un giorno la si volesse più stretta, la leva è
> `--audit-level=moderate`, non togliere la soglia.

### ⚠️ Il prezzo di Next 16.3: `'strict-dynamic'` non c'è più in **sviluppo**

**Da 16.3 il server di sviluppo mette nell'HTML un tag `<script>` senza il
nonce**, e dentro c'è codice dell'applicazione (Motion). `'strict-dynamic'`
disattiva l'allowlist per host, quindi `'self'` non lo salva: il file viene
rifiutato, il bundle client non completa e **ogni pagina si apre col corpo
vuoto** — barra, menu e footer al loro posto. Visto su `/metodologia` e
`/valutazioni`, in due browser, schermata alla mano.

Quattro cose misurate, perché la diagnosi non si rifaccia da capo:

1. **Non è una nostra configurazione sbagliata.** `src/proxy.ts` segue alla
   lettera la ricetta ufficiale di
   `next/dist/docs/01-app/02-guides/content-security-policy.md`, `'unsafe-eval'`
   in sviluppo compreso — e quella guida promette che Next attacca il nonce ai
   «page-specific JavaScript bundles». `required-scripts.js` e il manifest
   client sono **identici** a 16.2.7, e lì il nonce viene passato.
2. **In produzione non accade**: sull'output di `next build`, **zero** tag
   `<script>` senza nonce.
3. **Non è ancora corretto a monte**: identico su **16.3.1-canary.3**.
4. **Il contrasto è netto**: su 16.2.7 gli script senza nonce erano **0**.

**La decisione (Lorenzo, 2026-08-05): togliere `'strict-dynamic'` solo nel ramo
di sviluppo** di `buildCsp()`. In sviluppo la CSP resta e continua a rifiutare
gli script inline e quelli di altri domini; cade solo la regola che impediva a
`'self'` di autorizzare i file del nostro server. **In produzione
`'strict-dynamic'` è intatto**, e con esso il vincolo che il tema DEVE essere
compilato (`ARCHITECTURE.md` §3).

Il costo, dichiarato: in sviluppo la CSP non è più identica a quella di
produzione, quindi un difetto che solo `'strict-dynamic'` intercetta si vedrebbe
soltanto dopo il build. **Da rifare quando Next rimetterà il nonce**: rimettere
`'strict-dynamic'` nel ramo di sviluppo e verificare che le pagine si aprano
piene.

**Nessun cancello se ne sarebbe accorto**, e vale la pena ricordarlo:
`npm run rotte` passava 56/56 e `npm run shots` usciva 0, perché il primo
controlla che la rotta risponda e il secondo che non scorra di lato. L'ha
trovato **guardare la pagina** — la casella di `AGENTS.md` §5.

**Nessuna proviene da Astryx o StyleX**, verificato al momento della loro
introduzione. **`uqr`** (QR delle valutazioni, aggiunto il 2026-08-03 su
decisione esplicita) è una foglia **senza sotto-dipendenze**: nessuna
vulnerabilità propria al momento dell'introduzione.

Due note per chi toccherà di nuovo queste versioni:

- In 16.3 `experimental.viewTransition` **non esiste più** (l'integrazione
  dell'App Router è di default e l'opzione è uscita dallo schema): va tolto da
  `next.config.ts`, o il typecheck fallisce. Verificato anche che
  `needsExperimentalReact()` non guarda quel flag né in 16.2.7 né in 16.3 —
  l'aggiornamento **non** commuta React di nascosto.
- **`@lhci/cli` non è una dipendenza del progetto** ed è una scelta: installarlo
  costa **285 pacchetti** e cinque avvisi propri (`tmp` è high), e il
  `Dockerfile` fa `npm ci --include=dev` — finirebbero nell'immagine di
  produzione. Gira con `npx` a versione pinnata (`npm run lighthouse`, job in
  CI). La stessa domanda va fatta a ogni strumento di misura futuro.

---

### ⚠️ Il deploy è in HTTP, e il codice assume HTTPS (2026-08-05)

Due difetti **dello stesso ceppo**, emersi lo stesso giorno sul deploy Coolify —
che risponde su `http://pistoia.192.168.50.173.sslip.io` mentre l'HTTPS su quel
nome dà 503 con certificato non valido:

| Dove | Che cosa succedeva | Stato |
|---|---|---|
| `upgrade-insecure-requests` nella CSP | Promuoveva a `https://` ogni script; fallivano tutti con `ERR_CERT_AUTHORITY_INVALID` e **la demo si apriva col corpo vuoto** | ✅ **tolta** (decisione di Lorenzo). Torna col certificato — `ROADMAP.md`, traccia «Qualità continua» |
| `secure: NODE_ENV === "production"` sul cookie di sessione (`src/lib/auth/session.ts`) | Il cookie prendeva `Secure`, e un browser **non conserva un cookie `Secure` arrivato su HTTP**: il login riusciva — il redirect lo decide il server nella stessa risposta — ma la navigazione successiva tornava al login, per sempre | ✅ **chiuso**: `Secure` si decide da **`x-forwarded-proto`**, non da `NODE_ENV`. Verificato in produzione: il cookie viene conservato (`httpOnly` intatto) e cinque rotte protette restano dove devono |

Entrambi erano **invisibili ai cancelli**: `rotte` e `shots` girano contro lo
sviluppo, dove `NODE_ENV` non è `production` e la CSP è quella di sviluppo. La
regola che ne discende è in `AGENTS.md` §8: **un deploy non è finito quando
risponde 200** — va aperto in un browser vero, e da autenticati.

Il ripiego della correzione al cookie è **conservativo di proposito**: si
rinuncia a `Secure` solo quando il proxy dichiara **positivamente** che la
connessione è in chiaro (`x-forwarded-proto`/`x-forwarded-scheme`); senza
quell'intestazione si torna a `NODE_ENV`, perché un cookie di sessione senza
`Secure` su una connessione che potrebbe essere cifrata sarebbe un regalo a chi
ascolta. **Col certificato si riaccende da solo**, senza toccare codice.

---

## 8. Fuori portata — dichiarato

Cose che un servizio pubblico reale avrebbe e questo progetto **non** ha:

- Identità digitale reale (SPID / CIE) — la verifica è simulata
- Audit di sicurezza indipendente
- Cifratura a riposo del database
- Backup e disaster recovery
- Log centralizzati, rilevamento intrusioni, alerting
- Conformità formale AgID / dichiarazione di accessibilità
- Trattamento di dati personali reali dei cittadini

**Questa piattaforma non deve trattare dati reali di cittadini** nello stato
attuale. Prima servirebbero: identità reale, audit, cifratura a riposo, backup,
e un titolare del trattamento identificato.
