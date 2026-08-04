import { requireUser } from "@/lib/auth/dal";
import { AppShell } from "@/components/app/app-shell";

/*
  Il gruppo autenticato: TUTTO ciò che sta qui dentro esige una sessione, e
  il guard vero è questo `requireUser` — il proxy fa solo il controllo
  ottimistico sul cookie. Il guscio (barra, navigazione, footer, tour) vive
  in `AppShell`, condiviso col gruppo `(pubblico)` che lo rende agli
  autenticati: una definizione sola, due porte (R-5, decisione W1).
*/
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
