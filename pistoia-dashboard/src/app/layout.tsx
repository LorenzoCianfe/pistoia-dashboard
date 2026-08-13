import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SIMPLE_MODE_COOKIE } from "@/lib/ui-prefs";

// Voce della piattaforma (DESIGN.md §3): Schibsted Grotesk, grottesco di
// matrice editoriale — disegnato per la lettura di interesse pubblico. Regge
// sia la label da 11px sia la cifra display da 80px, e ha una copertura piena
// dei diacritici italiani. Sostituisce Montserrat (revisione 2026-07-25).
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Voce tecnica: numeri di protocollo, coordinate, timestamp, importi tabellari.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Il nome è il marchio, non l'ente: «Pistoia.app» parla DI Pistoia e non PER
// il Comune (`direzione-prodotto.md` §1.4). `authors` in particolare non può
// più dire «Comune di Pistoia»: sarebbe una dichiarazione di paternità falsa
// nei metadati, cioè esattamente ciò che §1.4 vieta.
export const metadata: Metadata = {
  title: {
    default: "Pistoia.app — la città, sui dati veri",
    template: "%s · Pistoia.app",
  },
  description:
    "I dati pubblici di Pistoia, finalmente leggibili: gli atti del Comune, i soldi, i cantieri e la città che si risponde. Un progetto civico indipendente.",
  applicationName: "Pistoia.app",
  authors: [{ name: "Redazione di Pistoia.app" }],
  keywords: ["Pistoia", "atti", "comune", "bilancio", "opere", "trasparenza", "cittadini"],
};

export const viewport: Viewport = {
  // Allineati alla tela (DESIGN.md §5): la cornice del browser continua la
  // superficie invece di interromperla.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8e7e4" },
    { media: "(prefers-color-scheme: dark)", color: "#131211" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce CSP generato per-request dal proxy: next-themes lo usa per il suo
  // script inline anti-FOUC, che altrimenti la CSP bloccherebbe.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // Modalità semplice (A1 §19): la classe arriva dal server, prima del paint.
  const simpleMode =
    (await cookies()).get(SIMPLE_MODE_COOKIE)?.value === "1";

  return (
    <html
      lang="it"
      suppressHydrationWarning
      // `data-astryx-theme` è statico e scritto qui, lato server: i token del
      // tema vivono in un blocco @scope agganciato a questo attributo, quindi
      // senza di esso lo sfondo del <body> non avrebbe i token già al primo
      // paint. Astryx lo sincronizzerebbe da solo, ma solo dopo l'hydration.
      data-astryx-theme="pistoia"
      className={`${schibsted.variable} ${jetbrains.variable} h-full antialiased${simpleMode ? " simple-mode" : ""}`}
    >
      <body className="min-h-full">
        <ThemeProvider
          // Due attributi: `class` per le variant `dark:` di Tailwind usate
          // dalle rotte esistenti, `data-theme` per il light-dark() di Astryx.
          attribute={["class", "data-theme"]}
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
