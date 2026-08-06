import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { Footer } from "@/components/app/footer";

/*
  Le pagine legali si aprono a chiunque, e sono l'atterraggio dell'informativa
  linkata dal modulo di voto del QR — dove per decisione esplicita non c'è un
  account (R-3, 2026-08-03). Da qui `getCurrentUser()`: senza, il footer
  mostrerebbe l'invito ad accedere anche a chi è già dentro.
*/
export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Torna alla home
        </Link>
        <article className="mt-6 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-sm [&_li]:text-muted">
          {children}
        </article>
      </div>
      {/* Il footer non si impagina da sé (vedi il suo commento in testa):
          qui l'involucro è la stessa colonna del testo legale. */}
      <div className="mx-auto max-w-2xl px-4 pb-10">
        <Footer autenticato={!!user} />
      </div>
    </div>
  );
}
