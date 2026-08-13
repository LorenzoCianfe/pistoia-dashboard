import type { Metadata } from "next";
import { BellOff } from "lucide-react";
import { rimuoviPromemoriaAction } from "@/app/actions/sollecitazioni";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";

/*
  «Non inviarmelo più» — l'atterraggio del link nella mail di promemoria
  (R-5, B3). Stessa disciplina di `/v/conferma/[token]`: la disiscrizione è
  un'AZIONE di form, mai un effetto del GET, perché i filtri antispam aprono
  i link e una disiscrizione al passaggio agirebbe al posto della persona.

  Vive sotto `/v/` perché chi clicca dalla posta può non avere né account né
  sessione: è il prefisso pubblico di tutto ciò che arriva da fuori.
*/

export const metadata: Metadata = { title: "Promemoria mensile" };

function Marca() {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
      Pistoia.app · Valutazioni dei servizi
    </p>
  );
}

export default async function PromemoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ esito?: string }>;
}) {
  const { token } = await params;
  const { esito } = await searchParams;
  const p = await prisma.promemoriaRinnovo.findUnique({
    where: { token },
    select: { chiestoIl: true },
  });

  // La disiscrizione cancella la riga, quindi il token non risolve più: il
  // redirect porta qui `?esito=rimosso` per distinguere «fatto» da «scaduto».
  if (!p && esito === "rimosso") {
    return (
      <>
        <Marca />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Promemoria disattivato
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted" role="status">
          Non ti scriveremo più, e l&apos;indirizzo è sparito dall&apos;elenco
          dei promemoria. Le valutazioni già lasciate non cambiano.
        </p>
      </>
    );
  }

  if (!p) {
    return (
      <>
        <Marca />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Questo link non è più valido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Il promemoria a cui portava è già stato disattivato: da
          quell&apos;indirizzo non partirà più nessuna mail.
        </p>
      </>
    );
  }

  const quando = p.chiestoIl.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Marca />
      <h1 className="mt-6 text-xl font-semibold tracking-tight">
        Il promemoria mensile
      </h1>
      <Card className="mt-5">
        <p className="text-sm leading-relaxed text-muted">
          Da questo indirizzo è stato chiesto, il {quando} e dopo un voto, di
          ricevere <strong className="text-foreground">una mail al mese</strong>{" "}
          quando il voto sulle condizioni della città si rinnova. Niente altro
          viene inviato.
        </p>
        <form action={rimuoviPromemoriaAction.bind(null, token)} className="mt-4">
          <SubmitButton variant="danger" size="sm" pendingText="Disattivo…">
            <BellOff size={14} aria-hidden />
            Non inviarmelo più
          </SubmitButton>
        </form>
        <p className="mt-3 text-xs leading-relaxed text-muted-2">
          La disattivazione è immediata e cancella l&apos;indirizzo
          dall&apos;elenco. Le valutazioni già lasciate restano come sono.
        </p>
      </Card>
    </>
  );
}
