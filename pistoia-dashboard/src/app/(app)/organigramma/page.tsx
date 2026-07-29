import type { Metadata } from "next";
import { Network, Users, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOrg, type OrgMember } from "@/lib/data/organigramma";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/assessori/follow-button";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Organigramma" };

/*
  Questa pagina NON porta una cifra display, ed è una scelta motivata (Fase B,
  secondo scaglione). Le tre candidate cadono tutte:

  - le **aree di delega** coincidono con il numero di schede: un numero che il
    lettore ottiene guardando non aggiunge niente a 88px;
  - i **contattabili direttamente** sono 1 su 7, perché nel seed solo il sindaco
    ha un'email. È una riga vera, ma resa protagonista si legge «il Comune non
    si fa contattare» — una conclusione tratta da un dato mancante. È la
    famiglia di AGENTS.md §3 (ondata 7, 3): un rapporto su un campione minuscolo,
    messo in evidenza, diventa un'accusa;
  - **follower** e **preferenze** sono numeri su una singola persona.

  L'apertura la fa invece l'indice delle deleghe, che risponde alla domanda con
  cui si arriva qui — «di questo chi si occupa?» — meglio di qualunque totale.
*/
export default async function OrganigrammaPage() {
  const user = await requireUser();
  const org = await getOrg(user.id);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Chi governa la città"
        title="Organigramma"
        description="La giunta del Comune di Pistoia: chi ha la responsabilità di ogni area, e quante persone segue ciascun assessore."
        icon={<Network size={22} />}
      />

      {org.members.length > 0 ? (
        <Card>
          <CardEyebrow>Cosa copre la giunta</CardEyebrow>
          <ul className="mt-3 flex flex-wrap gap-2">
            {org.members.map((m) => (
              <li key={m.id}>
                <a
                  href={`#assessore-${m.id}`}
                  className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface-2/60 px-3 py-1.5 text-sm transition-colors hover:border-border-strong hover:bg-surface-2"
                >
                  <span className="font-medium">{m.area}</span>
                  <span className="text-xs text-muted-2">{m.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            Ogni area ha un assessore di riferimento, coordinato dal sindaco.
            Scrivi a chi si occupa della materia: è la strada più breve.
          </p>
        </Card>
      ) : null}

      {/* Sindaco */}
      {org.sindaco ? (
        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-[var(--red-soft)] opacity-60 blur-2xl" />
          <div className="relative flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:text-left">
            <Avatar
              initials={org.sindaco.initials}
              color={org.sindaco.color}
              size="xl"
            />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                {org.sindaco.role}
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                {org.sindaco.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {formatNumber(org.sindaco.followerCount)} follower
                </span>
                <span>
                  {formatNumber(org.sindaco.votesElected)} preferenze
                </span>
              </p>
            </div>
            <FollowButton
              assessoreId={org.sindaco.id}
              following={org.sindaco.followedByMe}
            />
          </div>
        </Card>
      ) : null}

      {/* Connector */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="h-6 w-px bg-border-strong" />
      </div>

      {/* Giunta */}
      <div>
        <h2 className="mb-3 px-1 text-base font-semibold">La giunta</h2>
        {/*
          `grid-cols-1` accanto alle varianti con prefisso: senza, sotto la
          soglia `sm` non esiste nessun grid-template-columns e la traccia
          implicita è `auto`, il cui minimo è il min-content. Basta un'email
          lunga e non spezzabile in una scheda per allargare la colonna oltre il
          viewport a 360px (AGENTS.md §3, ondata 7, 5).
        */}
        <div className="grid grid-cols-1 gap-4 stagger sm:grid-cols-2 lg:grid-cols-3">
          {org.members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: OrgMember }) {
  return (
    <Card
      hover
      id={`assessore-${member.id}`}
      className="flex scroll-mt-20 flex-col"
    >
      <div className="flex items-center gap-3">
        <Avatar initials={member.initials} color={member.color} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{member.name}</p>
          <p className="text-xs text-muted">{member.area}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{member.role}</p>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-2">
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {formatNumber(member.followerCount)} follower
        </span>
        {member.email ? (
          <span className="flex items-center gap-1.5 truncate">
            <Mail size={13} />
            <span className="truncate">{member.email}</span>
          </span>
        ) : null}
      </div>

      <div className="mt-4 pt-1">
        <FollowButton
          assessoreId={member.id}
          following={member.followedByMe}
          className="w-full justify-center"
        />
      </div>
    </Card>
  );
}
