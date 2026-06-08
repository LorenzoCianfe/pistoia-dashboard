import type { Metadata } from "next";
import Link from "next/link";
import { User, MapPin, Vote, MessageSquare, Heart, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getProfileStats } from "@/lib/data/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profilo/profile-form";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profilo" };

export default async function ProfiloPage() {
  const user = await requireUser();
  const stats = await getProfileStats(user.id);

  const activity = [
    { icon: Vote, label: "Voti espressi", value: stats.votes },
    { icon: MessageSquare, label: "Domande", value: stats.posts },
    { icon: Heart, label: "Like messi", value: stats.likes },
    { icon: UserPlus, label: "Assessori seguiti", value: stats.follows },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Il tuo account"
        title="Profilo"
        icon={<User size={22} />}
      />

      {/* Identity card */}
      <Card>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar name={user.name} color={user.avatarColor} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
              {user.role === "ADMIN" ? (
                <Badge color="red">Comune</Badge>
              ) : (
                <Badge color="teal">Cittadino</Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted">{user.email}</p>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-2 sm:justify-start">
              {user.quartiere ? (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {user.quartiere}
                </span>
              ) : null}
              <span>Iscritto dal {formatDate(user.createdAt)}</span>
            </p>
            {user.bio ? (
              <p className="mt-2 text-sm text-foreground/80">{user.bio}</p>
            ) : null}
          </div>
          <Link
            href="/impostazioni"
            className={buttonClasses("secondary", "sm")}
          >
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

      <ProfileForm user={user} />
    </div>
  );
}
