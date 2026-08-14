import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LA TESSERA — la card di vetro della prima pagina, dal mockup del 2026-08-14.
 *
 * Quattro per schermata, in griglia 2×2 sopra la fotografia. La composizione è
 * sempre la stessa e questo è il punto: **titolo in alto a sinistra, icona in
 * alto a destra, il dato grande in basso, la nota sotto**. Quattro tessere che
 * ripetono lo stesso schema si leggono come uno strumento; quattro tessere
 * ciascuna a modo suo si leggono come una raccolta.
 *
 * ⚠️ **Il vetro qui è più denso che altrove.** Sotto non c'è la tela grigia ma
 * una fotografia con cielo, tetti e luci: `--glass-opacity` normale lascerebbe
 * passare abbastanza contrasto da far ballare il testo a seconda di cosa
 * capita dietro. È `DESIGN.md` §6 applicata al caso peggiore — il dato minuto
 * vuole una superficie che lo tenga.
 */
export function Tessera({
  titolo,
  icona: Icona,
  tinta,
  href,
  children,
  nota,
  centrato = false,
  className,
}: {
  titolo: string;
  icona: LucideIcon;
  /** Colore della pastiglia dell'icona. Serve a distinguere le quattro, non a
   *  codificare uno stato: qui il colore è ritmo, non semantica. */
  tinta: string;
  href?: string;
  children: React.ReactNode;
  nota?: React.ReactNode;
  /** Centra il contenuto invece di appoggiarlo in basso: serve alla tessera
   *  del sindaco, dove il ritratto vuole stare al centro come nel mockup. */
  centrato?: boolean;
  className?: string;
}) {
  const dentro = (
    <>
      <div className="flex items-start justify-between gap-3">
        {/* `text-balance` e nessun tetto stretto: il titolo va a capo dove
            conviene, non dove lo forza una misura in `ch`. */}
        <h2 className="text-balance text-[15px] font-semibold leading-snug">
          {titolo}
        </h2>
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full"
          style={{
            color: tinta,
            backgroundColor: `color-mix(in oklab, ${tinta} 16%, transparent)`,
          }}
        >
          <Icona size={19} />
        </span>
      </div>

      <div
        className={cn(
          "pt-5",
          centrato ? "flex flex-1 flex-col justify-center" : "mt-auto",
        )}
      >
        {children}
      </div>

      {nota ? (
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-pretty text-[12.5px] leading-snug text-muted">
            {nota}
          </p>
          {href ? (
            <span aria-hidden className="maniglia-angolo shrink-0">
              <ArrowRight size={15} />
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const classe = cn(
    "tessera group flex h-full flex-col p-5",
    href && "card-hover",
    className,
  );

  if (!href) return <section className={classe}>{dentro}</section>;

  return (
    <Link href={href} className={classe}>
      {dentro}
    </Link>
  );
}
