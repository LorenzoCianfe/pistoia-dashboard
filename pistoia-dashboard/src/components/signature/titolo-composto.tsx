import { cn } from "@/lib/utils";

/**
 * IL TITOLO CHE SI COMPONE — le parole salgono da sotto una maschera.
 *
 * 🔴 **Uno solo per schermata**, come la cifra display (`DESIGN.md` §8). È il
 * gesto che fa leggere un'apertura come un'apertura; su tre titoli nella stessa
 * pagina diventa un tic, e la gerarchia che voleva creare sparisce.
 *
 * ⚠️ **Il testo resta testo.** La maschera sta sul contenitore della parola, non
 * su un'immagine né su un duplicato nascosto: il titolo si seleziona, si cerca
 * col comando trova, si copia, e chi usa un lettore di schermo sente una frase
 * sola — non ventidue parole staccate. È la stessa regola per cui la cifra
 * display non è una matrice di punti.
 *
 * ⚠️ **Non è un componente client.** L'animazione è CSS puro con un ritardo
 * calcolato da una variabile in linea: non serve `"use client"`, non serve
 * `useEffect`, e con `prefers-reduced-motion` la regola globale di
 * `globals.css` azzera la durata — in CSS, mai in un ramo del markup
 * (`AGENTS.md` §3, 2026-08-08).
 *
 * ⚠️ Lo spazio fra le parole è un nodo di testo VERO **fuori** dalla maschera,
 * non un margine e non un carattere dentro `.parola`. Due ragioni, e la prima
 * è un difetto vero: `.parola` è un `inline-block` con `overflow: hidden`, e
 * uno spazio in coda a un inline-block viene **collassato via** — le parole si
 * attaccherebbero fra loro. La seconda: con un margine il titolo perde il punto
 * di a capo naturale e una riga lunga smette di spezzarsi dove deve.
 */
export function TitoloComposto({
  testo,
  coda,
  className,
  /** Da quanti millisecondi comincia la prima parola. */
  ritardo = 120,
}: {
  testo: string;
  /**
   * Quello che sta ATTACCATO all'ultima parola — il punto colorato del
   * mockup.
   *
   * ⚠️ Esiste come prop e non come elemento accanto al componente perché
   * accanto **va a capo**: ogni parola è un `inline-block`, quindi un segno
   * messo dopo è un'altra scatola che il flusso può mandare sulla riga
   * successiva. Il punto finiva da solo sotto il titolo, grande e rosso.
   */
  coda?: React.ReactNode;
  className?: string;
  ritardo?: number;
}) {
  const parole = testo.split(" ");

  return (
    <span className={cn("titolo-composto", className)}>
      {parole.map((parola, i) => (
        // `key` sull'indice è corretto qui e solo qui: la lista è derivata da
        // una stringa immutabile e non si riordina mai.
        <span key={i}>
          <span className="parola">
            <span
              style={{ "--i": i, "--r": `${ritardo}ms` } as React.CSSProperties}
            >
              {parola}
              {/* La coda sale INSIEME all'ultima parola: è parte della stessa
                  scatola, quindi non può andare a capo da sola. */}
              {i === parole.length - 1 ? coda : null}
            </span>
          </span>
          {i < parole.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
