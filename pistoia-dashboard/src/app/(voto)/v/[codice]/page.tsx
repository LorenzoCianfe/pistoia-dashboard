import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getCodiceQr, getQuartieriPerVoto } from "@/lib/data/valutazioni";
import { DOMANDA_FAMIGLIA, servizio as trovaServizio } from "@/lib/valutazioni";
import { ModuloVoto } from "@/components/valutazioni/modulo-voto";
import { Card } from "@/components/ui/card";

/*
  La pagina del QR stampato: una schermata, stelle + email, niente altro.

  Il codice porta servizio e luogo, quindi i due campi più scomodi da digitare
  su un telefono sono già compilati — è l'intero motivo per cui i QR esistono
  come canale. Il luogo si mostra perché chi inquadra sappia COSA sta
  valutando, e finisce nella composizione come «da QR in loco».
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ codice: string }>;
}): Promise<Metadata> {
  const { codice } = await params;
  const riga = await getCodiceQr(codice);
  const s = riga ? trovaServizio(riga.servizioId) : null;
  return { title: s ? `Valuta: ${s.nome}` : "Codice non trovato" };
}

function Marca() {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
      Pistoia.app · Valutazioni dei servizi
    </p>
  );
}

export default async function PaginaVotoQr({
  params,
}: {
  params: Promise<{ codice: string }>;
}) {
  const { codice } = await params;
  const riga = await getCodiceQr(codice);
  if (!riga) notFound();
  const s = trovaServizio(riga.servizioId);
  if (!s) notFound();

  // Un codice ritirato (fotografato e ridistribuito, luogo dismesso) merita
  // una spiegazione, non un 404: il foglio stampato è ancora lì davanti.
  if (!riga.attivo) {
    return (
      <>
        <Marca />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Questo codice non è più attivo
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Il QR che hai inquadrato è stato ritirato. I servizi si possono
          comunque valutare dalla piattaforma, alla voce «Valutazioni».
        </p>
      </>
    );
  }

  const quartieri =
    s.famiglia === "condizione" ? await getQuartieriPerVoto() : undefined;

  return (
    <>
      <Marca />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{s.nome}</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
        <MapPin size={14} aria-hidden className="shrink-0" />
        {riga.luogo}
      </p>

      <Card className="mt-5">
        <ModuloVoto
          servizioId={s.id}
          famiglia={s.famiglia}
          domanda={DOMANDA_FAMIGLIA[s.famiglia]}
          quartieri={quartieri}
          qrCodice={codice}
        />
      </Card>
    </>
  );
}
