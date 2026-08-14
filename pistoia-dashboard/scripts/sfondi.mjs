/**
 * Prepara le due fotografie di Pistoia che fanno da scena alla prima pagina.
 *
 * Sorgente: `refs/homepage/Pistoia_{giorno,notte}_1920x1080.png` — 2,6 MB e
 * 2,5 MB di PNG, cioè **impubblicabili così**: sono la prima cosa che scarica
 * chi apre il sito, e su una connessione mobile sarebbero cinque secondi di
 * schermo vuoto.
 *
 * Esce una scala di misure in AVIF e WebP. Il browser sceglie da sé con
 * `<picture>`: prende il formato che sa leggere e la misura che gli serve,
 * quindi un telefono non scarica mai l'immagine da 1920.
 *
 * ⚠️ **Gira a mano e il risultato si committa** (`public/citta/`). Non è un
 * passo della build: le foto cambiano quasi mai, e farle rigenerare a ogni
 * deploy sarebbe lavoro sprecato su ogni CI.
 *
 * Uso:  node scripts/sfondi.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

/* Le fotografie sorgente vivono in `refs/`, che sta fuori dall'applicazione e
   non è versionato: sono materiale di lavoro, non un asset del prodotto. Da un
   worktree la posizione cambia, quindi si può passare `--da=<cartella>`. */
const SORGENTE = path.resolve(
  process.cwd(),
  process.argv.find((a) => a.startsWith("--da="))?.slice(5) ?? "../refs/homepage",
);
const USCITA = path.resolve(process.cwd(), "public/citta");

/*
  Le misure. 1920 è la sorgente; 2560 non si genera perché ingrandire una foto
  da 1920 non aggiunge dettaglio, aggiunge solo byte — su schermi più larghi
  l'immagine si stira, ed è la scelta giusta per uno sfondo sfocato dal vetro.
*/
const MISURE = [960, 1440, 1920];

/* AVIF pesa circa un terzo del WebP a parità di resa, ma non tutti i browser
   della soglia di `browserslist` lo leggono: si servono entrambi e decide il
   browser. La qualità è bassa di proposito — è una scena dietro il vetro,
   non una fotografia da guardare. */
const FORMATI = [
  { ext: "avif", opts: { quality: 45, effort: 6 } },
  { ext: "webp", opts: { quality: 68 } },
];

const FOTO = [
  { src: "Pistoia_giorno_1920x1080.png", nome: "pistoia-giorno" },
  { src: "Pistoia_notte_1920x1080.png", nome: "pistoia-notte" },
];

fs.mkdirSync(USCITA, { recursive: true });

let totale = 0;
for (const foto of FOTO) {
  const dentro = path.join(SORGENTE, foto.src);
  if (!fs.existsSync(dentro)) {
    console.error(`manca: ${dentro}`);
    process.exit(1);
  }
  const meta = await sharp(dentro).metadata();

  for (const larghezza of MISURE) {
    for (const f of FORMATI) {
      const fuori = path.join(USCITA, `${foto.nome}-${larghezza}.${f.ext}`);
      await sharp(dentro)
        .resize({ width: larghezza, withoutEnlargement: true })
        .toFormat(f.ext, f.opts)
        .toFile(fuori);
      const kb = fs.statSync(fuori).size / 1024;
      totale += kb;
      console.log(`${path.basename(fuori).padEnd(30)} ${kb.toFixed(0)} KB`);
    }
  }
  console.log(`  ← ${foto.src} (${meta.width}×${meta.height})`);
}

/*
  Il segnaposto sfocato: 24px di larghezza, inline come data URI nel CSS.
  Serve a coprire il momento fra il primo disegno e l'arrivo della foto, che
  altrimenti è un lampo di tela nuda sotto il testo bianco — cioè il testo
  illeggibile per qualche centinaio di millisecondi.
*/
for (const foto of FOTO) {
  const buf = await sharp(path.join(SORGENTE, foto.src))
    .resize({ width: 24 })
    .webp({ quality: 30 })
    .toBuffer();
  console.log(`\n${foto.nome} segnaposto (${buf.length} byte):`);
  console.log(`data:image/webp;base64,${buf.toString("base64")}`);
}

console.log(`\ntotale su disco: ${(totale / 1024).toFixed(2)} MB (il browser ne scarica UNA)`);
