"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

import { SHARED_ATTR, SHARED_NAME } from "@/lib/view-transitions";

/**
 * Link a una segnalazione che porta con sé la transizione a elemento condiviso
 * lista → dettaglio (DESIGN.md §7).
 *
 * **Perché scritta a mano e non con `layoutId` di Motion.** Nell'App Router la
 * lista si smonta prima che il dettaglio monti: i due elementi non stanno mai
 * nello stesso albero React, e senza albero condiviso `layoutId` non ha nulla
 * da interpolare. La via ufficiale sarebbe `<ViewTransition>` di React, ma non
 * è disponibile qui: in Next 16.2.7 il flag `experimental.viewTransition` non
 * commuta React sul canale experimental (`needsExperimentalReact()` guarda solo
 * `taint`, `transitionIndicator`, `gestureTransition`) e React 19.2 stabile non
 * esporta quel componente. Resta l'API nativa del browser, usata a mano.
 *
 * **Il nome è uno solo e si assegna al momento del clic.** Se ogni card della
 * lista portasse il proprio `view-transition-name`, il browser fotograferebbe
 * venti elementi e li animerebbe tutti in uscita: caos, non continuità. Qui il
 * nome vive sulla sola card cliccata, per la durata della transizione.
 *
 * **L'attesa della navigazione.** `startViewTransition` vuole che il callback
 * abbia finito di aggiornare il DOM, ma `router.push` è asincrono. Si aspetta
 * quindi la comparsa dell'elemento gemello sul dettaglio, con un tetto di
 * sicurezza: se il server è lento si procede senza morph invece di bloccare la
 * navigazione. Un'animazione mancata è un dispiacere, una pagina che non si apre
 * è un guasto.
 */

const ATTESA_MAX = 600;

export function ReportLink({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  const href = `/segnalazioni/${id}`;

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Clic con modificatori, tasto centrale, target diverso: è una richiesta di
    // aprire altrove. Non è affar nostro, lascia fare al browser.
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    if (typeof document.startViewTransition !== "function") return;

    const card = ref.current?.closest<HTMLElement>("[data-report-card]");
    if (!card) return;

    e.preventDefault();
    card.style.viewTransitionName = SHARED_NAME;

    const transizione = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          let chiuso = false;
          const fine = () => {
            if (chiuso) return;
            chiuso = true;
            osservatore.disconnect();
            clearTimeout(tetto);
            resolve();
          };
          const osservatore = new MutationObserver(() => {
            if (document.querySelector(`[${SHARED_ATTR}]`)) fine();
          });
          const tetto = setTimeout(fine, ATTESA_MAX);
          osservatore.observe(document.body, { childList: true, subtree: true });
          router.push(href);
        }),
    );

    // Il nome va tolto SEMPRE: lasciato addosso, alla navigazione successiva il
    // browser troverebbe due elementi con lo stesso nome e rifiuterebbe di
    // animare, senza dire perché.
    //
    // Saltare la transizione è un esito NORMALE: succede se si naviga di nuovo
    // mentre la prima è in volo, se la scheda passa in secondo piano, o se il
    // browser decide di rinunciare. In quel caso l'oggetto ViewTransition
    // rigetta *tutte e tre* le sue promesse, e ognuna senza gestore diventa un
    // "unhandled rejection" che finisce in console come errore di pagina —
    // `finished` da sola non basta a zittirlo. Un caso previsto non deve
    // sembrare un guasto.
    const pulisci = () => {
      card.style.viewTransitionName = "";
    };
    const ignora = () => {};
    transizione.finished.then(pulisci, pulisci);
    transizione.ready.then(ignora, ignora);
    transizione.updateCallbackDone.then(ignora, ignora);
  }

  return (
    <Link ref={ref} href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
