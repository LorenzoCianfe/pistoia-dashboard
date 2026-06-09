import type { Metadata } from "next";
import Link from "next/link";
import { User, MapPin, Vote, Megaphone, Lightbulb, UserPlus, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getProfileStats, getProfileExtras } from "@/lib/data/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profilo/profile-form";
import { VerificationRequest } from "@/components/profilo/verification-request";
import {
  VerificationBadge,
  BadgeList,
  AccountTypeBadge,
} from "@/components/community/badges";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { VERIFICATION_STATUS, VERIFICATION, publicNameOf } from "@/lib/community";

export const metadata: Metadata = { title: "Profilo" };

export default async function ProfiloPage() {
  const user = await requireUser();
  const [stats, extras] = await Promise.all([
    getProfileStats(user.id),
    getProfileExtras(user.id),
  ]);

  const activity = [
    { icon: Megaphone, label: "Segnalazioni", value: stats.reports },
    { icon: Lightbulb, label: "Proposte", value: stats.proposals },
    { icon: Vote, label: "Voti espressi", value: stats.votes },
    { icon: UserPlus, label: "Elementi seguiti", value: stats.follows },
  ];

  const publicName = publicNameOf(user.name, user.publicName);

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Il tuo account" title="Profilo" icon={<User size={22} />} />

      {/* Identity card */}
      <Card>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar name={user.name} color={user.avatarColor} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
              <AccountTypeBadge accountType={user.accountType} />
              {user.role === "ADMIN" ? <Badge color="red">Comune</Badge> : null}
              {user.role === "MODERATOR" ? <Badge color="teal">Moderatore</Badge> : null}
            </div>
            <p className="mt-0.5 text-sm text-muted">{user.email}</p>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-2 sm:justify-start">
              <span>Nome pubblico: <strong className="text-foreground/80">{publicName}</strong></span>
              {extras.neighborhoodName ? (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {extras.neighborhoodName}
                </span>
              ) : null}
              <span>Iscritto dal {formatDate(user.createdAt)}</span>
            </p>
            {user.verifiedType ? (
              <div className="mt-2 flex justify-center sm:justify-start">
                <VerificationBadge type={user.verifiedType} />
              </div>
            ) : null}
            {user.bio ? <p className="mt-2 text-sm text-foreground/80">{user.bio}</p> : null}
            <BadgeList badges={extras.badges} className="mt-3 justify-center sm:justify-start" />
          </div>
          <Link href="/impostazioni" className={buttonClasses("secondary", "sm")}>
            Impostazioni
          </Link>
        </div>
      </Card>

      {/* Activity */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {activity.map((a) => (
          <Card key={a.label} className="text-center">
            <a.icon size={20} className="mx-auto text-teal" />
            <p className="mt-2 text-2xl font-bold tabular-nums">{a.value}</p>
            <p className="text-xs text-muted">{a.label}</p>
          </Card>
        ))}
      </div>

      {/* Verification */}
      <Card>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Verifica del profilo</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          La verifica sblocca funzioni civiche (sostenere proposte, consultazioni ufficiali). In
          questa fase è <strong>simulata</strong> e approvata dal Comune.
        </p>

        {extras.verifications.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {extras.verifications.map((v) => {
              const status = VERIFICATION_STATUS[v.status] ?? { label: v.status, color: "teal" };
              return (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/40 px-3.5 py-2.5"
                >
                  <span className="text-sm font-medium">
                    {VERIFICATION[v.type]?.emoji} {VERIFICATION[v.type]?.label ?? v.type}
                  </span>
                  <Badge color={status.color}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-4 max-w-md">
          <VerificationRequest />
        </div>
      </Card>

      <ProfileForm user={user} />
    </div>
  );
}
