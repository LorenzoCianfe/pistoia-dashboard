import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/app/footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
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
      <Footer />
    </div>
  );
}
