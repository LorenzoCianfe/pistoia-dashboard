# SECURITY.md — modello di sicurezza

> I dati della piattaforma sono dimostrativi. **L'autenticazione no: è reale.**
> Questo documento descrive cosa è già implementato, cosa è deliberatamente
> fuori portata, e come segnalare un problema.
>
> Aggiornato: 2026-07-25

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
sta fuori dai `PROTECTED_PREFIXES` di `proxy.ts`.

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

---

## 7. Dipendenze

Al 2026-07-25 `npm audit` riporta **12 vulnerabilità** (7 high, 4 moderate,
1 low), tutte in dipendenze **transitive e preesistenti**: `next`, `prisma`/
`@prisma/dev`, `postcss`, `sharp`, `esbuild`, `hono`, `js-yaml`, `fast-uri`,
`brace-expansion`, `valibot`.

**Nessuna proviene da Astryx o StyleX**, verificato al momento della loro
introduzione. **`uqr`** (QR delle valutazioni, aggiunto il 2026-08-03 su
decisione esplicita) è una foglia **senza sotto-dipendenze**: nessuna
vulnerabilità propria al momento dell'introduzione.

La maggior parte riguarda strumenti di sviluppo e non la superficie di
produzione, ma vanno riviste prima di qualunque deploy pubblico. Aggiornare
`next` è la voce a priorità più alta (bypass di middleware in App Router).

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
