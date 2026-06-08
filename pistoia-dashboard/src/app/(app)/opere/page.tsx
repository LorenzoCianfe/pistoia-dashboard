import type { Metadata } from "next";
import { HardHat, MapPin, ArrowUpRight } from "lucide-react";
import { getOpere, TOTALE_CANTIERI_CENSITI, type OperaItem } from "@/lib/data/opere";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Stat } from "@/components/ui/stat";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatEuroCompact, formatDateShort } from "@/lib/format";
import { operaStatus, operaCategory } from "@/lib/labels";

export const metadata: Metadata = { title: "Opere" };

export default async function OperePage() {
  const data = await getOpere();
  const others = data.opere.filter((o) => !o.featured);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="I cantieri in corso"
        title="Opere pubbliche"
        description="Lo stato dei lavori nella tua città, aggiornato cantiere per cantiere."
        icon={<HardHat size={22} />}
      />

      {/* Hero */}
      <Card>
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div>
            <p className="text-sm font-medium text-muted">Cantieri censiti</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl">
              <AnimatedNumber value={TOTALE_CANTIERI_CENSITI} />
            </p>
            <p className="mt-1 text-sm text-muted-2">
              di cui{" "}
              <span className="font-semibold text-teal">{data.inCorsoCount}</span>{" "}
              in corso di esecuzione
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Investimento in corso"
              value={formatEuroCompact(data.totalInvestmentInCorso)}
            />
            <Stat label="Avanzamento medio" value={`${data.avgProgress}%`} />
            <Stat
              label="Nuovi questo mese"
              value={`+${data.nuoviQuestoMese}`}
              trend={{ value: "mese", direction: "up" }}
            />
          </div>
        </div>
      </Card>

      {/* Cantieri in evidenza */}
      <Card>
        <h2 className="text-base font-semibold">In evidenza</h2>
        <p className="text-sm text-muted">I cantieri più seguiti dalla città.</p>
        <ul className="mt-5 divide-y divide-border">
          {data.featured.map((o, i) => (
            <FeaturedRow key={o.id} opera={o} index={i} />
          ))}
        </ul>
      </Card>

      {/* Altri cantieri */}
      <div>
        <h2 className="mb-3 px-1 text-base font-semibold">Tutti i cantieri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {others.map((o, i) => (
            <OperaCard key={o.id} opera={o} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedRow({ opera, index }: { opera: OperaItem; index: number }) {
  const status = operaStatus(opera.status);
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{opera.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} />
            {opera.location ?? "Pistoia"} · {operaCategory(opera.category)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tabular-nums leading-none">
            <AnimatedNumber value={opera.progress} delay={index * 0.08} />%
          </p>
          <Badge color={status.color} className="mt-1.5">
            {status.label}
          </Badge>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={opera.progress} delay={index * 0.12} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-2">
        <span>{formatEuroCompact(opera.investment)} di investimento</span>
        {opera.expectedEnd ? (
          <span>Fine prevista: {formatDateShort(opera.expectedEnd)}</span>
        ) : null}
      </div>
    </li>
  );
}

function OperaCard({ opera, index }: { opera: OperaItem; index: number }) {
  const status = operaStatus(opera.status);
  return (
    <Card hover className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <Badge color="teal" soft className="bg-surface-2">
          {operaCategory(opera.category)}
        </Badge>
        <Badge color={status.color}>{status.label}</Badge>
      </div>
      <h3 className="mt-3 font-semibold leading-snug">{opera.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{opera.description}</p>

      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted">
            <MapPin size={13} />
            {opera.location ?? "Pistoia"}
          </span>
          <span className="font-bold tabular-nums">{opera.progress}%</span>
        </div>
        <ProgressBar value={opera.progress} delay={index * 0.05} height={8} />
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-2">
          <ArrowUpRight size={12} />
          {formatEuroCompact(opera.investment)} di investimento
        </p>
      </div>
    </Card>
  );
}
