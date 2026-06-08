import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Accedi" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  // Real (DB-backed) check: send already-authenticated users to the dashboard.
  if (await getCurrentUser()) redirect("/bilancio");

  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Bentornato</h1>
        <p className="mt-1.5 text-sm text-muted">
          Accedi alla Dashboard di Pistoia.
        </p>
      </div>

      <LoginForm next={next} />

      <div className="mt-7 rounded-[var(--radius-sm)] border border-dashed border-border-strong bg-surface-2/50 px-4 py-3 text-xs text-muted">
        <p className="font-semibold text-foreground">Account dimostrativi</p>
        <p className="mt-1">
          Cittadino: <code className="font-mono">cittadino@pistoia.it</code> ·{" "}
          <code className="font-mono">Pistoia2026</code>
        </p>
        <p>
          Comune (admin): <code className="font-mono">comune@pistoia.it</code> ·{" "}
          <code className="font-mono">Comune2026!</code>
        </p>
      </div>
    </div>
  );
}
