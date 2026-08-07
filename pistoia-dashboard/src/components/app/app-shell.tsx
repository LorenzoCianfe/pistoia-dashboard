import { getUnreadCount } from "@/lib/data/notifiche";
import { TopBar } from "@/components/app/top-bar";
import { SideNav } from "@/components/app/side-nav";
import { BottomNav } from "@/components/app/bottom-nav";
import { DemoTour } from "@/components/app/demo-tour";
import { TourOffer } from "@/components/app/tour-offer";
import { Footer } from "@/components/app/footer";
import { PopupValutazioni } from "@/components/valutazioni/popup-valutazioni";
import type { CurrentUser } from "@/lib/auth/dal";

/*
  Il guscio dell'area autenticata: barra in alto, navigazione, footer, tour.
  Estratto dal layout del gruppo `(app)` quando `/valutazioni` è passata al
  gruppo `(pubblico)` (R-5, decisione W1 del 2026-08-04): i due layout devono
  rendere ESATTAMENTE lo stesso guscio a chi è autenticato, e due copie
  divergono sempre. Una definizione sola, due porte.
*/
export async function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const unread = await getUnreadCount(user.id);

  return (
    <div className="min-h-dvh">
      <a
        href="#contenuto"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-lg"
      >
        Salta al contenuto
      </a>
      <TopBar user={user} unread={unread} />
      <div className="mx-auto flex max-w-6xl gap-7 px-4 sm:px-6">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-56 shrink-0 overflow-y-auto py-6 lg:block print:hidden">
          {/* Il RUOLO, non il `NavItem`: l'icona è un componente, e da qui
              (Server Component) non attraversa il confine — vedi `SideNav`. */}
          <SideNav ruolo={user.role} />
        </aside>
        <main
          id="contenuto"
          tabIndex={-1}
          className="min-w-0 flex-1 pt-6 outline-none"
        >
          {children}
        </main>
      </div>

      {/*
        IL FOOTER STA FUORI DA `<main>`, ed è una decisione di sostanza
        (Lorenzo, 2026-08-06) non un riordino.

        Un `<footer>` **discendente di `main`** non è mappato al ruolo
        `contentinfo`: lo dice HTML-AAM, e lo ha dimostrato un test che lo
        cercava come `contentinfo` e ne trovava **zero**. Per mesi chi naviga a
        punti di riferimento non ha avuto modo di saltare al footer, su nessuna
        pagina — e la regola axe che lo direbbe
        (`landmark-contentinfo-is-top-level`) è taggata `best-practice`, quindi
        resta fuori dal cancello.

        Il prezzo, dichiarato: qui fuori il footer **non è più allineato alla
        colonna di `main`** ma parte da sinistra, sotto la barra laterale. È la
        resa scelta fra le due proposte — l'alternativa allineata voleva un
        secondo contenitore che ripetesse a mano la geometria della barra, e
        quella geometria sarebbe rimasta da tenere allineata per sempre.

        `pb-28 lg:pb-12` viaggia col footer e non con `main`: serve a non farlo
        finire sotto la navigazione bassa, ed è il footer l'ultima cosa della
        pagina.
      */}
      <div className="mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:pb-12">
        {/* `autenticato`: qui c'è sempre una sessione, quindi il footer non
            deve mostrare l'invito ad accedere. Il valore predefinito della
            prop è `false` di proposito — un innesto che se ne dimenticasse
            mostrerebbe l'invito a chi è già dentro, difetto visibile;
            l'inverso lo nasconderebbe a chi ne ha bisogno, difetto muto. */}
        <Footer autenticato />
      </div>
      <BottomNav />
      {/* Modalità presentazione (O0): vive nel guscio così sopravvive alle
          navigazioni tra i passi del tour. */}
      <DemoTour />
      {/* Invito al tour per chi non l'ha mai concluso (O4): sparisce per
          sempre col tour finito o con la checklist dei primi passi nascosta. */}
      {!user.tourCompletedAt && !user.onboardingDismissedAt ? <TourOffer /> : null}
      {/* Il pop-up delle Valutazioni (R-5, D): dorme finché un voto espresso
          non lo arma, e a decidere se mostrarsi è il contatore unico, sul
          server. Vive nel guscio perché il completamento può avvenire su
          pagine diverse, e il componente non costa niente finché tace. */}
      <PopupValutazioni />
    </div>
  );
}
