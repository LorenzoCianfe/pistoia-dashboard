import type { Metadata } from "next";

import PrimaPagina from "@/app/(vetrina)/page";

export const metadata: Metadata = {
  title: { absolute: "Pistoia.app — la città, letta dai suoi atti" },
  description:
    "Piattaforma civica indipendente: le decisioni del Comune di Pistoia lette ogni giorno dall'albo pretorio e rese leggibili, con i numeri della città e le loro fonti.",
};

/*
  HOMEPAGE_1, VESTITA COL LINGUAGGIO NUOVO — l'anteprima (2026-08-15).

  🔴 **Questa pagina non ha una composizione propria: rende esattamente quella
  di `/`.** È una riga di JSX, e la scelta è il punto di tutto il lavoro.

  Le due strade possibili erano:

  1. **Copiare** `(vetrina)/page.tsx` e ritoccare la copia. Trecento righe
     duplicate che divergono al primo ritocco: due prime pagine che mostrano due
     numeri diversi della stessa città sono già state dichiarate «peggio di una
     variante in meno» (`AGENTS.md` §3, ondata 7), e questo sarebbe lo stesso
     difetto moltiplicato per l'intera composizione.
  2. **Rendere la stessa componente dentro un contesto diverso** — cioè questa.
     Il contesto è `data-stile="vetro"` sul guscio: da lì `globals.css` veste
     i `.btn` che stanno dentro Homepage_1 senza che il suo file cambi di un
     carattere.

  Ne discende una proprietà che vale più della riga risparmiata: **finché
  l'anteprima esiste, non può mentire.** Qualunque cosa si tocchi su `/` compare
  qui allo stesso istante, quindi ciò che si giudica è davvero il materiale
  nuovo sulla pagina vera, e non una fotografia di com'era.

  ⚠️ Importare il `page.tsx` di un'altra rotta è lecito — è un modulo come gli
  altri — ma è una cosa che si fa **una volta e si dichiara**, non un'abitudine:
  se un domani Homepage_1 prendesse dei parametri di rotta, questa riga
  smetterebbe di funzionare senza dirlo. Al 2026-08-15 non ne ha.
*/
export default function Homepage1Anteprima() {
  return <PrimaPagina />;
}
