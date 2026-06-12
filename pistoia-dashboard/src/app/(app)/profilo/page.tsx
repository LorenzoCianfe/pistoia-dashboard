import type { Metadata } from "next";
import { User, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getProfileExtras, getCivicImpact } from "@/lib/data/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ProfileForm } from "@/components/profilo/profile-form";
import { VerificationRequest } from "@/components/profilo/verification-request";
import { CivicIdCard, CivicImpactCard } from "@/components/profilo/civic-id-card";
import { VERIFICATION_STATUS, VERIFICATION } from "@/lib/community";

export const metadata: Metadata = { title: "Profilo" };

export default async function ProfiloPage() {
  const user = await requireUser();
  const [extras, impact] = await Promise.all([
    getProfileExtras(user.id),
    getCivicImpact(user.id),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Il tuo account" title="Profilo" icon={<User size={22} />} />

      {/* Carta civica (A2 §2) */}
      <CivicIdCard
        user={user}
        neighborhoodName={extras.neighborhoodName}
        badges={extras.badges}
        impact={impact}
      />

      {/* Il mio impatto civico */}
      <CivicImpactCard impact={impact} />

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
