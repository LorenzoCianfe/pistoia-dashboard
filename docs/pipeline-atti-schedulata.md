# La pipeline degli atti gira da sola

> Scritto il **2026-08-11**, misurando. Chiude il debito «la pipeline non ha
> uno scheduler e in produzione non è mai girata», che era il più grosso
> lasciato aperto dall'Ondata 8.
>
> Compagno di [`docs/fonti-atti.md`](fonti-atti.md), che descrive **la fonte**;
> qui si descrive **chi la chiama e quando**.

---

## 0. In una riga

Un solo **Scheduled Task di Coolify** che lancia `npm run atti` una volta al
giorno. Il primo scatto si accorge che l'archivio è vuoto e fa il carico
completo (~3 minuti); tutti gli altri leggono l'albo in **~2 secondi**.

---

## 1. Che cosa è cambiato perché fosse possibile

### 1.1 🔴 La lettura non usa più un browser

Girava su Playwright — e **in produzione Playwright non c'era**. Il
`Dockerfile` fa `npm ci --include=dev`, che installa il *pacchetto* ma non
scarica i binari dei browser: quello lo fa `npx playwright install`, che nel
build non c'è mai stato. Un cron dentro il container sarebbe partito verso
«Executable doesn't exist at /root/.cache/ms-playwright/…».

Le due cose per cui serviva il browser erano **uno user-agent credibile** (il
WAF blocca sull'UA e risponde 500) e **i cookie del portlet** (l'export dipende
dall'ultima griglia visitata nella stessa sessione). `fetch` le fa tutte e due.
Misurato il 2026-08-11 su tutte e quattro le griglie:

| Griglia | Esito | Dimensione | Tempo |
|---|---|---:|---:|
| Albo pretorio | 200, CSV | 0,15 MB | **2,6s** |
| Storico atti | 200, CSV (dichiara `text/html`) | 13,47 MB | 178s |
| Provvedimenti organi indirizzo politico | 200, CSV | 0,05 MB | 1,0s |
| Atti generali | 200, CSV | 0,03 MB | 1,3s |

**L'alternativa costava 427MB per immagine** (Chromium) più ~50 pacchetti
Debian, su un'immagine da 2,82GB e un disco da 40GB che si è già riempito al
100% una volta — per fare due richieste GET.

Il barattolo dei cookie sta in `src/lib/atti.ts` (`raccogliCookie`,
`intestazioneCookie`) ed è coperto dai test. ⚠️ Le stringhe di `Set-Cookie` si
prendono da `Headers.getSetCookie()`, **mai dall'intestazione unita spezzata
sulle virgole**: un `Expires=Wed, 09 Sep 2026 …` contiene una virgola, e chi la
spezzasse si porterebbe a casa un cookie chiamato « 09 Sep 2026 10:00:00 GMT»
perdendo quello vero.

### 1.2 🔴 Un giro su archivio VUOTO fa il carico completo, da sé

L'albo contiene ~220 atti. Chi lo leggesse su un archivio a zero si
ritroverebbe **220 atti su 26.644** — un archivio 120 volte più piccolo del
vero — e il monitor direbbe **«Aggiornato»**, perché la lettura è andata
benissimo. Plausibile e falso.

Non è un caso di scuola: **è esattamente lo stato della produzione**, dove
l'archivio non è mai stato riempito, ed è dove il primo scatto del task sarebbe
finito. Quindi `scripts/atti.ts` conta gli atti e, se sono **zero**, legge
tutte e quattro le griglie dichiarandolo in una riga. La soglia è zero e non un
numero scelto: *vuoto* è un fatto, *troppo pochi* sarebbe un giudizio da tarare.

### 1.3 La pagina di blocco del WAF non veniva riconosciuta

Trovata **rompendo la lettura di proposito** (un cancello che non ha mai visto
un rosso non è provato): con lo user-agent di un Chrome headless l'esito
archiviato era **«errore»** invece di **«bloccata»**, cioè proprio la
distinzione che `fonti-atti.md` §2.1 dichiara essenziale.

La causa: `paginaDiBlocco` guardava i primi **4.000** caratteri, mentre la
pagina di blocco è lunga **39.133** e comincia con ~19KB di CSS inline — il
titolo arriva a 19.205, «Web Page Blocked» a **38.709**, `MDAWAF` a 38.749.
Nessuna delle tre spie sta nella finestra. Il difetto **era preesistente** e
non del motore nuovo: la funzione è la stessa che usava la lettura a browser.

Finestra portata a 64.000. Il test che la copriva usava una pagina **inventata
e corta**, con le spie all'inizio: passava, e non poteva vedere il difetto.
Adesso ne esiste uno sulla forma vera, con le posizioni misurate.

---

## 2. Lo Scheduled Task

**Coolify → l'applicazione Dashboard → Scheduled Tasks → + Add.**

| Campo | Valore | Perché |
|---|---|---|
| **Name** | `lettura-atti` | |
| **Command** | `npm run atti` | Il giro breve. Il primo scatto fa da sé il carico completo (§1.2) |
| **Frequency** | `0 21 * * *` | Una volta al giorno, alle 21 |
| **Container** | il container dell'applicazione | Il database sta sul volume, che solo lui monta |

**Perché le 21.** Gli atti si pubblicano in orario d'ufficio: un giro serale
prende la giornata intera invece di lasciarne fuori la coda. ⚠️ **Il cron di
Coolify gira in UTC**, e il container ha `TZ` impostata solo per
l'applicazione: `0 21 * * *` è quindi **le 23 italiane d'estate** e le 22
d'inverno — che va bene lo stesso (dopo la fine delle pubblicazioni), ma se
l'orario dovesse contare va scritto in UTC ragionando sul fuso, non
sull'orologio di chi lo configura.

**Perché ogni giorno basta, e non serve più spesso.** Un atto resta sull'albo
per la propria finestra di pubblicazione legale — mediana **15 giorni**,
misurata — e nel frattempo entra anche nello storico. Un giro quotidiano ha
quindi due settimane di margine prima di poter perdere qualcosa: anche
saltandone dieci di fila non si perde un atto.

### 2.1 Il primo scatto, e come si riconosce che è andato

Il primo giro in produzione dura **~3 minuti** invece di 2 secondi, perché fa
il carico iniziale. Non serve prepararlo a mano.

Come si verifica, senza fidarsi dei log di Coolify:

```bash
npm run atti:freschezza      # 7 controlli; dice se la lettura gira e se l'archivio è fresco
```

e sul cruscotto, `/admin`, la card «Archivio degli atti» passa da **«Mai
letto»** a **«Aggiornato»** con il conteggio vero.

### 2.2 Che cosa NON è stato fatto, e perché

- **Non si è passati a WAL.** Il database è in `journal_mode=delete`, dove un
  writer blocca i lettori — e il sito legge a ogni richiesta. Misurato sul
  carico iniziale (53 transazioni da 500 righe): mediana **21ms**, massima
  **84ms**, **1,23s** di lock in tutto spalmati su un giro di tre minuti,
  contro un `busy_timeout` di 5.000ms. Il margine sulla transazione peggiore è
  **59×**: cambiare journal mode sarebbe una modifica al database di produzione
  senza un problema da risolvere. **Condizione che lo riapre:** se il carico
  iniziale dovesse diventare molto più grande, o se comparissero errori
  `SQLITE_BUSY` nei log.
- **Non c'è un lock fra due giri.** Il task quotidiano dura 2 secondi con una
  cadenza di 24 ore: perché due giri si sovrappongano il portale dovrebbe
  metterci un giorno a rispondere, e il timeout della lettura è di 300s.
- **Il task non è stato attivato**: il server era **spento** durante questa
  sessione (risponde al ping, nessuna porta aperta), quindi non è stato
  possibile né verificare che questa versione di Coolify abbia gli Scheduled
  Task, né misurare il disco. **Se non li avesse**, il ripiego è una riga di
  crontab sul server:

  ```cron
  0 21 * * * docker exec $(docker ps -qf name=w148lovopnak9eshxuy13b1i) npm run atti >> /var/log/atti.log 2>&1
  ```

  con il costo dichiarato: Coolify non lo sa, i log stanno solo là sopra, e un
  redeploy non lo porta con sé.

---

## 3. Che cosa questo documento NON autorizza

- **A pubblicare una pagina dell'archivio.** Sono Ondata 11.
- **A dire che la produzione è aggiornata.** Al 2026-08-11 la produzione è
  indietro di **16 commit** e l'archivio là sopra è ancora vuoto: il task
  esiste in questo documento, non ancora su Coolify.
