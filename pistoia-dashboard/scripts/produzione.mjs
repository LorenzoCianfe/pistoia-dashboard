/**
 * Cancello della produzione: il sito deployato si MONTA davvero?
 *
 * Nasce da un difetto costato mesi. Il 2026-08-05 la demo rispondeva 200 e
 * serviva l'HTML giusto, ma **nessun browser riusciva ad aprirla**:
 * `upgrade-insecure-requests` nella CSP promuoveva ogni script a `https://` su
 * un sito servito in HTTP, e fallivano tutti con `ERR_CERT_AUTHORITY_INVALID`.
 * La pagina restava ferma sul proprio «Caricamento in corso». Era un difetto
 * **preesistente dalla Fase 0**, e nessun cancello l'ha mai visto per una
 * ragione sola: `rotte` e `shots` girano contro lo **sviluppo**.
 *
 * Da qui la regola che questo script mette in pratica: **un cancello copre
 * l'ambiente su cui gira, non l'ambiente di cui parla.** Dodici cancelli verdi
 * sullo sviluppo non dicono niente su ciò che vede chi apre l'indirizzo vero.
 *
 * ## Perché NON è in CI, e non è una dimenticanza
 *
 * L'indirizzo del deploy è `http://pistoia.192.168.50.173.sslip.io`: un IP
 * **privato**, in rete locale. I runner di GitHub Actions non lo raggiungono —
 * è la stessa ragione per cui non c'è auto-deploy sul push (`AGENTS.md` §8). Un
 * job che ci provasse fallirebbe sempre, oppure — peggio — verrebbe scritto
 * tollerante e diventerebbe un cancello che non guarda niente. Si lancia a
 * mano, da questa macchina, **dopo ogni deploy**.
 *
 * ## Che cosa pretende, e perché ognuna di queste cose
 *
 * 1. **Un browser vero, non `curl`.** È il punto: il 2026-08-05 `curl` vedeva
 *    un sito sano. Il difetto viveva fra l'HTML e il montaggio.
 * 2. **Una PAGINA DI CONTENUTO, mai `/login`.** Su `/login` `main` ha ~228
 *    caratteri **anche quando è sana**, perché è solo il modulo (misurato in
 *    produzione il 2026-08-07: 228 esatti). Una soglia che regga per `/login`
 *    non distingue una pagina sana da una ferma sul «Caricamento in corso»
 *    (~183). `/login` si controlla in un altro modo: **il modulo c'è?**
 * 3. **Ogni pagina ha la propria soglia**, scritta sotto il valore misurato.
 *    Un numero solo per tutte dovrebbe stare sotto la più magra, e sarebbe
 *    troppo basso per dire qualcosa sulle altre.
 * 4. **L'ATTERRAGGIO.** I guard di questo progetto reindirizzano invece di
 *    rifiutare: senza questo controllo una pagina pubblica finita al login
 *    risponderebbe 200, con un `<h1>` e un `main` pieno — e il cancello
 *    certificherebbe una superficie mai vista (`AGENTS.md` §4).
 * 5. **La sessione che SOPRAVVIVE alla navigazione.** Il 2026-08-05 l'accesso
 *    riusciva e ogni pagina successiva tornava al login, perché il cookie di
 *    sessione aveva `Secure` su un sito servito in HTTP. Un controllo che si
 *    ferma all'accesso non lo vede: qui si entra e poi si aprono **due** rotte
 *    protette di seguito.
 * 6. **Zero errori JavaScript non gestiti e zero richieste fallite** (quelle
 *    vere: vedi `richiestaDavveroFallita`). È la *causa* accanto al sintomo —
 *    quando il conteggio dei caratteri cade, questi due dicono perché.
 *
 * ## E quale VERSIONE sta girando
 *
 * Il controllo 0, e viene per primo perché se la versione è sbagliata tutti
 * gli altri stanno misurando la cosa sbagliata. Nasce dal 2026-08-07: il
 * cancello era verde, la previsione sul conteggio dei caratteri era smentita,
 * e per sapere se il deploy avesse preso sono servite **tre sonde a mano**.
 *
 * Si chiede al server **quale immagine sta eseguendo il container vivo**, e il
 * tag di quell'immagine è lo SHA del commit (`docker build -t <uuid>:<sha>`,
 * lo mette Coolify). È un fatto sul processo in esecuzione, non una
 * dichiarazione di chi ha lanciato il deploy — e soprattutto **non dipende da
 * come il deploy è stato lanciato**: vale identico dall'interfaccia di Coolify
 * e dall'API.
 *
 * Le tre strade scartate, perché la ragione serve a chi le riproverà:
 *
 * 1. *Lo SHA come argomento di build.* **Coolify non lo passa**: gli unici
 *    build-arg sono `COOLIFY_URL`, `COOLIFY_FQDN`, `COOLIFY_BRANCH`,
 *    `COOLIFY_RESOURCE_UUID` più le variabili dell'applicazione (misurato sul
 *    log del deploy `xslgv91gji97flg209drdurx`).
 * 2. *Calcolarlo nel build da `.git`.* Il contesto è
 *    `/artifacts/<deploy>/pistoia-dashboard` e `.git` sta **un livello sopra**:
 *    non è nel contesto.
 * 3. *Scriverlo in una variabile di Coolify da un comando di deploy.* Funziona
 *    solo finché il deploy passa da quel comando: al primo lancio
 *    dall'interfaccia la variabile resta indietro e **il marcatore mente**, che
 *    è peggio di non averlo.
 *
 * Il limite che resta, dichiarato: si verifica il **tag** dell'immagine viva,
 * e chi lo assegna è Coolify al momento del checkout. Se Coolify prendesse un
 * commit e ne scrivesse un altro, il marcatore lo ripeterebbe. È molto più
 * stretto del buco di prima, e non c'è modo di chiuderlo dall'esterno.
 *
 * Uso:
 *   corepack pnpm produzione
 *
 * Variabili: `PROD_BASE_URL`, `PROD_EMAIL`, `PROD_PASSWORD`, `PROD_SSH_HOST`,
 * `PROD_APP_UUID`.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE = (process.env.PROD_BASE_URL ?? "http://pistoia.192.168.50.173.sslip.io").replace(
  /\/$/,
  "",
);
const CONTO = {
  email: process.env.PROD_EMAIL ?? "cittadino@pistoia.it",
  password: process.env.PROD_PASSWORD ?? "Pistoia2026",
};
/** L'host SSH e l'UUID dell'applicazione su Coolify (`AGENTS.md` §8). */
const SSH_HOST = process.env.PROD_SSH_HOST ?? "homeserver";
const APP_UUID = process.env.PROD_APP_UUID ?? "w148lovopnak9eshxuy13b1i";

/**
 * Le soglie sono **la metà del valore misurato**, arrotondata in giù.
 *
 * Il precedente è Lighthouse (`lighthouserc.js`, 2026-08-06): soglie scritte
 * *dopo* aver guardato i numeri, e messe sotto il minimo osservato. Qui il
 * margine è molto più largo di quei cinque punti, e la ragione è che il testo
 * di una pagina **cambia con i contenuti**: la produzione può essere indietro
 * di commit, il seed cresce, e il footer è uscito da `<main>` il 2026-08-06,
 * quindi ogni pagina perde d'un colpo il testo del piede. Un cancello che
 * diventa rosso per una ragione estranea al guasto che cerca smette di essere
 * letto (`AGENTS.md` §3).
 *
 * Metà basta comunque, e con abbondanza: il guasto che questo cancello esiste
 * per trovare porta `main` a ~183 caratteri, cioè a un ordine di grandezza di
 * distanza da qualunque soglia qui sotto.
 */
const PAGINE_ANONIME = [
  // Il documento più lungo della piattaforma, e a lettura pubblica: se una
  // pagina deve mostrare che il montaggio è avvenuto, è questa.
  { url: "/metodologia", minimo: 8_000, misurato: 17_140 },
  // R-5, decisione W1: si legge SENZA account. L'atterraggio qui è metà del
  // controllo — un redirect al login risponderebbe 200 con la sua brava pagina.
  { url: "/valutazioni", minimo: 900, misurato: 1_826 },
];

/**
 * Due, e di seguito: la prima prova che l'accesso serve a qualcosa, la seconda
 * che **serve ancora** un istante dopo. È il controllo del cookie `Secure`.
 */
const PAGINE_AUTENTICATE = [
  { url: "/bilancio", minimo: 1_300, misurato: 2_695 },
  { url: "/segnalazioni", minimo: 5_000, misurato: 10_121 },
];

/** Il testo che una pagina finita sull'error boundary rende con stato 200. */
const ERRORE_IN_PAGINA =
  /Pagina non trovata|Qualcosa è andato storto|Application error|Unhandled Runtime Error/i;

/**
 * Una richiesta fallita è un guasto **tranne** quando è stata annullata.
 *
 * Next preleva in anticipo le rotte vicine (`?_rsc=…`) e annulla i prelievi
 * quando si naviga altrove: misurato in produzione il 2026-08-07, fino a **26
 * annullamenti** su `/la-mia-citta`, tutti `net::ERR_ABORTED`, su una pagina
 * perfettamente sana. Contarli renderebbe questo cancello rosso dalla nascita,
 * cioè inutile.
 *
 * Il guasto che cerchiamo ha un'altra firma — il 2026-08-05 era
 * `net::ERR_CERT_AUTHORITY_INVALID` su ogni script — e non passa da qui.
 */
const richiestaDavveroFallita = (r) => (r.failure()?.errorText ?? "") !== "net::ERR_ABORTED";

/** Lo SHA che ho qui, e se resta lavoro fuori dai commit. */
function statoLocale() {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const sporco =
    execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim().length > 0;
  return { sha, sporco };
}

/**
 * Gli SHA delle immagini che i container VIVI stanno eseguendo.
 *
 * `docker ps` vuole il socket, e l'utente di `homeserver` non ce l'ha: serve
 * `sudo -n`, che là è configurato senza password. Il `-n` è deliberato — se un
 * giorno la password servisse, questo deve fallire **subito** invece di restare
 * appeso su un prompt che nessuno vedrà mai.
 *
 * Torna una lista e non un valore perché durante un deploy i container vivi
 * possono essere due, e «quale versione gira» in quel momento non ha una
 * risposta sola: dirlo è più utile che sceglierne una.
 */
function shaInEsecuzione() {
  return execFileSync(
    "ssh",
    [
      "-o",
      "BatchMode=yes",
      "-o",
      "ConnectTimeout=15",
      SSH_HOST,
      `sudo -n docker ps --filter name=${APP_UUID} --format '{{.Image}}'`,
    ],
    { encoding: "utf8", timeout: 60_000, stdio: ["ignore", "pipe", "pipe"] },
  )
    .split("\n")
    .map((riga) => riga.trim())
    .filter(Boolean)
    .map((immagine) => immagine.split(":").pop());
}

/** «indietro di N commit», quando si può dire; altrimenti si dice che non si può. */
function distanzaDa(remoto) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", remoto, "HEAD"], { stdio: "ignore" });
    const n = execFileSync("git", ["rev-list", "--count", `${remoto}..HEAD`], {
      encoding: "utf8",
    }).trim();
    return `, indietro di ${n} commit`;
  } catch {
    return ", e non è un antenato del tuo HEAD (commit che non conosci? `git fetch`)";
  }
}

/** Le due tinte d'accento del tema compilato: `light-dark(#chiaro, #scuro)`. */
function accentiDelTema() {
  const css = readFileSync(new URL("../src/themes/generated/pistoia.css", import.meta.url), "utf8");
  const m = css.match(/--color-accent:\s*light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)/i);
  return m ? [m[1].slice(1).toLowerCase(), m[2].slice(1).toLowerCase()] : null;
}

let problemi = 0;
const rosso = (msg) => {
  problemi += 1;
  console.log(`  ✗   ${msg}`);
};

/**
 * Apre una pagina e la misura. Restituisce `true` se è a posto.
 *
 * La misura si prende a pagina **posata**: l'ingresso di `(app)/template.tsx`
 * parte da `opacity: 0` e dura fino a ~2,2s (`AGENTS.md` §5), e le rivelazioni
 * allo scroll arrivano dopo. Stessa attesa fissa di `posata()` negli E2E, e per
 * la stessa ragione: sondare è più costoso e `networkidle` non arriva mai,
 * perché i prelievi RSC tengono la rete occupata.
 */
async function apri(page, { url, minimo, misurato }, etichetta) {
  const falliti = [];
  const errori = [];
  const onReq = (r) => {
    if (richiestaDavveroFallita(r)) falliti.push(`${r.url()} — ${r.failure()?.errorText}`);
  };
  const onErr = (e) => errori.push(e.message.split("\n")[0]);
  page.on("requestfailed", onReq);
  page.on("pageerror", onErr);

  try {
    const risposta = await page.goto(`${BASE}${url}`, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(2_500);

    const stato = risposta?.status() ?? 0;
    const finale = new URL(page.url()).pathname;
    const caratteri = await page.evaluate(
      () => document.querySelector("main")?.innerText.length ?? -1,
    );
    const testo = await page.locator("body").innerText();

    const guai = [];
    if (stato >= 400) guai.push(`stato ${stato}`);
    if (finale !== url) guai.push(`atterrata su ${finale}`);
    if (caratteri < 0) guai.push("nessun <main> in pagina");
    else if (caratteri < minimo)
      guai.push(`main = ${caratteri} caratteri, sotto la soglia di ${minimo}`);
    if (ERRORE_IN_PAGINA.test(testo)) guai.push("errore reso in pagina");
    if (errori.length) guai.push(`${errori.length} errori JavaScript`);
    if (falliti.length) guai.push(`${falliti.length} richieste fallite`);

    if (guai.length) {
      rosso(`${url.padEnd(16)} [${etichetta}]  ${guai.join(" · ")}`);
      for (const f of falliti.slice(0, 5)) console.log(`        ⨯ ${f}`);
      for (const e of errori.slice(0, 5)) console.log(`        ⨯ js: ${e}`);
      return false;
    }
    console.log(
      `  ok  ${url.padEnd(16)} [${etichetta}]  main = ${caratteri} caratteri ` +
        `(soglia ${minimo}, misurato ${misurato})`,
    );
    return true;
  } catch (e) {
    rosso(`${url.padEnd(16)} [${etichetta}]  ${e.message.split("\n")[0]}`);
    return false;
  } finally {
    page.off("requestfailed", onReq);
    page.off("pageerror", onErr);
  }
}

console.log(`Cancello della produzione — ${BASE}\n`);

// ---------------------------------------------------------------------------
// 0. Quale versione sta girando. Per PRIMA: se è sbagliata, tutto il resto sta
//    misurando qualcos'altro — ed è precisamente ciò che è successo il
//    2026-08-07, con un cancello verde e una previsione smentita.
// ---------------------------------------------------------------------------
let versioneGiusta = false;
try {
  const { sha, sporco } = statoLocale();
  const vivi = shaInEsecuzione();

  if (vivi.length === 0) {
    rosso(`versione: nessun container vivo di nome ${APP_UUID} sul server`);
  } else if (vivi.length > 1) {
    rosso(
      `versione: ${vivi.length} container vivi (${vivi.map((v) => v.slice(0, 7)).join(", ")}) — ` +
        `un deploy è in corso? rilancia quando ne resta uno`,
    );
  } else if (!/^[0-9a-f]{40}$/.test(vivi[0])) {
    rosso(`versione: il tag dell'immagine non è uno SHA (${vivi[0]}), quindi non è confrontabile`);
  } else if (vivi[0] === sha) {
    versioneGiusta = true;
    console.log(
      `  ok  ${"versione".padEnd(16)} [container]  ${sha.slice(0, 7)} — è il commit che hai qui`,
    );
  } else {
    rosso(
      `versione: la produzione esegue ${vivi[0].slice(0, 7)}, il tuo HEAD è ` +
        `${sha.slice(0, 7)}${distanzaDa(vivi[0])}`,
    );
  }

  // Non è un rosso: il deploy porta commit, non la cartella di lavoro. Ma un
  // verde qui, da solo, si legge «la produzione ha ciò che sto guardando» — e
  // con l'albero sporco è falso. Si dice SOLO quando il verde può ingannare:
  // se la versione è già rossa, questa riga è rumore.
  if (sporco && versioneGiusta) {
    console.log(
      `      ⚠ hai modifiche non committate: la produzione ha il commit giusto, non la tua cartella di lavoro`,
    );
  }
} catch (e) {
  // NON verificata ≠ a posto. Vale la regola di `AGENTS.md` §3 (Fase A/B, 3).
  // Si stampa lo stderr, non il comando: la ragione vera («Could not resolve
  // hostname», «Permission denied») è là dentro, e ripetere il comando che ha
  // fallito non ha mai detto a nessuno perché.
  const dettaglio = e.stderr?.toString().trim().split("\n")[0] || e.message.split("\n")[0];
  rosso(`versione NON verificata: ${dettaglio}`);
}

const browser = await chromium.launch();

// ---------------------------------------------------------------------------
// 1. Passata anonima: le pagine a lettura pubblica, da un contesto vergine.
// ---------------------------------------------------------------------------
const ctxAnon = await browser.newContext({ locale: "it-IT" });
const anon = await ctxAnon.newPage();

for (const pagina of PAGINE_ANONIME) await apri(anon, pagina, "anonimo");

/*
  `/login` a parte, e non per pigrizia: qui il conteggio dei caratteri non
  distingue niente (228 da sana), quindi il cancello chiede l'unica cosa che
  conta davvero — **il modulo c'è e si può compilare**. È anche la porta da cui
  passa la verifica autenticata qui sotto: se cade questa, cade tutto il resto
  per una ragione che vale la pena leggere subito.
*/
try {
  await anon.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await anon.waitForTimeout(1_500);
  const campi = await anon.locator('input[name="email"], input[name="password"]').count();
  const invio = await anon.locator('button[type="submit"]').count();
  const caratteri = await anon.evaluate(
    () => document.querySelector("main")?.innerText.length ?? -1,
  );
  if (campi === 2 && invio > 0) {
    console.log(`  ok  ${"/login".padEnd(16)} [anonimo]  modulo completo (main = ${caratteri})`);
  } else {
    rosso(`${"/login".padEnd(16)} [anonimo]  modulo incompleto: ${campi} campi, ${invio} invii`);
  }
} catch (e) {
  rosso(`${"/login".padEnd(16)} [anonimo]  ${e.message.split("\n")[0]}`);
}

await ctxAnon.close();

// ---------------------------------------------------------------------------
// 2. Passata autenticata: si entra, e poi si pretende di RESTARE dentro.
// ---------------------------------------------------------------------------
const ctxAuth = await browser.newContext({ locale: "it-IT" });
const auth = await ctxAuth.newPage();

let entrato = false;
try {
  await auth.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await auth.fill('input[name="email"]', CONTO.email);
  await auth.fill('input[name="password"]', CONTO.password);
  await Promise.all([
    auth.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45_000 }),
    auth.click('button[type="submit"]'),
  ]);
  entrato = !new URL(auth.url()).pathname.includes("/login");
} catch {
  entrato = false;
}

if (entrato) {
  console.log(`  ok  ${"accesso".padEnd(16)} [${CONTO.email}]  → ${new URL(auth.url()).pathname}`);
  for (const pagina of PAGINE_AUTENTICATE) await apri(auth, pagina, "autenticato");
} else {
  /*
    Non si salta in silenzio. Un cancello deve distinguere «verificato e a
    posto» da «non verificato» (`AGENTS.md` §3, Fase A/B, 3): saltare le pagine
    autenticate uscendo 0 è esattamente il difetto che `shots` aveva, e che
    aveva prodotto una "revisione visiva" della sola pagina di login.
  */
  rosso(`accesso non riuscito con ${CONTO.email}: le pagine protette non sono verificabili`);
  problemi += PAGINE_AUTENTICATE.length;
}

await ctxAuth.close();
await browser.close();

// ---------------------------------------------------------------------------
// 3. Marcatore della tavolozza: il CSS servito è quello che ho qui?
// ---------------------------------------------------------------------------
/*
  Controllo DEBOLE e gratuito, e la debolezza è dichiarata: parla solo quando
  la tavolozza cambia, quindi un deploy vecchio con gli stessi colori passa.
  Vale comunque perché il caso in cui parla è quello grosso — «ho lanciato il
  deploy e sto guardando la versione di prima».

  I due valori NON sono scritti qui: si leggono dal tema compilato, così cambiare
  un accento non lascia indietro un numero cucito in uno script (il 2026-08-05
  l'accento è passato da `#0E9F92` a `#0A756B` per il contrasto AA, ed è
  esattamente la classe di modifiche che questo controllo deve seguire da sé).
*/
const accenti = accentiDelTema();
if (!accenti) {
  rosso("tavolozza: --color-accent non trovato nel tema compilato (src/themes/generated/)");
} else {
  try {
    const html = await (await fetch(`${BASE}/login`)).text();
    const fogli = [...new Set(html.match(/\/_next\/static\/[^"']+\.css/g) ?? [])];
    if (fogli.length === 0) {
      // Zero fogli non è «nessuna differenza»: è una misura non presa.
      rosso("tavolozza: nessun foglio di stile trovato nell'HTML servito");
    } else {
      const css = (
        await Promise.all(fogli.map(async (f) => (await fetch(`${BASE}${f}`)).text()))
      ).join("\n");
      const mancanti = accenti.filter((hex) => !css.toLowerCase().includes(hex));
      if (mancanti.length) {
        rosso(
          `tavolozza: #${mancanti.join(", #")} non compare nei ${fogli.length} fogli serviti — ` +
            `il deploy potrebbe essere indietro rispetto a questo repository`,
        );
      } else {
        console.log(
          `  ok  ${"tavolozza".padEnd(16)} [statico]  #${accenti.join(" e #")} nei ${fogli.length} fogli serviti`,
        );
      }
    }
  } catch (e) {
    rosso(`tavolozza: ${e.message.split("\n")[0]}`);
  }
}

// ---------------------------------------------------------------------------
// +versione +login +accesso +tavolozza
const controlli = PAGINE_ANONIME.length + PAGINE_AUTENTICATE.length + 4;
console.log(`\n${controlli} controlli, ${problemi} con problemi.`);
if (problemi > 0) {
  console.error(
    versioneGiusta
      ? `\n✗ la produzione esegue il commit giusto ma non è a posto. Se il ` +
          `testo di ogni pagina è crollato insieme, guarda la CSP e la console ` +
          `del browser prima del codice: il precedente (2026-08-05) era una ` +
          `direttiva che faceva fallire tutti gli script su un sito servito in ` +
          `HTTP, e l'HTML arrivava intatto.`
      : `\n✗ la produzione non è a posto. **Comincia dalla versione**: finché ` +
          `non è quella giusta, gli altri controlli stanno misurando un'altra ` +
          `applicazione — e un verde lì sotto non dice niente sul codice che ` +
          `hai in mano.`,
  );
  process.exitCode = 1;
}
