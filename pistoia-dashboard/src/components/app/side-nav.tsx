"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
  motion,
} from "motion/react";
import {
  DESTINATIONS,
  findDestination,
  isPathActive,
  staffNav,
  type NavItem,
} from "./nav-items";
import { cn } from "@/lib/utils";

/*
  LA BARRA LATERALE — un'isola di vetro flottante con la goccia (Ondata 10,
  decisione di Lorenzo del 2026-08-12).

  Che cos'era: una colonna attaccata al bordo, alta quanto lo schermo. Misurata
  a 1700px di finestra: **870px di colonna per 236px di contenuto**, cioè il
  **73% vuoto in modo permanente**, su ogni pagina, per cinque voci. È il
  sintomo che Lorenzo ha chiamato «old style», ed è un fatto misurabile prima
  che un giudizio.

  Che cos'è adesso: **un'isola che abbraccia il proprio contenuto** e galleggia
  staccata dal bordo. La larghezza resta 224px per scelta sua — le etichette non
  si nascondono dietro un'icona-indovinello — e lo spazio si recupera dal tetto
  del contenuto, non da qui.

  ## La goccia, e perché si muove così

  🔴 **Reattiva, mai ambientale** (scelta di Lorenzo fra tre gradi). `DESIGN.md`
  §7 dice «sobria, mai giocosa — livello 3 su 5, mai ambientale», e `AGENTS.md`
  §2 vieta le animazioni continue perché il servizio deve girare su Android
  vecchi. Quindi qui **non c'è un solo fotogramma di animazione quando nessuno
  tocca niente**: la goccia si muove sul passaggio del mouse, sul fuoco da
  tastiera e sul cambio di pagina, poi si ferma.

  Ciò che la fa leggere come **liquido** invece che come una pastiglia che
  scivola è una cosa sola: **la deformazione è derivata dalla VELOCITÀ**, non da
  una durata inventata. `useVelocity` sulla posizione, e da lì lo schiacciamento
  — si allunga quando corre, si ricompone quando arriva, e a volume quasi
  costante (`scaleX` va all'inverso). Un salto corto la deforma appena, uno
  lungo la stira: è quello che fa una goccia d'acqua, e non si poteva ottenere
  con `layoutId`, che interpola e basta.

  ## Due vincoli che la goccia NON può rompere

  1. **La verità di «dove sono» non dipende dalla goccia.** Al passaggio del
     mouse la goccia va a *visitare* la voce sorvolata: se fosse lei l'unico
     segnale di pagina corrente, per tutto quel tempo la barra mentirebbe. La
     voce attiva porta quindi un segno suo che non si sposta mai — `aria-current`,
     l'inchiostro pieno, l'icona teal e la tacca a sinistra. È `DESIGN.md` §6
     applicato: *il `:hover` non è un canale, è un rinforzo*.
  2. **Con `prefers-reduced-motion` la goccia non anima**, si posiziona. La
     preferenza vive nella DURATA e mai in un ramo del markup: un ramo servirebbe
     un HTML diverso da quello idratato (`AGENTS.md` §3, 2026-08-08).

  ## Perché la goccia non ha `backdrop-filter`

  L'isola sì (è ferma: si compone una volta), la goccia no. Sfocare lo sfondo di
  un elemento **che si muove** obbliga il compositore a rifare la sfocatura a
  ogni fotogramma, ed è esattamente il costo che `AGENTS.md` §2 non vuole sui
  telefoni modesti. Una superficie translucida con un filo di luce dentro un
  pannello già sfocato legge come vetro lo stesso, e costa solo trasformazioni.
*/

/** Quanto la goccia si allunga al massimo, e a quale velocità ci arriva. */
const VELOCITA_PIENA = 1400;
const ALLUNGAMENTO = 0.34;

function NavLink({
  item,
  active,
  nested = false,
  onPuntare,
}: {
  item: NavItem;
  active: boolean;
  nested?: boolean;
  onPuntare: (el: HTMLElement | null) => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      data-attiva={active ? "" : undefined}
      /*
        Il puntamento passa da mouse E tastiera: `onFocus` non è un di più,
        è ciò che rende la goccia un rinforzo del fuoco invece che un effetto
        per chi ha un mouse. `onBlur`/`onMouseLeave` la rimandano all'attiva.
      */
      onMouseEnter={(e) => onPuntare(e.currentTarget)}
      onFocus={(e) => onPuntare(e.currentTarget)}
      onMouseLeave={() => onPuntare(null)}
      onBlur={() => onPuntare(null)}
      className={cn(
        /*
          `min-h-11` sono i 44px di `DESIGN.md` §11.6, e qui il prezzo si paga
          in altezza di colonna: le righe erano **31,5px** annidate e **40** al
          primo livello, cioè la superficie di navigazione era l'unica della
          piattaforma con bersagli sotto la soglia su ogni pagina.
        */
        "group relative flex min-h-11 items-center rounded-[var(--radius-sm)] transition-colors",
        nested
          ? "gap-2.5 py-1.5 pl-3 pr-3 text-[13px]"
          : "gap-3 px-3.5 py-2.5 text-sm font-medium",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {/*
        LA TACCA DELL'ATTIVA: il segno che non si muove mai.

        Esiste perché la goccia se ne va a visitare la voce sorvolata, e in quel
        momento serve qualcosa che continui a dire «sei qui». Non è colore e
        basta — `DESIGN.md` §11.3 chiede che lo stato si comunichi anche senza
        colore, e questa è forma.
      */}
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-teal"
        />
      ) : null}
      <Icon
        size={nested ? 15 : 19}
        className={cn("relative z-10 shrink-0", active && "text-teal")}
      />
      <span className="relative z-10 truncate">{item.label}</span>
    </Link>
  );
}

/**
 * Riceve il **RUOLO**, una stringa, e si ricava qui la superficie riservata.
 *
 * ⚠️ **La prop non può essere il `NavItem`**, ed è una trappola già pagata
 * (`AGENTS.md` §3, ondata 7, 1): `AppShell` è un Server Component, e passargli
 * l'oggetto significa passare `icon` — un componente React — attraverso il
 * confine RSC. React rifiuta a runtime; typecheck e lint restano verdi.
 */
export function SideNav({ ruolo }: { ruolo: string }) {
  const staff = staffNav(ruolo);
  const pathname = usePathname();
  const openDestination = findDestination(pathname);
  const reduce = useReducedMotion();

  const isolaRef = useRef<HTMLElement>(null);
  // Il primo posizionamento sta in un REF e non in uno stato: serve a
  // distinguere un giro, non a ridisegnare il componente — e uno `setState`
  // dentro un effetto è una cascata di render che React sconsiglia (lo dice
  // anche il lint del progetto).
  const primoGiro = useRef(true);

  // La posizione della goccia. `y` è il motore: da lui si deriva la velocità,
  // e dalla velocità la deformazione.
  const y = useMotionValue(0);
  const h = useMotionValue(0);
  // L'opacità è un motion value e non uno stato per la stessa ragione: la
  // goccia si accende quando SA dov'è, senza far ridisegnare la navigazione.
  const opacita = useMotionValue(0);
  const velocita = useVelocity(y);

  /*
    LA DEFORMAZIONE, derivata dalla velocità e non da una durata.

    `clamp` tiene lo schiacciamento nei limiti anche su uno scatto lunghissimo;
    `scaleX` va all'inverso per conservare più o meno il volume — è la
    differenza fra una goccia e un rettangolo che si stira.

    ⚠️ Con `prefers-reduced-motion` la deformazione è spenta a 1. Il valore
    iniziale è 1 anche sul server, quindi lo style servito e quello idratato
    coincidono e non c'è divergenza (`AGENTS.md` §3, 2026-08-08).
  */
  const tensione = useTransform(velocita, (v) => {
    if (reduce) return 0;
    return Math.min(Math.abs(v) / VELOCITA_PIENA, 1);
  });
  const scaleY = useTransform(tensione, (t) => 1 + t * ALLUNGAMENTO);
  const scaleX = useTransform(tensione, (t) => 1 - t * (ALLUNGAMENTO * 0.55));

  // Una sola voce attiva in tutta la barra: su una sotto-rotta come
  // `/comunita/stanze` combaciano sia la sezione sia la destinazione, e due
  // voci attive insieme si contenderebbero la goccia.
  const activeSectionHref =
    openDestination?.sections.find((s) => isPathActive(pathname, s.href))?.href ??
    null;

  /** Sposta la goccia su un elemento, o la rimanda sulla voce attiva. */
  const muovi = useCallback(
    (el: HTMLElement | null, immediato = false) => {
      const isola = isolaRef.current;
      if (!isola) return;
      const bersaglio =
        el ?? isola.querySelector<HTMLElement>("[data-attiva]") ?? null;

      /*
        ⚠️ **Nessuna voce attiva è uno stato NORMALE, non un caso limite**: su
        `/` — la prima pagina — nessuna delle cinque destinazioni è attiva,
        perché la home non è una di loro. Prima questa funzione usciva e basta,
        e la goccia restava **parcheggiata sull'ultima voce sfiorata**: cioè la
        barra indicava una pagina in cui non sei. L'ha trovato la prova da
        tastiera, non l'occhio.

        Senza bersaglio la goccia si SPEGNE. La tacca teal dell'attiva non c'è
        comunque, quindi non si perde nessun segnale: semplicemente non c'è
        niente da segnalare.
      */
      if (!bersaglio) {
        animate(opacita, 0, { duration: reduce ? 0 : 0.18 });
        return;
      }

      const r = bersaglio.getBoundingClientRect();
      const base = isola.getBoundingClientRect();
      const top = r.top - base.top + isola.scrollTop;

      opacita.set(1);
      if (immediato || reduce) {
        y.set(top);
        h.set(r.height);
        return;
      }
      /*
        Molla e non durata: `stiffness`/`damping` danno alla goccia un arrivo
        che decelera invece di fermarsi netto, ed è ciò da cui `useVelocity`
        ricava una deformazione credibile. `damping` alto la tiene sobria —
        `DESIGN.md` §7 vieta bounce ed elastic, e questa non rimbalza: si
        assesta.
      */
      animate(y, top, { type: "spring", stiffness: 480, damping: 38, mass: 0.7 });
      animate(h, r.height, { type: "spring", stiffness: 520, damping: 40 });
    },
    [y, h, opacita, reduce],
  );

  // Al montaggio e a ogni cambio di rotta la goccia si posa sull'attiva.
  // Il primo posizionamento è IMMEDIATO: una goccia che parte da zero e scende
  // sarebbe un'animazione d'ingresso, cioè movimento che nessuno ha chiesto.
  useEffect(() => {
    muovi(null, primoGiro.current);
    primoGiro.current = false;
  }, [pathname, muovi, activeSectionHref]);

  return (
    <nav
      ref={isolaRef}
      aria-label="Navigazione principale"
      /*
        L'ISOLA: vetro, staccata dal bordo, alta quanto il suo contenuto.

        `max-h` + `overflow-y-auto` non sono un ripensamento: con «Partecipa»
        aperta la colonna sfiora i 744px, e su uno schermo da 720 senza questo
        le ultime voci sarebbero irraggiungibili (`DESIGN.md` §11.7 — un
        contenitore che SCORRE non viola la regola, l'irraggiungibile sì).
      */
      className="card relative flex max-h-[calc(100dvh-6.5rem)] flex-col gap-1 overflow-y-auto p-2.5"
    >
      {/*
        LA GOCCIA. Sta sotto le voci (`z-0` contro il `z-10` di icona e testo),
        è decorativa e non annuncia niente: ciò che dice la pagina corrente è
        `aria-current` sul link, che i lettori di schermo leggono davvero.
      */}
      {/* `opacity` parte da 0 e si accende quando la goccia SA dov'è: senza,
          il primo fotogramma la mostrerebbe in cima alla lista, fuori posto. */}
      <motion.span
        aria-hidden
        style={{ y, height: h, scaleY, scaleX, opacity: opacita }}
        className={cn(
          "pointer-events-none absolute inset-x-2.5 top-0 z-0 rounded-[var(--radius-sm)]",
          "border border-[var(--glass-edge-strong)] bg-surface-2/80",
          "shadow-[inset_0_1px_0_var(--glass-sheen)]",
        )}
      />

      {DESTINATIONS.map((dest) => {
        const isOpen = openDestination?.href === dest.href;
        return (
          <div key={dest.href} className="flex flex-col gap-1">
            <NavLink
              item={dest}
              active={activeSectionHref === null && isPathActive(pathname, dest.href)}
              onPuntare={muovi}
            />
            {/* Le sezioni si mostrano solo per la destinazione aperta: è la
                progressive disclosure che tiene il primo livello leggibile. */}
            {isOpen && dest.sections.length > 0 ? (
              <ul className="mb-1 ml-[18px] flex flex-col gap-0.5 border-l border-border pl-2.5">
                {dest.sections.map((section) => (
                  <li key={section.href}>
                    <NavLink
                      item={section}
                      active={activeSectionHref === section.href}
                      nested
                      onPuntare={muovi}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}

      {staff ? (
        <>
          <div className="my-2 h-px bg-border" />
          <NavLink
            item={staff}
            active={isPathActive(pathname, staff.href)}
            onPuntare={muovi}
          />
        </>
      ) : null}
    </nav>
  );
}
