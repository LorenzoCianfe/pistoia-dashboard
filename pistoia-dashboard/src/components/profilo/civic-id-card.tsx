import Link from "next/link";
import {
  MapPin,
  Megaphone,
  Lightbulb,
  Vote,
  HeartHandshake,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  VerificationBadge,
  BadgeList,
  AccountTypeBadge,
} from "@/components/community/badges";
import { buttonClasses } from "@/components/ui/button";
import { CIVIC_TOPICS } from "@/lib/civic-topics";
import { publicNameOf } from "@/lib/community";
import { formatDate, formatNumber } from "@/lib/format";
import type { CurrentUser } from "@/lib/auth/dal";
import type { CivicImpact } from "@/lib/data/profile";
import type { CitizenBadge } from "@/generated/prisma/client";

// Civic ID Card (A2 §2): il passaporto civico personale. Sintetica, elegante,
// volutamente NON competitiva — racconta il proprio contributo, non classifica.

export function CivicIdCard({
  user,
  neighborhoodName,
  badges,
  impact,
}: {
  user: CurrentUser;
  neighborhoodName: string | null;
  badges: CitizenBadge[];
  impact: CivicImpact;
}) {
  const publicName = publicNameOf(user.name, user.publicName);

  const miniStats = [
    { label: "Segnalazioni inviate", value: impact.reports.total },
    { label: "Risolte", value: impact.reports.resolved },
    { label: "Consultazioni votate", value: impact.votes },
    { label: "Proposte sostenute", value: impact.supportsGiven },
  ];

  return (
    <Card className="overflow-hidden p-0">
      {/* Intestazione della carta */}
      <div className="gradient-teal-viola flex items-center justify-between gap-3 px-5 py-2.5 sm:px-6">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/95">
          Carta civica · Pistoia
        </p>
        {user.verifiedType ? (
          <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/95">
            <CheckCircle2 size={12} aria-hidden />
            Profilo verificato
          </p>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar name={user.name} color={user.avatarColor} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
              <AccountTypeBadge accountType={user.accountType} />
              {user.role === "ADMIN" ? <Badge color="red">Comune</Badge> : null}
              {user.role === "MODERATOR" ? <Badge color="teal">Moderatore</Badge> : null}
            </div>
            <p className="mt-0.5 text-sm text-muted">{user.email}</p>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-2 sm:justify-start">
              <span>
                Nome pubblico: <strong className="text-foreground/80">{publicName}</strong>
              </span>
              {neighborhoodName ? (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {neighborhoodName}
                </span>
              ) : null}
              <span>Cittadino dal {formatDate(user.createdAt)}</span>
            </p>
            {user.verifiedType ? (
              <div className="mt-2 flex justify-center sm:justify-start">
                <VerificationBadge type={user.verifiedType} />
              </div>
            ) : null}
            {user.bio ? <p className="mt-2 text-sm text-foreground/80">{user.bio}</p> : null}

            {/* Temi scelti (A2 §3) */}
            {user.civicInterests.length > 0 ? (
              <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                <span className="text-xs font-medium text-muted-2">Interessi:</span>
                {user.civicInterests.map((k) => (
                  <span
                    key={k}
                    className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted"
                  >
                    <span aria-hidden>{CIVIC_TOPICS[k].emoji}</span> {CIVIC_TOPICS[k].label}
                  </span>
                ))}
                <Link
                  href="/impostazioni#temi-civici"
                  aria-label="Modifica i tuoi temi"
                  className="text-teal hover:text-teal-strong"
                >
                  <Pencil size={12} aria-hidden />
                </Link>
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-2">
                <Link href="/impostazioni#temi-civici" className="font-semibold text-teal hover:underline">
                  Scegli i tuoi temi
                </Link>{" "}
                per personalizzare la tua home.
              </p>
            )}
            <BadgeList badges={badges} className="mt-3 justify-center sm:justify-start" />
          </div>
          <Link href="/impostazioni" className={buttonClasses("secondary", "sm")}>
            Impostazioni
          </Link>
        </div>

        {/* Numeri della carta */}
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
          {miniStats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <dd className="text-xl font-bold tabular-nums">{formatNumber(s.value)}</dd>
              <dt className="text-[11px] text-muted-2">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

// "Il mio impatto civico": gli esiti del proprio contributo, in frasi leggibili.

export function CivicImpactCard({ impact }: { impact: CivicImpact }) {
  const rows = [
    {
      icon: Megaphone,
      text:
        impact.reports.total === 0
          ? "Non hai ancora inviato segnalazioni: la prima è quella che conta di più."
          : `${impact.reports.resolved} delle tue ${impact.reports.total} segnalazioni ${
              impact.reports.resolved === 1 ? "è stata risolta" : "sono state risolte"
            }.`,
    },
    {
      icon: Lightbulb,
      text:
        impact.proposals.total === 0
          ? "Nessuna proposta per ora: hai un'idea per la città?"
          : `${impact.proposals.answered} delle tue ${impact.proposals.total} proposte ${
              impact.proposals.answered === 1 ? "ha ricevuto" : "hanno ricevuto"
            } una risposta ufficiale.`,
    },
    {
      icon: Vote,
      text:
        impact.votes === 0
          ? "Non hai ancora votato in sondaggi o consultazioni."
          : `Hai partecipato a ${impact.votes} ${
              impact.votes === 1 ? "consultazione o sondaggio" : "tra consultazioni e sondaggi"
            }.`,
    },
    {
      icon: HeartHandshake,
      text:
        impact.supportsGiven + impact.confirmationsGiven === 0
          ? "Sostieni le proposte e conferma le segnalazioni degli altri: il peso civico cresce insieme."
          : `Hai dato ${impact.supportsGiven} ${
              impact.supportsGiven === 1 ? "sostegno" : "sostegni"
            } alle proposte e ${impact.confirmationsGiven} ${
              impact.confirmationsGiven === 1 ? "conferma" : "conferme"
            } «Anche io».`,
    },
  ];

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <HeartHandshake size={18} className="text-teal" />
        Il mio impatto civico
      </h2>
      <ul className="mt-3 space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
              <r.icon size={14} aria-hidden />
            </span>
            <span className="text-foreground/85">{r.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-2">
        Il tuo contributo non è una classifica: ogni segnalazione, voto o sostegno
        aiuta il Comune a decidere meglio.
      </p>
    </Card>
  );
}
