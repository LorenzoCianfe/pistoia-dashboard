/**
 * Prepara la TRANSIZIONE fra giorno e notte: il time-lapse di Pistoia che gira
 * quando si cambia tema.
 *
 * Sorgente: `refs/homepage/hf_*.mp4` — 10,1 MB di H.264, cioè impubblicabile.
 * Escono due WebM da qualche centinaio di KB: `alba` (notte → giorno) e
 * `tramonto` (giorno → notte).
 *
 * ## Perché la pipeline è così contorta
 *
 * L'ffmpeg che arriva con Playwright è una build ridotta: **decodifica solo
 * MJPEG e VP8**, quindi non sa aprire un MP4 H.264. Chrome invece lo decodifica
 * benissimo. Quindi:
 *
 *   1. Chrome apre il video e lo scorre fotogramma per fotogramma, salvando
 *      ogni posa come JPEG;
 *   2. ffmpeg legge la sequenza JPEG (decoder mjpeg) e la ricodifica in
 *      VP8/WebM (encoder libvpx).
 *
 * Nessuna dipendenza nuova: sono due strumenti che il progetto ha già.
 *
 * ⚠️ **Il tempo si comprime qui, non a runtime.** Cinque secondi per un cambio
 * di tema sono un'attesa, non una transizione: si campionano ~34 pose e si
 * rimontano a 28 fps, cioè **1,2 secondi**. Farlo con `playbackRate` avrebbe
 * lasciato nel file dieci volte i byte che servono.
 *
 * ⚠️ WebM/VP8 e non H.264: è l'unico encoder disponibile, ed è coperto dalla
 * soglia di `browserslist` (Chrome 123, Firefox 120, Safari 17.5 — VP8 in WebM
 * è supportato da Safari 14.1). Chi non l'avesse vede la dissolvenza semplice,
 * che è il ripiego previsto in `transizione-tema.tsx`.
 *
 * Uso:  corepack pnpm dev   (in un altro terminale, serve il video sorgente)
 *       node scripts/alba.mjs --da=<cartella-refs> --base=http://localhost:3000
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const arg = (n, d) =>
  process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;

const DA = arg("da", "../refs/homepage");
const BASE = arg("base", "http://localhost:3000");
const USCITA = path.resolve(process.cwd(), "public/citta");
const POSE = 34;
const FPS = 28;
const LARGHEZZA = 1280;

const FFMPEG = path.join(
  os.homedir(),
  "AppData/Local/ms-playwright/ffmpeg-1011/ffmpeg-win64.exe",
);

const sorgente = fs
  .readdirSync(path.resolve(process.cwd(), DA))
  .find((f) => f.toLowerCase().endsWith(".mp4"));
if (!sorgente) {
  console.error(`nessun .mp4 in ${DA}`);
  process.exit(1);
}

/* Il video va servito via HTTP: da `file://` una pagina senza origine non può
   caricarlo, e il `<video>` resta a `readyState 0` senza dire perché. */
const PUBBLICO = path.resolve(process.cwd(), "public/_alba-sorgente.mp4");
fs.copyFileSync(path.join(path.resolve(process.cwd(), DA), sorgente), PUBBLICO);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "alba-"));

try {
  const browser = await chromium.launch({ channel: "chrome" });
  const ctx = await browser.newContext({
    viewport: { width: LARGHEZZA, height: Math.round((LARGHEZZA * 1080) / 1916) },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.setContent(
    `<style>html,body{margin:0;background:#000;overflow:hidden}video{display:block;width:100vw;height:100vh;object-fit:cover}</style>
     <video src="${BASE}/_alba-sorgente.mp4" muted playsinline></video>`,
  );
  await page.waitForFunction(
    () => document.querySelector("video")?.readyState >= 2,
    null,
    { timeout: 60_000 },
  );

  const durata = await page.evaluate(() => document.querySelector("video").duration);
  console.log(`sorgente: ${sorgente} — ${durata.toFixed(2)}s`);

  for (let i = 0; i < POSE; i++) {
    const t = (i / (POSE - 1)) * (durata - 0.05);
    await page.evaluate(
      (t) =>
        new Promise((r) => {
          const v = document.querySelector("video");
          v.pause();
          v.onseeked = r;
          v.currentTime = t;
        }),
      t,
    );
    await page.waitForTimeout(90);
    await page.screenshot({
      path: path.join(tmp, `p-${String(i).padStart(3, "0")}.jpg`),
      type: "jpeg",
      quality: 92,
    });
  }
  await browser.close();
  console.log(`${POSE} pose catturate`);

  fs.mkdirSync(USCITA, { recursive: true });

  /*
    ⚠️ I fotogrammi entrano da STDIN, non da un modello di nome file.

    Questa build di ffmpeg ha il solo demuxer `image2pipe` — `image2`, quello
    che legge `p-%03d.jpg`, non c'è — e i soli protocolli `file` e `pipe`.
    Servono entrambe le cose insieme: `-f image2pipe`, `-vcodec mjpeg` (senza,
    non riconosce il flusso e il file d'uscita esce senza tracce) e `pipe:0`.

    E l'inversione si fa **concatenando i JPEG al contrario** invece che col
    filtro `reverse`, che questa build non ha: è anche più economico, perché
    `reverse` tiene in memoria tutti i fotogrammi.
  */
  const pose = fs
    .readdirSync(tmp)
    .filter((f) => f.endsWith(".jpg"))
    .sort();

  const codifica = (nome, ordine) => {
    const fuori = path.join(USCITA, `${nome}.webm`);
    const flusso = Buffer.concat(
      ordine.map((f) => fs.readFileSync(path.join(tmp, f))),
    );
    execFileSync(
      FFMPEG,
      [
        "-y", "-hide_banner", "-loglevel", "error",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-framerate", String(FPS),
        "-i", "pipe:0",
        "-an",
        "-c:v", "libvpx",
        "-b:v", "1100k",
        "-crf", "33",
        "-deadline", "good",
        "-cpu-used", "2",
        fuori,
      ],
      { input: flusso, stdio: ["pipe", "inherit", "inherit"], maxBuffer: 1 << 28 },
    );
    console.log(`${nome}.webm: ${(fs.statSync(fuori).size / 1024).toFixed(0)} KB`);
  };

  // `tramonto` = giorno → notte (l'ordine del girato). `alba` = il contrario.
  codifica("tramonto", pose);
  codifica("alba", [...pose].reverse());
} finally {
  fs.rmSync(PUBBLICO, { force: true });
  fs.rmSync(tmp, { recursive: true, force: true });
}
